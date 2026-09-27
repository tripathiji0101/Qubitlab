"""University, syllabus, document and RAG ingestion models.

Supports multi-tenant university knowledge management, course syllabi,
document ingestion, chunking, and tenant-isolated RAG retrieval.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    String, Integer, Boolean, Text, DateTime, ForeignKey,
    UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class University(Base):
    """Educational institution tenant."""
    __tablename__ = "universities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)  # active, suspended, archived

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class UniversityMembership(Base):
    """Associates a User with a University and their institutional role."""
    __tablename__ = "university_memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    university_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        String(30), default="student", nullable=False
    )  # student | faculty | university_admin
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    student_id_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    __table_args__ = (
        UniqueConstraint("university_id", "user_id", name="uq_univ_user_membership"),
    )


class Course(Base):
    """University academic course or degree program (e.g., CS-400, Quantum Computing)."""
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    university_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    academic_year: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    __table_args__ = (
        UniqueConstraint("university_id", "code", name="uq_course_univ_code"),
    )


class Subject(Base):
    """Subject within a Course (e.g., Quantum Algorithms, Intro to Qubits)."""
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Unit(Base):
    """Curriculum unit within a Subject (e.g., Unit 1: Single Qubit Gates)."""
    __tablename__ = "units"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    subject_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Topic(Base):
    """Specific topic within a Unit (e.g., Hadamard Gate, Oracle Formulation)."""
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    unit_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class UniversityDocument(Base):
    """Uploaded institutional document (PDF, DOCX, TXT, Markdown)."""
    __tablename__ = "university_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    university_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    uploaded_by: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    course_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    unit_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("units.id", ondelete="SET NULL"), nullable=True, index=True
    )
    topic_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True
    )
    semester: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    academic_year: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    content_type: Mapped[str] = mapped_column(
        String(50), default="lecture_note", nullable=False
    )  # syllabus | lecture_note | textbook | assignment | lab_manual | exam
    file_format: Mapped[str] = mapped_column(String(20), nullable=False)  # pdf | docx | txt | md
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processing_status: Mapped[str] = mapped_column(
        String(20), default="uploaded", nullable=False, index=True
    )  # uploaded | processing | indexed | failed | archived
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class DocumentChunk(Base):
    """Text chunk extracted from UniversityDocument, enriched with syllabus metadata for RAG."""
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("university_documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    university_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    subject_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    unit_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    topic_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)

    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    section_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    embedding_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON-serialized embedding vector

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    __table_args__ = (
        Index("ix_chunks_univ_search", "university_id", "course_id", "subject_id"),
    )


class IngestionJob(Base):
    """Tracks asynchronous document processing lifecycle."""
    __tablename__ = "ingestion_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("university_documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )  # pending | processing | completed | failed
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
