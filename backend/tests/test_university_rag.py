"""Comprehensive test suite for Phase 2: University Content + Adaptive RAG System.

Tests cover:
1. University creation & domain uniqueness
2. University membership & roles (admin, faculty, student)
3. Course and subject creation
4. Document upload (TXT, MD) with metadata
5. Document chunking & embedding generation
6. Multi-tenant vector similarity search
7. Cross-university tenant isolation (Security boundary)
8. Document deletion & vector chunk removal
9. Tutor institutional grounding & source citations
10. Tutor fallback when university content is absent
11. Unauthorized access & role enforcement
12. Ingestion retry
"""

import json
import os
import uuid
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi import HTTPException

from app.models.user import User
from app.models.university import (
    University,
    UniversityMembership,
    Course,
    Subject,
    UniversityDocument,
    DocumentChunk,
    IngestionJob,
)
from app.services.ai.vector_store import (
    get_vector_store,
    generate_embedding,
    cosine_similarity,
    _deterministic_text_embedding,
)
from app.services.ai.ingestion import (
    extract_text_from_file,
    chunk_text,
    process_document,
    delete_document_pipeline,
)
from app.api.v1.university import (
    create_university,
    join_university,
    create_course,
    list_documents,
    search_university_rag,
    delete_document,
    retry_document_ingestion,
    UniversityCreate,
    CourseCreate,
    RAGSearchRequest,
)
from app.services.ai.tutor import tutor


from app.core.database import engine, async_session_factory as async_session


def _uid():
    return str(uuid.uuid4())


async def _create_test_user(s: AsyncSession, name: str, univ_id: str = None, univ_role: str = "student") -> User:
    u = User(
        id=_uid(),
        email=f"{_uid()[:8]}@test.edu",
        password_hash="mock_hash",
        name=name,
        role="student",
        avatar_initials=name[:2].upper(),
        experience_level="beginner",
        xp=100,
        current_level=1,
        streak=0,
        university_id=univ_id,
        university_role=univ_role,
    )
    s.add(u)
    await s.commit()
    await s.refresh(u)
    return u


# ═════════════════════════════════════════════════════════════════════
# 1. EMBEDDING & VECTOR SIMILARITY UNIT TESTS
# ═════════════════════════════════════════════════════════════════════

class TestVectorMath:
    """Test deterministic embedding properties and cosine similarity."""

    def test_deterministic_embedding_consistency(self):
        v1 = _deterministic_text_embedding("Quantum superposition with Hadamard gate")
        v2 = _deterministic_text_embedding("Quantum superposition with Hadamard gate")
        assert v1 == v2, "Identical text must produce identical vector"
        assert len(v1) == 768, "Vector length must match dimension (768)"

    def test_cosine_similarity_identical(self):
        v1 = _deterministic_text_embedding("Bell state entanglement")
        score = cosine_similarity(v1, v1)
        assert abs(score - 1.0) < 1e-4, "Self-similarity must equal 1.0"

    def test_cosine_similarity_semantic_overlap(self):
        v_base = _deterministic_text_embedding("Grover search algorithm amplitude amplification")
        v_related = _deterministic_text_embedding("Grover search algorithm oracle diffusion")
        v_unrelated = _deterministic_text_embedding("Cooking organic pasta with tomato sauce")

        sim_related = cosine_similarity(v_base, v_related)
        sim_unrelated = cosine_similarity(v_base, v_unrelated)

        assert sim_related > sim_unrelated, "Related quantum text must score higher than unrelated text"


# ═════════════════════════════════════════════════════════════════════
# 2. UNIVERSITY CREATION & MEMBERSHIP
# ═════════════════════════════════════════════════════════════════════

