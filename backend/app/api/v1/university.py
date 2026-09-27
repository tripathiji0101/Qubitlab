"""University Management, Syllabus, Document Ingestion, and RAG APIs.

Strict multi-tenant isolation:
- All content and vector retrieval is bound to university_id
- Cross-tenant access is rejected with HTTP 403
- Role-based permissions (university_admin, faculty, student)
"""

from datetime import datetime, timezone
import json
import os
import shutil
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, BackgroundTasks, status
from pydantic import BaseModel, Field
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.logging import logger
from app.models.user import User
from app.models.university import (
    University,
    UniversityMembership,
    Course,
    Subject,
    Unit,
    Topic,
    UniversityDocument,
    DocumentChunk,
    IngestionJob,
)
from app.services.ai.ingestion import process_document, delete_document_pipeline, get_ingestion_worker
from app.services.storage import get_document_storage
from app.services.ai.vector_store import get_vector_store
from app.api.v1.auth import get_current_user_id

router = APIRouter(prefix="/universities", tags=["universities"])


# ─── SCHEMAS ───────────────────────────────────────────────────────

class UniversityCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    domain: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    logo: Optional[str] = None


class UniversityResponse(BaseModel):
    id: str
    name: str
    domain: str
    description: Optional[str] = None
    logo: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None


class CourseCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None


class CourseResponse(BaseModel):
    id: str
    university_id: str
    code: str
    title: str
    description: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    created_at: Optional[datetime] = None


class SubjectCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    name: Optional[str] = None
    title: Optional[str] = None  # alias
    semester: int = Field(1, ge=1, le=12)
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    id: str
    course_id: str
    code: str
    name: str
    semester: int
    description: Optional[str] = None
    created_at: Optional[datetime] = None


class UnitCreate(BaseModel):
    unit_number: int = Field(..., ge=1)
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    order_index: Optional[int] = 0


class UnitResponse(BaseModel):
    id: str
    subject_id: str
    unit_number: int
    title: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None


class TopicCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    order: Optional[int] = 0
    order_index: Optional[int] = None
    topic_number: Optional[int] = None


class TopicResponse(BaseModel):
    id: str
    unit_id: str
    title: str
    description: Optional[str] = None
    order: int
    created_at: Optional[datetime] = None


class DocumentResponse(BaseModel):
    id: str
    university_id: str
    uploaded_by: Optional[str] = None
    filename: str
    title: str
    subject_id: Optional[str] = None
    course_id: Optional[str] = None
    unit_id: Optional[str] = None
    topic_id: Optional[str] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None
    content_type: str
    file_size: int
    file_format: str
    version: int = 1
    processing_status: str
    error_message: Optional[str] = None
    chunk_count: int = 0
    created_at: Optional[datetime] = None


class RAGSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    course_id: Optional[str] = None
    subject_id: Optional[str] = None
    limit: int = Field(5, ge=1, le=20)


class RAGCitation(BaseModel):
    document_id: str
    document_title: str
    chunk_index: int
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    subject: Optional[str] = None
    course: Optional[str] = None
    content: str
    similarity_score: float


# ─── HELPER: PERMISSIONS & TENANT CHECK ─────────────────────────────

async def _get_user(user_id: str, db: AsyncSession) -> User:
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def _verify_tenant_access(user: User, university_id: str, required_roles: Optional[List[str]] = None) -> None:
    """Strictly verify user belongs to the requested university and holds required role."""
    if user.university_id != university_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not belong to this institution.",
        )
    if required_roles and user.university_role not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Requires one of roles {required_roles}, your role is '{user.university_role}'",
        )


# ─── UNIVERSITY ROUTES ─────────────────────────────────────────────

@router.get("", response_model=List[UniversityResponse])
async def list_universities(db: AsyncSession = Depends(get_db)):
    """List all registered educational institutions."""
    stmt = select(University).where(University.status == "active").order_by(University.name)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
