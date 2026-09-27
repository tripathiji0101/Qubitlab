"""Vector Store abstraction and implementations for University RAG system.

Supports tenant-isolated semantic retrieval with cosine similarity.
Compatible with SQLite (local development), PostgreSQL/pgvector, and AWS OpenSearch.
"""

from abc import ABC, abstractmethod
import json
import math
import re
from typing import Optional, List, Tuple
import httpx
from sqlalchemy import select, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.models.university import DocumentChunk, UniversityDocument


DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001"
DEFAULT_EMBEDDING_DIM = 768


# ─── EMBEDDING GENERATION ──────────────────────────────────────────

def _deterministic_text_embedding(text: str, dim: int = DEFAULT_EMBEDDING_DIM) -> List[float]:
    """Generate a deterministic unit-normalized TF/n-gram embedding vector.

    Used when external LLM API is unavailable, ensuring 100% offline testability
    and reproducible cosine similarity for semantic retrieval.
    Dimensions match the production Gemini embedding dimension (768).
    """
    cleaned = re.sub(r"[^\w\s]", " ", text.lower())
    words = cleaned.split()
    if not words:
        return [0.0] * dim

    vec = [0.0] * dim

    # Word-level hashing
    for word in words:
        h = 0
        for ch in word:
            h = (h * 31 + ord(ch)) & 0xFFFFFFFF
        idx = h % dim
        vec[idx] += 1.0

    # Character tri-gram hashing for morphological capture
    for i in range(len(cleaned) - 2):
        tri = cleaned[i:i + 3]
        h = 0
        for ch in tri:
            h = (h * 37 + ord(ch)) & 0xFFFFFFFF
        idx = h % dim
        vec[idx] += 0.5

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 1e-9:
        vec = [round(x / norm, 6) for x in vec]
    return vec


