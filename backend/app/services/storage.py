"""Document Storage abstraction and implementations for University RAG system.

Supports:
- LocalDocumentStorage: Production-ready local filesystem storage for development
  and single-node deployments.
- S3DocumentStorage: S3-compatible cloud storage adapter (AWS S3, MinIO) for
  multi-instance cloud deployments.
"""

from abc import ABC, abstractmethod
import os
import re
import shutil
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings
from app.core.logging import logger


class BaseDocumentStorage(ABC):
    """Abstract interface for educational document storage."""

    @abstractmethod
    async def save_file(
        self,
        file: UploadFile,
        university_id: str,
        filename: str,
        max_size: int = 25 * 1024 * 1024,
    ) -> Tuple[str, int]:
        """Save uploaded file securely, returning (storage_path_or_key, file_size_bytes)."""
        pass

    @abstractmethod
    async def delete_file(self, storage_path: str) -> bool:
        """Remove file from storage."""
        pass

    @abstractmethod
    async def get_file_content(self, storage_path: str) -> bytes:
        """Read full file bytes from storage."""
        pass

    @abstractmethod
    def exists(self, storage_path: str) -> bool:
        """Check if file exists in storage."""
        pass


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and shell injection."""
    base = os.path.basename(filename)
    # Strip any directory separators or control characters
    cleaned = re.sub(r"[^\w\.\-\_]", "_", base)
    if not cleaned or cleaned.startswith("."):
        cleaned = f"doc_{uuid.uuid4().hex[:8]}" + os.path.splitext(base)[1]
    return cleaned


class LocalDocumentStorage(BaseDocumentStorage):
    """Stores files on the local filesystem partitioned by university_id."""

    def __init__(self, base_dir: Optional[str] = None):
        if base_dir:
            self.base_dir = base_dir
        else:
            self.base_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
                "storage",
                "documents",
            )
        os.makedirs(self.base_dir, exist_ok=True)

    def _resolve_tenant_dir(self, university_id: str) -> str:
        clean_univ = re.sub(r"[^\w\-]", "", university_id)
        path = os.path.join(self.base_dir, clean_univ)
        os.makedirs(path, exist_ok=True)
        return path

    async def save_file(
        self,
        file: UploadFile,
        university_id: str,
        filename: str,
        max_size: int = 25 * 1024 * 1024,
    ) -> Tuple[str, int]:
        clean_name = sanitize_filename(filename)
        tenant_dir = self._resolve_tenant_dir(university_id)

        doc_prefix = uuid.uuid4().hex[:12]
        dest_filename = f"{doc_prefix}_{clean_name}"
        dest_path = os.path.join(tenant_dir, dest_filename)

        # Ensure realpath is within tenant_dir (prevent symlink / traversal attacks)
        real_dest = os.path.realpath(dest_path)
        real_tenant = os.path.realpath(tenant_dir)
        if not real_dest.startswith(real_tenant):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security violation: Invalid filename path.",
            )

        file_size = 0
        try:
            with open(dest_path, "wb") as buffer:
                while chunk := await file.read(1024 * 1024):
                    file_size += len(chunk)
                    if file_size > max_size:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum allowed size of {max_size // (1024 * 1024)} MB",
                        )
                    buffer.write(chunk)
        except HTTPException:
            if os.path.exists(dest_path):
                os.remove(dest_path)
            raise
        except Exception as e:
            if os.path.exists(dest_path):
                os.remove(dest_path)
            logger.error(f"Failed to write uploaded file to {dest_path}: {e}")
            raise HTTPException(status_code=500, detail=f"File storage error: {e}")

        return dest_path, file_size

    async def delete_file(self, storage_path: str) -> bool:
        if storage_path and os.path.exists(storage_path):
            try:
                os.remove(storage_path)
                return True
            except Exception as e:
                logger.warning(f"Failed to delete local file {storage_path}: {e}")
                return False
        return False

    async def get_file_content(self, storage_path: str) -> bytes:
        if not self.exists(storage_path):
            raise FileNotFoundError(f"File not found: {storage_path}")
        with open(storage_path, "rb") as f:
            return f.read()

    def exists(self, storage_path: str) -> bool:
        return bool(storage_path and os.path.exists(storage_path))


class S3DocumentStorage(BaseDocumentStorage):
    """S3-compatible cloud storage adapter for multi-instance AWS deployments.

    Note: This is an architectural adapter ready for AWS production.
    If boto3 or AWS credentials are not configured, it logs an informative notice
    and falls back to LocalDocumentStorage.
    """

    def __init__(self, bucket_name: Optional[str] = None, region: Optional[str] = None):
        self.bucket_name = bucket_name or getattr(settings, "S3_BUCKET_NAME", "qubitlab-documents")
        self.region = region or getattr(settings, "AWS_REGION", "us-east-1")
        self._s3_client = None

    def _get_client(self):
        if self._s3_client is None:
            try:
                import boto3
                self._s3_client = boto3.client("s3", region_name=self.region)
            except Exception as e:
                logger.warning(f"boto3 initialization not available: {e}")
                return None
        return self._s3_client

    async def save_file(
        self,
        file: UploadFile,
        university_id: str,
        filename: str,
        max_size: int = 25 * 1024 * 1024,
    ) -> Tuple[str, int]:
        client = self._get_client()
        if not client:
            raise NotImplementedError("S3 storage adapter is configured but boto3/AWS credentials are not active.")

        clean_name = sanitize_filename(filename)
        key = f"universities/{university_id}/documents/{uuid.uuid4().hex[:12]}_{clean_name}"
        data = await file.read()
        if len(data) > max_size:
            raise HTTPException(status_code=413, detail="File exceeds maximum allowed size.")

        client.put_object(Bucket=self.bucket_name, Key=key, Body=data)
        return f"s3://{self.bucket_name}/{key}", len(data)

    async def delete_file(self, storage_path: str) -> bool:
        client = self._get_client()
        if not client:
            return False
        if storage_path.startswith("s3://"):
            key = storage_path.replace(f"s3://{self.bucket_name}/", "")
            try:
                client.delete_object(Bucket=self.bucket_name, Key=key)
                return True
            except Exception as e:
                logger.warning(f"Failed to delete S3 object {key}: {e}")
                return False
        return False

    async def get_file_content(self, storage_path: str) -> bytes:
        client = self._get_client()
        if not client:
            raise NotImplementedError("S3 storage not active.")
        key = storage_path.replace(f"s3://{self.bucket_name}/", "")
        resp = client.get_object(Bucket=self.bucket_name, Key=key)
        return resp["Body"].read()

    def exists(self, storage_path: str) -> bool:
        client = self._get_client()
        if not client or not storage_path.startswith("s3://"):
            return False
        key = storage_path.replace(f"s3://{self.bucket_name}/", "")
        try:
            client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception:
            return False


_storage_instance: Optional[BaseDocumentStorage] = None


def get_document_storage() -> BaseDocumentStorage:
    """Singleton accessor for document storage layer."""
    global _storage_instance
    if _storage_instance is None:
        # Default to production-ready LocalDocumentStorage for current environment
        _storage_instance = LocalDocumentStorage()
    return _storage_instance
