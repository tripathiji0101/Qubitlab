"""Document ingestion and processing pipeline for University RAG system.

Supports extraction, normalization, chunking, and embedding generation
for PDF, DOCX, TXT, and Markdown files.
"""

from datetime import datetime, timezone
import json
import os
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models.university import (
    UniversityDocument,
    DocumentChunk,
    IngestionJob,
)
from app.services.ai.vector_store import generate_embedding, get_vector_store


# ─── TEXT EXTRACTION ───────────────────────────────────────────────

def extract_text_from_file(file_path: str, mime_type: str) -> List[Dict[str, Any]]:
    """Extract text from file, returning a list of page/section dictionaries:
    [{"page_number": int, "section_title": str, "text": str}, ...]
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    pages_data: List[Dict[str, Any]] = []

    if ext == ".pdf" or "pdf" in mime_type:
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                if txt.strip():
                    pages_data.append({
                        "page_number": idx + 1,
                        "section_title": f"Page {idx + 1}",
                        "text": txt.strip(),
                    })
        except Exception as e:
            logger.error(f"Error parsing PDF with pypdf: {e}")
            raise ValueError(f"Failed to parse PDF document: {e}")

    elif ext in (".docx", ".doc") or "word" in mime_type:
        try:
            import docx
            doc = docx.Document(file_path)
            current_section = "General"
            current_paragraphs: List[str] = []
            page_estimate = 1

            for p in doc.paragraphs:
                text = p.text.strip()
                if not text:
                    continue
                if p.style and p.style.name.startswith("Heading"):
                    if current_paragraphs:
                        pages_data.append({
                            "page_number": page_estimate,
                            "section_title": current_section,
                            "text": "\n".join(current_paragraphs),
                        })
                        current_paragraphs = []
                        page_estimate += 1
                    current_section = text
                else:
                    current_paragraphs.append(text)

            if current_paragraphs:
                pages_data.append({
                    "page_number": page_estimate,
                    "section_title": current_section,
                    "text": "\n".join(current_paragraphs),
                })
        except Exception as e:
            logger.error(f"Error parsing DOCX: {e}")
            raise ValueError(f"Failed to parse DOCX document: {e}")

    else:
        # Plain text, Markdown, or code files
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                raw_text = f.read()

            # Split markdown by top-level or second-level headers
            lines = raw_text.split("\n")
            current_section = "Overview"
            current_chunk_lines: List[str] = []
            section_idx = 1

            for line in lines:
                if line.startswith("# ") or line.startswith("## "):
                    if current_chunk_lines:
                        pages_data.append({
                            "page_number": section_idx,
                            "section_title": current_section,
                            "text": "\n".join(current_chunk_lines).strip(),
                        })
                        current_chunk_lines = []
                        section_idx += 1
                    current_section = line.lstrip("#").strip()
                else:
                    current_chunk_lines.append(line)

            if current_chunk_lines:
                pages_data.append({
                    "page_number": section_idx,
                    "section_title": current_section,
                    "text": "\n".join(current_chunk_lines).strip(),
                })

        except Exception as e:
            logger.error(f"Error reading text document: {e}")
            raise ValueError(f"Failed to read text file: {e}")

    return pages_data


# ─── CHUNKING ──────────────────────────────────────────────────────

def chunk_text(
    pages_data: List[Dict[str, Any]],
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> List[Dict[str, Any]]:
    """Split extracted text into overlapping chunks while preserving page & section metadata."""
    chunks: List[Dict[str, Any]] = []
    chunk_idx = 0

    for item in pages_data:
        text = item["text"]
        page_num = item["page_number"]
        section = item["section_title"]

        if len(text) <= chunk_size:
            chunks.append({
                "chunk_index": chunk_idx,
                "content": text,
                "page_number": page_num,
                "section_title": section,
                "token_count": len(text.split()),
            })
            chunk_idx += 1
            continue

        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_slice = text[start:end]

            # Try to break at a sentence or newline boundary if possible
            if end < len(text):
                last_period = chunk_slice.rfind(". ")
                last_newline = chunk_slice.rfind("\n")
                break_point = max(last_period, last_newline)
                if break_point > chunk_size // 2:
                    end = start + break_point + 1
                    chunk_slice = text[start:end]

            content = chunk_slice.strip()
            if content:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": content,
                    "page_number": page_num,
                    "section_title": section,
                    "token_count": len(content.split()),
                })
                chunk_idx += 1

            start = end - chunk_overlap
            if start >= len(text):
                break

    return chunks


# ─── INGESTION EXECUTION ───────────────────────────────────────────

async def process_document(
    document_id: str,
    db: Optional[AsyncSession] = None,
) -> bool:
    """Execute end-to-end ingestion pipeline for a university document:
    1. Update status to 'processing'
    2. Extract text from file
    3. Normalize and chunk text
    4. Compute embeddings for chunks
    5. Save chunks to DocumentChunk table
    6. Update status to 'indexed'
    """
    if db is None:
        from app.core.database import async_session_factory
        async with async_session_factory() as session:
            return await process_document(document_id, session)

    stmt = select(UniversityDocument).where(UniversityDocument.id == document_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()

    if not doc:
        logger.error(f"Cannot process document: {document_id} not found")
        return False

    # Create or update ingestion job
    job = IngestionJob(
        id=str(uuid.uuid4()),
        document_id=doc.id,
        status="processing",
        started_at=datetime.now(timezone.utc),
    )
    db.add(job)

    doc.processing_status = "processing"
    doc.error_message = None
    await db.commit()

    try:
        # Step 1: Extract text
        pages = extract_text_from_file(doc.file_path, doc.file_format)
        if not pages:
            raise ValueError("No text content could be extracted from the document.")

        # Step 2: Chunk text
        chunks_data = chunk_text(pages)
        if not chunks_data:
            raise ValueError("Document produced 0 text chunks after processing.")

        # Step 3: Remove any pre-existing chunks for this document
        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))

        # Step 4: Generate embeddings and build DocumentChunk objects
        chunk_models: List[DocumentChunk] = []
        for c in chunks_data:
            emb = await generate_embedding(c["content"])
            model = DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                university_id=doc.university_id,
                course_id=doc.course_id,
                subject_id=doc.subject_id,
                unit_id=doc.unit_id,
                topic_id=doc.topic_id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                embedding_json=json.dumps(emb),
                token_count=c["token_count"],
                page_number=c["page_number"],
                section_title=c["section_title"],
            )
            chunk_models.append(model)

        # Step 5: Save chunks via vector store
        vector_store = get_vector_store()
        await vector_store.add_chunks(chunk_models, db)

        # Step 6: Mark completed
        doc.processing_status = "indexed"
        doc.error_message = None
        doc.chunk_count = len(chunk_models)
        doc.updated_at = datetime.now(timezone.utc)

        job.status = "completed"
        job.progress = 100
        job.completed_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(f"Successfully indexed document {doc.id} ({len(chunk_models)} chunks)")
        return True

    except Exception as e:
        logger.error(f"Failed to process document {doc.id}: {e}", exc_info=True)
        doc.processing_status = "failed"
        doc.error_message = str(e)
        doc.updated_at = datetime.now(timezone.utc)

        job.status = "failed"
        job.error_message = str(e)
        job.completed_at = datetime.now(timezone.utc)
        await db.commit()
        return False


async def delete_document_pipeline(document_id: str, db: AsyncSession) -> bool:
    """Delete document, physical file, and all vector chunks."""
    stmt = select(UniversityDocument).where(UniversityDocument.id == document_id)
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        return False

    # Remove vector chunks
    vector_store = get_vector_store()
    await vector_store.delete_document_chunks(document_id, db)

    # Remove physical file via storage abstraction
    if doc.file_path:
        from app.services.storage import get_document_storage
        storage = get_document_storage()
        await storage.delete_file(doc.file_path)

    # Remove ingestion jobs
    await db.execute(delete(IngestionJob).where(IngestionJob.document_id == document_id))

    # Remove document record
    await db.delete(doc)
    await db.commit()
    return True


# ─── INGESTION WORKER ABSTRACTION ──────────────────────────────────

from abc import ABC, abstractmethod
import asyncio
from fastapi import BackgroundTasks


class BaseIngestionWorker(ABC):
    """Abstract interface for asynchronous ingestion workers."""

    @abstractmethod
    async def dispatch(
        self,
        document_id: str,
        background_tasks: Optional[BackgroundTasks] = None,
        run_sync: bool = False,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Dispatch document processing job."""
        pass


