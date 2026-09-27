"""Learning, dashboard, challenge, progress, tutor, instructor schemas."""

from pydantic import BaseModel, Field
from typing import Optional


# ── Learning / Levels ──

class LevelResponse(BaseModel):
    """Matches frontend Level type exactly."""
    n: int
    role: str
    title: str
    algorithm: str
    difficulty: str
    duration: str
    xp: int
    status: str  # completed/active/locked
    progress: float
    slug: str
    mission: str
    concepts: list[str]
    gates: list[str]


class ProjectDetailResponse(BaseModel):
    slug: str
    level: LevelResponse
    overview: str
    learning_objectives: list[str]
    algorithm_overview: str
    expected_outcome: str
    hints: list[str]
    success_criteria: list[str]


# ── Dashboard ──

class DashboardResponse(BaseModel):
    user: dict
    current_level: int
    xp: int
    xp_to_next_level: int
    streak: int
    active_project: Optional[dict] = None
    recommendation: Optional[dict] = None
    weekly_xp: list[int]
    stats: dict
    levels: list[LevelResponse]


# ── Challenges ──

class ChallengeListItem(BaseModel):
    """Matches frontend challenge list shape."""
    id: str
    title: str
    algorithm: str
    difficulty: str
    xp: int
    best: int
    attempts: int
    done: bool
    tone: str
    statement: str


class ChallengeDetailResponse(BaseModel):
    id: str
    title: str
    statement: str
    algorithm: str
    difficulty: str
    xp: int
    tone: str
    qubit_count: int
    allowed_gates: list[str]
    max_depth: int
    max_gate_count: int
    requirements: list[str]
    hints: list[str]
    expected_output_display: str
    best: int
    attempts: int
    done: bool


class ChallengeSubmitRequest(BaseModel):
    placements: list[dict]
    qubits: int = 2
    framework: str = "qiskit"


class ChallengeSubmitResponse(BaseModel):
    passed: bool
    score: int
    correctness: float
    efficiency: float
    depth: int
    gate_count: int
    xp_awarded: int
    feedback: str


# ── Progress / Profile ──

class SkillRadarItem(BaseModel):
    skill: str
    value: float


class BadgeResponse(BaseModel):
    name: str
    tone: str
    earned: bool
    desc: str


class ProfileResponse(BaseModel):
    user: dict
    skill_radar: list[SkillRadarItem]
    badges: list[BadgeResponse]
    stats: dict
    strongest_concepts: list[dict]
    weakest_concepts: list[dict]


# ── Leaderboard ──

class LeaderboardEntry(BaseModel):
    """Matches frontend leaderboard shape."""
    rank: int
    name: str
    level: int
    xp: int
    challenges: int
    eff: int
    you: bool


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
    your_rank: int
    your_xp: int
    your_eff: int


# ── History ──

class HistoryItem(BaseModel):
    """Matches frontend historyItems shape."""
    project: str
    algorithm: str
    sdk: str
    score: int
    date: str
    depth: int
    status: str


# ── AI Tutor ──

class TutorChatRequest(BaseModel):
    question: str
    placements: list[dict] = []
    qubits: int = 2
    classical_bits: int = 0
    simulation_result: Optional[dict] = None
    project_slug: Optional[str] = None
    challenge_id: Optional[str] = None
    # Level / lesson context
    level: Optional[dict] = None            # {number, title, algorithm, difficulty}
    lesson: Optional[dict] = None           # {title, content}
    challenge_context: Optional[dict] = None  # {active, objective, hints_used}
    available_gates: list[str] = []
    conversation_history: list[dict] = []   # Recent messages [{role, text}]
    # Mission & criteria
    mission: Optional[str] = None
    success_criteria: list[str] = []
    concepts: list[str] = []
    # Selected element
    selected_gate: Optional[dict] = None    # {id, gate, qubit, moment, target?}
    # Learning session tracking
    student_history: Optional[dict] = None  # {attempt_count, recent_attempts, hints_used, what_if_count}
    mode: Optional[str] = None              # "adaptive" | "socratic" | "direct"


class TutorResponse(BaseModel):
    response: str
    sources: list[dict] = []
    suggestions: list[str] = []
    what_if: Optional[dict] = None
    # Goal-Aware & Socratic Tutoring telemetry
    student_state: Optional[str] = None     # NOT_STARTED | EARLY_ATTEMPT | PROGRESSING | NEAR_COMPLETION | COMPLETED | BLOCKED | INVALID
    intent: Optional[str] = None            # DIRECT_ANSWER | HINT | DEBUG | EXPLAIN | VERIFY | NEXT_STEP | OPTIMIZE | CODE | WHAT_IF | CONCEPT | SOCRATIC_INQUIRY | GENERAL
    mission_progress: Optional[dict] = None # {met_count, total_count, percentage, criteria}
    celebration: Optional[dict] = None      # {title, message, xp, criteria_met}
    suggested_experiment: Optional[str] = None


# ── Instructor ──

class InstructorDashboardResponse(BaseModel):
    stats: dict
    progress_series: list[dict]
    concept_difficulty: list[dict]
    at_risk: list[dict]


class AssignmentCreate(BaseModel):
    title: str
    description: str = ""
    algorithm: str = ""
    difficulty: str = "Beginner"
    qubit_count: int = 2
    max_depth: int = 8
    target_result: str = ""
    xp_reward: int = 300
    due_date: Optional[str] = None
    allowed_gates: str = "H, X, Z, CNOT, CZ"
    hints: str = ""


class AssignmentResponse(BaseModel):
    title: str
    algorithm: str
    difficulty: str
    due: str
    submitted: int
    total: int
    status: str


class SubmissionListItem(BaseModel):
    name: str
    score: int
    correctness: float
    efficiency: float
    attempts: int
    status: str


# ── Error ──

class ErrorResponse(BaseModel):
    error: dict
