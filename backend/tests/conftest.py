"""Pytest configuration and global fixtures for QubitLab backend tests."""

import asyncio
import pytest
import app.models  # noqa: F401 - ensures all SQLAlchemy models are registered on Base.metadata
from app.core.database import Base, engine


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure all database tables exist on the test engine prior to test execution."""
    async def _init_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(_init_tables())
    yield