class LocalAsyncIngestionWorker(BaseIngestionWorker):
    """Local asynchronous ingestion worker.

    Leverages FastAPI BackgroundTasks or asyncio background task
    to execute extraction, chunking, and embedding outside the HTTP request.
    Supports run_sync=True for deterministic tests and CLI jobs.
    """

    async def dispatch(
        self,
        document_id: str,
        background_tasks: Optional[BackgroundTasks] = None,
        run_sync: bool = False,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        if run_sync:
            return await process_document(document_id, db)

        if background_tasks is not None:
            background_tasks.add_task(self._run_async, document_id)
            return True
        else:
            asyncio.create_task(self._run_async(document_id))
            return True

    async def _run_async(self, document_id: str):
        try:
            await process_document(document_id, db=None)
        except Exception as e:
            logger.error(f"Async ingestion job failed for {document_id}: {e}")


class CeleryOrSQSIngestionWorker(BaseIngestionWorker):
    """Adapter for distributed AWS SQS / Celery worker deployment."""

    async def dispatch(
        self,
        document_id: str,
        background_tasks: Optional[BackgroundTasks] = None,
        run_sync: bool = False,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        raise NotImplementedError("SQS/Celery worker adapter is a future distributed deployment target.")


_worker_instance: Optional[BaseIngestionWorker] = None


def get_ingestion_worker() -> BaseIngestionWorker:
    """Singleton getter for the configured ingestion worker."""
    global _worker_instance
    if _worker_instance is None:
        _worker_instance = LocalAsyncIngestionWorker()
    return _worker_instance
