"""Models package - imports all models to register with Base.metadata."""

from app.models.user import User  # noqa: F401
from app.models.circuit import Circuit, CircuitVersion  # noqa: F401
from app.models.simulation import SimulationResult  # noqa: F401
from app.models.challenge import Challenge  # noqa: F401
from app.models.learning import (  # noqa: F401
    LearningLevel, Project, Lesson, Concept,
    UserProjectProgress, UserLessonCompletion,
)
from app.models.progress import (  # noqa: F401
    XPTransaction, Achievement, UserAchievement, UserConceptMastery,
)
from app.models.submission import Submission  # noqa: F401
from app.models.analytics import (  # noqa: F401
    LearningEvent, InstructorAssignment, AssignmentSubmission,
)
from app.models.social import (  # noqa: F401
    Friendship, Message, CollabRoom, RoomMember, RoomInvite,
)
from app.models.discussion import DiscussionPost, DiscussionVote  # noqa: F401
from app.models.university import (  # noqa: F401
    University, UniversityMembership, Course, Subject, Unit, Topic,
    UniversityDocument, DocumentChunk, IngestionJob,
)
