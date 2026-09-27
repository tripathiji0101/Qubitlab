"""Abstract quantum engine interface and engine registry."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

from app.schemas.circuit import PlacementIn, AmpResult, ProbResult


@dataclass
class EngineResult:
    """Framework-agnostic simulation result."""
    success: bool = True
    amps: list[AmpResult] | None = None
    probs: list[ProbResult] | None = None
    counts: dict[str, int] | None = None
    bloch_spheres: list[dict] | None = None
    execution_time_ms: float = 0.0
    error: Optional[str] = None


class QuantumEngine(ABC):
    """Abstract base class for quantum simulation engines."""

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @abstractmethod
    def simulate(
        self,
        placements: list[PlacementIn],
        qubits: int,
        shots: int = 1024,
        return_statevector: bool = True,
    ) -> EngineResult:
        """Run a circuit simulation and return normalized results."""
        ...


# ── Engine registry ──

_engines: dict[str, QuantumEngine] = {}


def register_engine(engine: QuantumEngine):
    _engines[engine.name] = engine


def get_engine(framework: str) -> QuantumEngine:
    engine = _engines.get(framework)
    if engine is None:
        available = ", ".join(_engines.keys()) or "none"
        raise ValueError(f"Unknown framework '{framework}'. Available: {available}")
    return engine


def list_engines() -> list[str]:
    return list(_engines.keys())