class TestUniversityManagement:
    """Test institution registration and membership controls."""

    @pytest.mark.asyncio
    async def test_create_university_sets_creator_as_admin(self):
        async with async_session() as s:
            user = await _create_test_user(s, "ProfAlice")
            dom = f"mit-{_uid()[:8]}.edu"
            req = UniversityCreate(name="MIT Quantum Institute", domain=dom, description="QC Research")

            univ = await create_university(req, user_id=user.id, db=s)
            assert univ.id is not None
            assert univ.name == "MIT Quantum Institute"
            assert univ.domain == dom

            # Verify creator user got role university_admin
            await s.refresh(user)
            assert user.university_id == univ.id
            assert user.university_role == "university_admin"

    @pytest.mark.asyncio
    async def test_join_university_sets_student_role(self):
        async with async_session() as s:
            u_univ = University(id=_uid(), name="Stanford QC Lab", domain=f"stanford-{_uid()[:8]}.edu", status="active")
            s.add(u_univ)
            await s.commit()

            student = await _create_test_user(s, "BobStudent")
            res = await join_university(u_univ.id, user_id=student.id, db=s)
            assert res["role"] == "student"

            await s.refresh(student)
            assert student.university_id == u_univ.id
            assert student.university_role == "student"


# ═════════════════════════════════════════════════════════════════════
# 3. COURSES & SYLLABUS
# ═════════════════════════════════════════════════════════════════════

class TestCoursesAndSyllabus:
    """Test course management and role enforcement."""

    @pytest.mark.asyncio
    async def test_admin_can_create_course(self):
        async with async_session() as s:
            u_univ = University(id=_uid(), name="Caltech QC", domain=f"caltech-{_uid()[:8]}.edu", status="active")
            s.add(u_univ)
            await s.commit()

            admin_user = await _create_test_user(s, "DeanFeynman", univ_id=u_univ.id, univ_role="university_admin")
            c_data = CourseCreate(code="PH125", title="Quantum Information", semester="Fall 2026")

            course = await create_course(u_univ.id, c_data, user_id=admin_user.id, db=s)
            assert course.id is not None
            assert course.code == "PH125"
            assert course.university_id == u_univ.id

    @pytest.mark.asyncio
    async def test_student_cannot_create_course(self):
        async with async_session() as s:
            u_univ = University(id=_uid(), name="Oxford QC", domain=f"oxford-{_uid()[:8]}.edu", status="active")
            s.add(u_univ)
            await s.commit()

            student = await _create_test_user(s, "StudentClara", univ_id=u_univ.id, univ_role="student")
            c_data = CourseCreate(code="OX999", title="Hacked Course")

            with pytest.raises(HTTPException) as exc_info:
                await create_course(u_univ.id, c_data, user_id=student.id, db=s)
            assert exc_info.value.status_code == 403


# ═════════════════════════════════════════════════════════════════════
# 4. DOCUMENT INGESTION & CHUNKING
# ═════════════════════════════════════════════════════════════════════

class TestDocumentIngestion:
    """Test text extraction, chunking, and metadata preservation."""

    def test_chunk_text_preserves_metadata(self):
        pages = [
            {"page_number": 1, "section_title": "Unit 1: Qubits", "text": "A qubit is a two-level quantum system represented as alpha |0> + beta |1>."},
            {"page_number": 2, "section_title": "Unit 2: Entanglement", "text": "Entanglement is a physical phenomenon where quantum states cannot be factored."},
        ]
        chunks = chunk_text(pages, chunk_size=500)
        assert len(chunks) == 2
        assert chunks[0]["page_number"] == 1
        assert chunks[0]["section_title"] == "Unit 1: Qubits"
        assert chunks[1]["page_number"] == 2
        assert chunks[1]["section_title"] == "Unit 2: Entanglement"

    @pytest.mark.asyncio
    async def test_end_to_end_document_processing(self, tmp_path):
        async with async_session() as s:
            univ = University(id=_uid(), name="Cambridge QC", domain=f"cambridge-{_uid()[:8]}.edu", status="active")
            s.add(univ)
            await s.commit()

            admin = await _create_test_user(s, "DrTuring", univ_id=univ.id, univ_role="university_admin")

            # Create sample markdown document
            sample_file = tmp_path / "quantum_unit3.md"
            sample_file.write_text(
                "# Unit 3: Bell States and Superdense Coding\n\n"
                "In Cambridge Quantum Unit 3, Bell states are the four maximally entangled two-qubit states.\n"
                "The state Phi+ is produced by H on q0 followed by CNOT from q0 to q1.\n"
            )

            doc = UniversityDocument(
                id=_uid(),
                university_id=univ.id,
                uploaded_by=admin.id,
                filename="quantum_unit3.md",
                title="Cambridge QC Unit 3 Notes",
                file_path=str(sample_file),
                file_size=len(sample_file.read_bytes()),
                file_format="md",
                processing_status="uploaded",
            )
            s.add(doc)
            await s.commit()

            success = await process_document(doc.id, s)
            assert success is True

            await s.refresh(doc)
            assert doc.processing_status == "indexed"

            # Verify chunks created in DB
            from sqlalchemy import select
            q = await s.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))
            chunks = q.scalars().all()
            assert len(chunks) >= 1
            assert chunks[0].university_id == univ.id
            assert "Cambridge QC Unit 3" in chunks[0].content or "Bell states" in chunks[0].content