async def generate_embedding(text: str, dim: int = DEFAULT_EMBEDDING_DIM) -> List[float]:
    """Generate vector embedding for text using Google Gemini embedding API or deterministic fallback.

    Uses the currently supported 'gemini-embedding-001' model with requested dimensionality (768).
    Falls back gracefully and deterministically to _deterministic_text_embedding(text, dim=768)
    if the external provider is offline, rate-limited, or unconfigured.
    """
    if not text.strip():
        return [0.0] * dim

    if settings.AI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{DEFAULT_EMBEDDING_MODEL}:embedContent?key={settings.AI_API_KEY}"
                payload = {
                    "model": f"models/{DEFAULT_EMBEDDING_MODEL}",
                    "content": {"parts": [{"text": text[:2048]}]},
                    "outputDimensionality": dim,
                }
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    values = data.get("embedding", {}).get("values")
                    if values and isinstance(values, list):
                        norm = math.sqrt(sum(x * x for x in values))
                        if norm > 1e-9:
                            return [round(x / norm, 6) for x in values]
                        return values
                else:
                    logger.warning(
                        f"Gemini embedding API returned status {resp.status_code}: {resp.text[:200]}"
                    )
        except Exception as e:
            logger.warning(f"External embedding generation failed, using deterministic fallback: {e}")

    return _deterministic_text_embedding(text, dim=dim)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculate cosine similarity between two unit vectors.

    Safely handles dimension mismatches and empty vectors.
    """
    if not v1 or not v2:
        return 0.0
    if len(v1) != len(v2):
        logger.warning(f"Vector dimension mismatch in cosine similarity: len(v1)={len(v1)} vs len(v2)={len(v2)}")
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    return max(-1.0, min(1.0, dot))


# ─── BASE VECTOR STORE INTERFACE ────────────────────────────────────

class BaseVectorStore(ABC):
    """Abstract Vector Store interface ensuring multi-tenant isolation."""

    @abstractmethod
    async def add_chunks(self, chunks: List[DocumentChunk], db: AsyncSession) -> int:
        """Persist document chunks with embeddings."""
        pass

    @abstractmethod
    async def delete_document_chunks(self, document_id: str, db: AsyncSession) -> int:
        """Remove all chunks associated with a document upon deletion/archival."""
        pass

    @abstractmethod
    async def similarity_search(
        self,
        query: str,
        university_id: str,
        db: AsyncSession,
        limit: int = 5,
        min_score: float = 0.0,
        course_id: Optional[str] = None,
        subject_id: Optional[str] = None,
        topic_id: Optional[str] = None,
        allow_global: bool = True,
    ) -> List[Tuple[DocumentChunk, float]]:
        """Retrieve most similar chunks strictly scoped to the tenant university."""
        pass


# ─── RELATIONAL / SQLALCHEMY IMPLEMENTATION ────────────────────────

class RelationalVectorStore(BaseVectorStore):
    """Production-ready vector store utilizing SQLAlchemy DocumentChunk table.

    Guarantees strict tenant isolation by applying university_id filters
    at the database query layer.
    """

    async def add_chunks(self, chunks: List[DocumentChunk], db: AsyncSession) -> int:
        if not chunks:
            return 0
        db.add_all(chunks)
        await db.commit()
        return len(chunks)

    async def delete_document_chunks(self, document_id: str, db: AsyncSession) -> int:
        stmt = delete(DocumentChunk).where(DocumentChunk.document_id == document_id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount or 0

    async def similarity_search(
        self,
        query: str,
        university_id: str,
        db: AsyncSession,
        limit: int = 5,
        min_score: float = 0.0,
        course_id: Optional[str] = None,
        subject_id: Optional[str] = None,
        topic_id: Optional[str] = None,
        allow_global: bool = True,
    ) -> List[Tuple[DocumentChunk, float]]:
        """Strictly tenant-isolated similarity search.

        CRITICAL SECURITY REQUIREMENT:
        - Only records with DocumentChunk.university_id == university_id
        - (Optional: OR DocumentChunk.university_id == None if allow_global is True)
        - Records belonging to other universities (university_id != requested) are NEVER retrieved.
        """
        if not query.strip():
            return []

        # Generate query vector
        query_vec = await generate_embedding(query)

        # Build tenant filter
        tenant_conditions = [DocumentChunk.university_id == university_id]
        if allow_global:
            tenant_conditions.append(DocumentChunk.university_id == None)

        from sqlalchemy import or_
        conditions = [or_(*tenant_conditions)]

        if course_id:
            conditions.append(DocumentChunk.course_id == course_id)
        if subject_id:
            conditions.append(DocumentChunk.subject_id == subject_id)
        if topic_id:
            conditions.append(DocumentChunk.topic_id == topic_id)

        # Retrieve eligible chunks for this tenant
        stmt = (
            select(DocumentChunk)
            .join(UniversityDocument, DocumentChunk.document_id == UniversityDocument.id)
            .where(
                and_(
                    *conditions,
                    UniversityDocument.processing_status == "indexed",
                )
            )
        )

        result = await db.execute(stmt)
        chunks = result.scalars().all()

        # Bound limit between 1 and 50
        effective_limit = max(1, min(limit, 50))

        scored_chunks: List[Tuple[DocumentChunk, float]] = []
        for chunk in chunks:
            if not chunk.embedding_json:
                continue

            try:
                emb = json.loads(chunk.embedding_json) if isinstance(chunk.embedding_json, str) else chunk.embedding_json
                if not isinstance(emb, list) or not emb:
                    continue
                score = cosine_similarity(query_vec, emb)
                if score >= min_score:
                    scored_chunks.append((chunk, score))
            except Exception as e:
                logger.debug(f"Failed to score chunk {chunk.id}: {e}")
                continue

        # Sort descending by similarity score
        scored_chunks.sort(key=lambda item: item[1], reverse=True)
        return scored_chunks[:effective_limit]


# ─── FUTURE PRODUCTION ADAPTERS (PLUGGABLE) ─────────────────────────

class PgVectorStore(BaseVectorStore):
    """Future production adapter: Amazon RDS PostgreSQL with native pgvector extension.

    Note: This is an architectural placeholder for future scale (>100k chunks).
    Native SQL cosine distance query:
        SELECT id, 1 - (embedding <=> :query_vec) AS score
        FROM document_chunks WHERE university_id = :univ_id
        ORDER BY embedding <=> :query_vec LIMIT :limit;
    """

    async def add_chunks(self, chunks: List[DocumentChunk], db: AsyncSession) -> int:
        raise NotImplementedError("Native pgvector extension adapter is a future production deployment target.")

    async def delete_document_chunks(self, document_id: str, db: AsyncSession) -> int:
        raise NotImplementedError("Native pgvector extension adapter is a future production deployment target.")

    async def similarity_search(self, *args, **kwargs):
        raise NotImplementedError("Native pgvector extension adapter is a future production deployment target.")


class OpenSearchVectorStore(BaseVectorStore):
    """Future production adapter: AWS OpenSearch Service with k-NN vector index.

    Note: Architectural placeholder for enterprise multi-cluster search.
    """

    async def add_chunks(self, chunks: List[DocumentChunk], db: AsyncSession) -> int:
        raise NotImplementedError("OpenSearch k-NN adapter is a future production deployment target.")

    async def delete_document_chunks(self, document_id: str, db: AsyncSession) -> int:
        raise NotImplementedError("OpenSearch k-NN adapter is a future production deployment target.")

    async def similarity_search(self, *args, **kwargs):
        raise NotImplementedError("OpenSearch k-NN adapter is a future production deployment target.")


_vector_store_instance: Optional[BaseVectorStore] = None


def get_vector_store() -> BaseVectorStore:
    """Singleton getter for the configured vector store."""
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = RelationalVectorStore()
    return _vector_store_instance