async def create_university(
    data: UniversityCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Register a new university entity."""
    user = await _get_user(user_id, db)
    # Check if domain already exists
    existing = await db.execute(select(University).where(University.domain == data.domain))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="University with this domain already exists.")

    univ = University(
        id=str(uuid.uuid4()),
        name=data.name,
        domain=data.domain.lower().strip(),
        description=data.description,
        logo=data.logo,
        status="active",
    )
    db.add(univ)

    # Automatically set creator as university_admin
    user.university_id = univ.id
    user.university_role = "university_admin"

    membership = UniversityMembership(
        id=str(uuid.uuid4()),
        university_id=univ.id,
        user_id=user.id,
        role="university_admin",
    )
    db.add(membership)
    await db.commit()
    await db.refresh(univ)
    return univ


@router.get("/{university_id}", response_model=UniversityResponse)
async def get_university(university_id: str, db: AsyncSession = Depends(get_db)):
    """Get university institutional details."""
    res = await db.execute(select(University).where(University.id == university_id))
    univ = res.scalar_one_or_none()
    if not univ:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
    return univ


@router.post("/{university_id}/join")
async def join_university(
    university_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Enrolls current authenticated student into a university."""
    user = await _get_user(user_id, db)
    res = await db.execute(select(University).where(University.id == university_id))
    univ = res.scalar_one_or_none()
    if not univ:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")

    user.university_id = univ.id
    user.university_role = "student"

    # Add or update membership
    mem_res = await db.execute(
        select(UniversityMembership).where(
            and_(
                UniversityMembership.university_id == univ.id,
                UniversityMembership.user_id == user.id,
            )
        )
    )
    existing_mem = mem_res.scalar_one_or_none()
    if not existing_mem:
        membership = UniversityMembership(
            id=str(uuid.uuid4()),
            university_id=univ.id,
            user_id=user.id,
            role="student",
        )
        db.add(membership)

    await db.commit()
    return {"message": f"Successfully joined {univ.name}", "role": "student"}


# ─── COURSE & SYLLABUS ROUTES ──────────────────────────────────────

@router.get("/{university_id}/courses", response_model=List[CourseResponse])
async def list_courses(
    university_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all courses offered by this university."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id)

    stmt = select(Course).where(Course.university_id == university_id).order_by(Course.code)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/{university_id}/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    university_id: str,
    data: CourseCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new university course (Admin or Faculty only)."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id, required_roles=["university_admin", "faculty"])

    course = Course(
        id=str(uuid.uuid4()),
        university_id=university_id,
        code=data.code.upper().strip(),
        title=data.title,
        description=data.description,
        academic_year=data.academic_year,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


# ─── SUBJECT ROUTES ───────────────────────────────────────────────

@router.get("/{university_id}/courses/{course_id}/subjects", response_model=List[SubjectResponse])
async def list_course_subjects(
    university_id: str,
    course_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all subjects under a course, tenant-verified."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id)

    # Verify course belongs to this university
    c_res = await db.execute(select(Course).where(and_(Course.id == course_id, Course.university_id == university_id)))
    if not c_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found in this university.")

    stmt = select(Subject).where(Subject.course_id == course_id).order_by(Subject.semester, Subject.code)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/{university_id}/courses/{course_id}/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_course_subject(
    university_id: str,
    course_id: str,
    data: SubjectCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a subject under a course (Admin or Faculty only)."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id, required_roles=["university_admin", "faculty"])

    c_res = await db.execute(select(Course).where(and_(Course.id == course_id, Course.university_id == university_id)))
    if not c_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found in this university.")

    name = data.name or data.title or data.code
    subject = Subject(
        id=str(uuid.uuid4()),
        course_id=course_id,
        code=data.code.upper().strip(),
        name=name,
        semester=data.semester,
        description=data.description,
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


# ─── UNIT ROUTES ──────────────────────────────────────────────────

@router.get("/{university_id}/subjects/{subject_id}/units", response_model=List[UnitResponse])
async def list_subject_units(
    university_id: str,
    subject_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List curriculum units under a subject, tenant-verified."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id)

    stmt = (
        select(Subject)
        .join(Course, Subject.course_id == Course.id)
        .where(and_(Subject.id == subject_id, Course.university_id == university_id))
    )
    s_res = await db.execute(stmt)
    if not s_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found in this university.")

    units_stmt = select(Unit).where(Unit.subject_id == subject_id).order_by(Unit.unit_number)
    res = await db.execute(units_stmt)
    return res.scalars().all()


@router.post("/{university_id}/subjects/{subject_id}/units", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_subject_unit(
    university_id: str,
    subject_id: str,
    data: UnitCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a unit under a subject (Admin or Faculty only)."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id, required_roles=["university_admin", "faculty"])

    stmt = (
        select(Subject)
        .join(Course, Subject.course_id == Course.id)
        .where(and_(Subject.id == subject_id, Course.university_id == university_id))
    )
    s_res = await db.execute(stmt)
    if not s_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found in this university.")

    unit = Unit(
        id=str(uuid.uuid4()),
        subject_id=subject_id,
        unit_number=data.unit_number,
        title=data.title,
        description=data.description,
    )
    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    return unit


# ─── TOPIC ROUTES ─────────────────────────────────────────────────

@router.get("/{university_id}/units/{unit_id}/topics", response_model=List[TopicResponse])
async def list_unit_topics(
    university_id: str,
    unit_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List topics under a curriculum unit, tenant-verified."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id)

    stmt = (
        select(Unit)
        .join(Subject, Unit.subject_id == Subject.id)
        .join(Course, Subject.course_id == Course.id)
        .where(and_(Unit.id == unit_id, Course.university_id == university_id))
    )
    u_res = await db.execute(stmt)
    if not u_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found in this university.")

    topics_stmt = select(Topic).where(Topic.unit_id == unit_id).order_by(Topic.order)
    res = await db.execute(topics_stmt)
    return res.scalars().all()


@router.post("/{university_id}/units/{unit_id}/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_unit_topic(
    university_id: str,
    unit_id: str,
    data: TopicCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a topic under a unit (Admin or Faculty only)."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id, required_roles=["university_admin", "faculty"])

    stmt = (
        select(Unit)
        .join(Subject, Unit.subject_id == Subject.id)
        .join(Course, Subject.course_id == Course.id)
        .where(and_(Unit.id == unit_id, Course.university_id == university_id))
    )
    u_res = await db.execute(stmt)
    if not u_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found in this university.")

    order_val = data.order if data.order is not None else (data.order_index or data.topic_number or 0)
    topic = Topic(
        id=str(uuid.uuid4()),
        unit_id=unit_id,
        title=data.title,
        description=data.description,
        order=order_val,
    )
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    return topic


# ─── DOCUMENT UPLOAD & INGESTION ───────────────────────────────────

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".md"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@router.post("/{university_id}/documents/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    university_id: str,
    file: UploadFile = File(...),
    title: str = Form(...),
    course_id: Optional[str] = Form(None),
    subject_id: Optional[str] = Form(None),
    unit_id: Optional[str] = Form(None),
    topic_id: Optional[str] = Form(None),
    course: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    semester: Optional[str] = Form(None),
    academic_year: Optional[str] = Form(None),
    content_type: str = Form("lecture_note"),
    sync: bool = Query(True),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Upload educational document for university RAG knowledge base.

    Strict security:
    - Only university_admin or faculty can upload official university materials.
    - Tenant isolation: Document bound to university_id.
    - Abstract storage layer (Local or S3/MinIO cloud adapter).
    - Asynchronous / decoupled worker dispatch.
    """
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id, required_roles=["university_admin", "faculty"])

    filename = file.filename or "document.txt"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    final_course_id = course_id or course
    final_subject_id = subject_id or subject
    final_topic_id = topic_id or topic
    final_semester = None
    if semester and str(semester).isdigit():
        final_semester = int(semester)

    # Validate course belongs to this university if provided
    if final_course_id:
        c_chk = await db.execute(
            select(Course).where(and_(Course.id == final_course_id, Course.university_id == university_id))
        )
        if not c_chk.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provided course does not belong to this university.",
            )

    # Store file using storage abstraction
    storage = get_document_storage()
    dest_path, file_size = await storage.save_file(
        file=file,
        university_id=university_id,
        filename=filename,
        max_size=MAX_FILE_SIZE,
    )

    doc_id = str(uuid.uuid4())
    doc = UniversityDocument(
        id=doc_id,
        university_id=university_id,
        uploaded_by=user.id,
        filename=filename,
        title=title.strip(),
        course_id=final_course_id,
        subject_id=final_subject_id,
        unit_id=unit_id,
        topic_id=final_topic_id,
        semester=final_semester,
        academic_year=academic_year,
        content_type=content_type,
        file_format=ext.lstrip("."),
        file_path=dest_path,
        file_size=file_size,
        processing_status="uploaded",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Dispatch ingestion via worker abstraction
    worker = get_ingestion_worker()
    await worker.dispatch(
        document_id=doc.id,
        background_tasks=background_tasks,
        run_sync=sync,
        db=db,
    )
    await db.refresh(doc)
    return doc


@router.get("/{university_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    university_id: str,
    status_filter: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    subject_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List documents belonging to the university (tenant-isolated)."""
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id)

    conditions = [UniversityDocument.university_id == university_id]
    if status_filter:
        conditions.append(UniversityDocument.processing_status == status_filter)
    target_subject = subject_id or subject
    if target_subject:
        conditions.append(UniversityDocument.subject_id == target_subject)
    if course_id:
        conditions.append(UniversityDocument.course_id == course_id)

    stmt = select(UniversityDocument).where(and_(*conditions)).order_by(desc(UniversityDocument.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/documents/{document_id}/retry", response_model=DocumentResponse)
async def retry_document_ingestion(
    document_id: str,
    sync: bool = Query(True),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Retry failed ingestion for a university document."""
    res = await db.execute(select(UniversityDocument).where(UniversityDocument.id == document_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, doc.university_id, required_roles=["university_admin", "faculty"])

    worker = get_ingestion_worker()
    await worker.dispatch(
        document_id=doc.id,
        background_tasks=background_tasks,
        run_sync=sync,
        db=db,
    )
    await db.refresh(doc)
    return doc


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete document, physical file, and vector chunks (Admin or Faculty only)."""
    res = await db.execute(select(UniversityDocument).where(UniversityDocument.id == document_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, doc.university_id, required_roles=["university_admin", "faculty"])

    success = await delete_document_pipeline(document_id, db)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document and vector indices")

    return {"message": "Document and all associated vector chunks permanently deleted."}


# ─── TENANT-ISOLATED RAG RETRIEVAL ──────────────────────────────────

@router.post("/{university_id}/rag/search", response_model=List[RAGCitation])
async def search_university_rag(
    university_id: str,
    req: RAGSearchRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Tenant-isolated semantic search across institutional documents.

    CRITICAL SECURITY CHECK:
    - User must belong to this university.
    - Chunks returned are strictly scoped to university_id.
    - Zero leakage across institutions.
    """
    user = await _get_user(user_id, db)
    await _verify_tenant_access(user, university_id)

    vector_store = get_vector_store()
    scored_results = await vector_store.similarity_search(
        query=req.query,
        university_id=university_id,
        db=db,
        limit=req.limit,
        course_id=req.course_id,
        subject_id=req.subject_id,
        allow_global=False,  # Strict university-only search
    )

    citations: List[RAGCitation] = []
    # Collect unique document IDs to resolve titles
    doc_ids = list({chunk.document_id for chunk, _ in scored_results})
    doc_map = {}
    if doc_ids:
        docs_res = await db.execute(select(UniversityDocument).where(UniversityDocument.id.in_(doc_ids)))
        for d in docs_res.scalars().all():
            doc_map[d.id] = d

    for chunk, score in scored_results:
        doc = doc_map.get(chunk.document_id)
        doc_title = doc.title if doc else "University Document"
        citations.append(
            RAGCitation(
                document_id=chunk.document_id,
                document_title=doc_title,
                chunk_index=chunk.chunk_index,
                page_number=chunk.page_number,
                section_title=chunk.section_title,
                content=chunk.content,
                similarity_score=round(score, 4),
            )
        )

    return citations