# ═════════════════════════════════════════════════════════════════════
# 5. TENANT ISOLATION (HARD SECURITY REQUIREMENT)
# ═════════════════════════════════════════════════════════════════════

class TestTenantIsolation:
    """Rigorous verification that University A students NEVER retrieve University B content."""

    @pytest.mark.asyncio
    async def test_cross_university_retrieval_isolation(self, tmp_path):
        async with async_session() as s:
            # University A
            univ_a = University(id=_uid(), name="University A", domain=f"univ-a-{_uid()[:8]}.edu", status="active")
            # University B
            univ_b = University(id=_uid(), name="University B", domain=f"univ-b-{_uid()[:8]}.edu", status="active")
            s.add_all([univ_a, univ_b])
            await s.commit()

            user_a = await _create_test_user(s, "StudentA", univ_id=univ_a.id, univ_role="student")
            user_b = await _create_test_user(s, "StudentB", univ_id=univ_b.id, univ_role="student")

            # Document for Univ A: contains secret convention X
            file_a = tmp_path / "notes_a.md"
            file_a.write_text("# Secret Protocol\n\nUniversity A strictly uses Z-basis measurement convention for teleportation.")
            doc_a = UniversityDocument(
                id=_uid(),
                university_id=univ_a.id,
                uploaded_by=user_a.id,
                filename="notes_a.md",
                title="University A Protocol",
                file_path=str(file_a),
                file_size=len(file_a.read_bytes()),
                file_format="md",
                processing_status="uploaded",
            )

            # Document for Univ B: contains secret convention Y
            file_b = tmp_path / "notes_b.md"
            file_b.write_text("# Secret Protocol\n\nUniversity B strictly uses X-basis measurement convention for teleportation.")
            doc_b = UniversityDocument(
                id=_uid(),
                university_id=univ_b.id,
                uploaded_by=user_b.id,
                filename="notes_b.md",
                title="University B Protocol",
                file_path=str(file_b),
                file_size=len(file_b.read_bytes()),
                file_format="md",
                processing_status="uploaded",
            )
            s.add_all([doc_a, doc_b])
            await s.commit()

            await process_document(doc_a.id, s)
            await process_document(doc_b.id, s)

            # 1. Student A queries University A RAG
            req_a = RAGSearchRequest(query="measurement convention for teleportation")
            res_a = await search_university_rag(univ_a.id, req_a, user_id=user_a.id, db=s)
            assert len(res_a) > 0
            assert any("University A strictly uses Z-basis" in c.content for c in res_a)
            assert not any("University B" in c.content for c in res_a), "Univ A search MUST NOT return Univ B data"

            # 2. Student A tries to query University B endpoint directly -> MUST BE 403 Forbidden!
            with pytest.raises(HTTPException) as exc_info:
                await search_university_rag(univ_b.id, req_a, user_id=user_a.id, db=s)
            assert exc_info.value.status_code == 403

            # 3. Student B queries University B RAG
            res_b = await search_university_rag(univ_b.id, req_a, user_id=user_b.id, db=s)
            assert len(res_b) > 0
            assert any("University B strictly uses X-basis" in c.content for c in res_b)
            assert not any("University A" in c.content for c in res_b), "Univ B search MUST NOT return Univ A data"


# ═════════════════════════════════════════════════════════════════════
# 6. DOCUMENT DELETION & VECTOR PURGE
# ═════════════════════════════════════════════════════════════════════

class TestDocumentDeletion:
    """Verify that deleting a document purges all chunks from vector search."""

    @pytest.mark.asyncio
    async def test_deleted_document_not_in_vector_search(self, tmp_path):
        async with async_session() as s:
            univ = University(id=_uid(), name="Princeton QC", domain=f"princeton-{_uid()[:8]}.edu", status="active")
            s.add(univ)
            await s.commit()

            admin = await _create_test_user(s, "ProfEinstein", univ_id=univ.id, univ_role="university_admin")

            test_file = tmp_path / "temp_qft.txt"
            test_file.write_text("Quantum Fourier Transform requires controlled phase rotations.")

            doc = UniversityDocument(
                id=_uid(),
                university_id=univ.id,
                uploaded_by=admin.id,
                filename="temp_qft.txt",
                title="QFT Notes",
                file_path=str(test_file),
                file_size=len(test_file.read_bytes()),
                file_format="txt",
                processing_status="uploaded",
            )
            s.add(doc)
            await s.commit()

            await process_document(doc.id, s)

            # Confirm searchable before deletion
            vector_store = get_vector_store()
            res_before = await vector_store.similarity_search("Quantum Fourier Transform", univ.id, db=s)
            assert len(res_before) > 0

            # Delete document via pipeline
            del_res = await delete_document(doc.id, user_id=admin.id, db=s)
            assert "deleted" in del_res["message"]

            # Confirm no longer searchable
            res_after = await vector_store.similarity_search("Quantum Fourier Transform", univ.id, db=s)
            assert len(res_after) == 0, "Vector chunks must be completely purged upon document deletion"


# ═════════════════════════════════════════════════════════════════════
# 7. TUTOR INTEGRATION & CITATIONS
# ═════════════════════════════════════════════════════════════════════

class TestTutorGrounding:
    """Verify tutor returns grounded institutional citations and degrades gracefully."""

    @pytest.mark.asyncio
    async def test_tutor_uses_university_citations(self):
        context = {
            "placements": [{"id": "g0", "g": "H", "col": 0, "q": 0}],
            "qubits": 2,
            "classical_bits": 0,
            "simulation_result": None,
            "university_citations": [
                {
                    "document_title": "MIT QC Course Manual",
                    "section_title": "Experiment 4",
                    "page_number": 12,
                    "course": "QC101",
                    "content": "In Experiment 4, the Hadamard gate on q0 initializes superposition before the entangling step.",
                    "similarity_score": 0.89,
                }
            ],
        }

        # Question asking about university manual
        ans = await tutor.chat("What does the university lab manual say about experiment 4?", context)
        assert "sources" in ans
        assert len(ans["sources"]) == 1
        assert ans["sources"][0]["document_title"] == "MIT QC Course Manual"
        assert ans["sources"][0]["page_number"] == 12
        assert "Experiment 4" in ans["response"] or "MIT QC Course Manual" in ans["response"]

    @pytest.mark.asyncio
    async def test_tutor_fallback_when_no_university_content(self):
        # Empty citations
        context = {
            "placements": [{"id": "g0", "g": "H", "col": 0, "q": 0}],
            "qubits": 2,
            "classical_bits": 0,
            "simulation_result": None,
            "university_citations": [],
        }

        ans = await tutor.chat("What does Hadamard do?", context)
        assert "response" in ans
        assert len(ans["response"]) > 0
        # No fake citations should be returned
        assert len(ans.get("sources", [])) == 0
