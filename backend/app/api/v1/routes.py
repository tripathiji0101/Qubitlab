"""Learning, dashboard, challenges, progress, leaderboard, history, tutor, instructor APIs."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from datetime import datetime, timezone
import random
import json

from app.core.database import get_db
from app.core.security import get_current_user_id, require_role
from app.models.user import User
from app.models.learning import LearningLevel, UserProjectProgress, Project, Lesson, UserLessonCompletion
from app.models.challenge import Challenge
from app.models.submission import Submission
from app.models.progress import XPTransaction, Achievement, UserAchievement, UserConceptMastery
from app.models.analytics import InstructorAssignment, AssignmentSubmission
from app.schemas.circuit import PlacementIn
from app.schemas.common import (
    LevelResponse, DashboardResponse, ChallengeListItem, ChallengeDetailResponse,
    ChallengeSubmitRequest, ChallengeSubmitResponse,
    ProfileResponse, SkillRadarItem, BadgeResponse,
    LeaderboardEntry, LeaderboardResponse,
    HistoryItem,
    TutorChatRequest, TutorResponse,
    InstructorDashboardResponse, AssignmentCreate, AssignmentResponse, SubmissionListItem,
)
from app.services.evaluation.challenge_evaluator import evaluate_challenge
from app.services.ai.tutor import tutor


def _to_list(val) -> list:
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return [val] if val else []
    return []


# ═══════════════════════ LEARNING ═══════════════════════

learning_router = APIRouter(prefix="/learning", tags=["learning"])


@learning_router.get("/levels", response_model=list[LevelResponse])
async def get_levels(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    levels = await db.execute(select(LearningLevel).order_by(LearningLevel.n))
    all_levels = levels.scalars().all()

    # Get user progress
    progress_q = await db.execute(
        select(UserProjectProgress).where(UserProjectProgress.user_id == user_id)
    )
    progress_map = {p.level_id: p for p in progress_q.scalars().all()}

    result = []
    for lv in all_levels:
        prog = progress_map.get(lv.id)
        status = prog.status if prog else ("active" if lv.n == 1 else "locked")
        progress = prog.progress if prog else 0.0
        result.append(LevelResponse(
            n=lv.n, role=lv.role, title=lv.title, algorithm=lv.algorithm,
            difficulty=lv.difficulty, duration=lv.duration, xp=lv.xp,
            status=status, progress=progress, slug=lv.slug,
            mission=lv.mission, concepts=_to_list(lv.concepts), gates=_to_list(lv.gates),
        ))
    return result


@learning_router.get("/projects/{slug}")
async def get_project(slug: str, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    # Support slug aliasing between frontend and backend (e.g. bb84 <-> qkd)
    aliases = [slug]
    if slug == "bb84":
        aliases.append("qkd")
    elif slug == "qkd":
        aliases.append("bb84")

    result = await db.execute(select(LearningLevel).where(LearningLevel.slug.in_(aliases)))
    level = result.scalar_one_or_none()
    if not level:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch Project details if available
    proj_result = await db.execute(select(Project).where(Project.level_id == level.id))
    project = proj_result.scalar_one_or_none()

    lessons = []
    if project:
        lessons_q = await db.execute(
            select(Lesson).where(Lesson.project_id == project.id).order_by(Lesson.order)
        )
        lessons_records = lessons_q.scalars().all()
        lessons = [
            {
                "id": l.id,
                "title": l.title,
                "order": l.order,
                "duration_minutes": l.duration_minutes,
                "xp_reward": l.xp_reward,
                "content": l.content,
            }
            for l in lessons_records
        ]

    # Check user completed lessons
    if lessons:
        lesson_ids = [l["id"] for l in lessons]
        comp_q = await db.execute(
            select(UserLessonCompletion.lesson_id).where(
                UserLessonCompletion.user_id == user_id,
                UserLessonCompletion.lesson_id.in_(lesson_ids),
            )
        )
        completed_lesson_ids = set(comp_q.scalars().all())
        for l in lessons:
            l["completed"] = l["id"] in completed_lesson_ids

    return {
        "slug": slug,
        "level_number": level.n,
        "title": level.title,
        "role": level.role,
        "algorithm": level.algorithm,
        "difficulty": level.difficulty,
        "mission": level.mission,
        "concepts": _to_list(level.concepts),
        "gates": _to_list(level.gates),
        "xp": level.xp,
        "duration": level.duration,
        "overview": project.overview if project else "",
        "learning_objectives": _to_list(project.learning_objectives) if project else [],
        "algorithm_overview": project.algorithm_overview if project else "",
        "expected_outcome": project.expected_outcome if project else "",
        "hints": _to_list(project.hints) if project else [],
        "success_criteria": _to_list(project.success_criteria) if project else [],
        "lessons": lessons,
    }


@learning_router.post("/projects/{slug}/start")
async def start_project(slug: str, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    aliases = [slug]
    if slug == "bb84":
        aliases.append("qkd")
    elif slug == "qkd":
        aliases.append("bb84")

    result = await db.execute(select(LearningLevel).where(LearningLevel.slug.in_(aliases)))
    level = result.scalar_one_or_none()
    if not level:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create or update progress
    prog_q = await db.execute(
        select(UserProjectProgress).where(
            UserProjectProgress.user_id == user_id,
            UserProjectProgress.level_id == level.id,
        )
    )
    prog = prog_q.scalar_one_or_none()
    if not prog:
        prog = UserProjectProgress(user_id=user_id, level_id=level.id, status="active", started_at=datetime.now(timezone.utc))
        db.add(prog)
        await db.commit()

    return {"status": "started", "slug": slug}


@learning_router.post("/projects/{slug}/complete")
async def complete_project(slug: str, user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    aliases = [slug]
    if slug == "bb84":
        aliases.append("qkd")
    elif slug == "qkd":
        aliases.append("bb84")

    result = await db.execute(select(LearningLevel).where(LearningLevel.slug.in_(aliases)))
    level = result.scalar_one_or_none()
    if not level:
        raise HTTPException(status_code=404, detail="Project not found")

    # Mark current level complete
    prog_q = await db.execute(
        select(UserProjectProgress).where(
            UserProjectProgress.user_id == user_id,
            UserProjectProgress.level_id == level.id,
        )
    )
    prog = prog_q.scalar_one_or_none()
    if not prog:
        prog = UserProjectProgress(user_id=user_id, level_id=level.id)
        db.add(prog)

    prog.status = "completed"
    prog.progress = 100.0
    prog.completed_at = datetime.now(timezone.utc)

    # Award level XP idempotently
    idempotency_key = f"project:{level.slug}:user:{user_id}"
    existing_xp = await db.execute(
        select(XPTransaction).where(XPTransaction.idempotency_key == idempotency_key)
    )
    xp_awarded = 0
    if not existing_xp.scalar_one_or_none():
        xp_awarded = level.xp
        db.add(XPTransaction(
            user_id=user_id,
            amount=xp_awarded,
            source="project",
            source_id=level.slug,
            idempotency_key=idempotency_key,
        ))
        user_q = await db.execute(select(User).where(User.id == user_id))
        user = user_q.scalar_one_or_none()
        if user:
            user.xp += xp_awarded

    # Unlock next level
    next_level_result = await db.execute(select(LearningLevel).where(LearningLevel.n == level.n + 1))
    next_level = next_level_result.scalar_one_or_none()
    next_slug = None

    if next_level:
        next_slug = next_level.slug
        next_prog_q = await db.execute(
            select(UserProjectProgress).where(
                UserProjectProgress.user_id == user_id,
                UserProjectProgress.level_id == next_level.id,
            )
        )
        next_prog = next_prog_q.scalar_one_or_none()
        if not next_prog:
            next_prog = UserProjectProgress(user_id=user_id, level_id=next_level.id, status="active", started_at=datetime.now(timezone.utc))
            db.add(next_prog)
        elif next_prog.status == "locked":
            next_prog.status = "active"
            next_prog.started_at = datetime.now(timezone.utc)

    await db.commit()

    return {
        "status": "completed",
        "slug": slug,
        "xp_awarded": xp_awarded,
        "next_level": next_slug,
    }


# ═══════════════════════ DASHBOARD ═══════════════════════

dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@dashboard_router.get("", response_model=DashboardResponse)
async def get_dashboard(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_q = await db.execute(select(User).where(User.id == user_id))
    user = user_q.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get levels with progress
    levels = await db.execute(select(LearningLevel).order_by(LearningLevel.n))
    all_levels = levels.scalars().all()
    prog_q = await db.execute(select(UserProjectProgress).where(UserProjectProgress.user_id == user_id))
    progress_map = {p.level_id: p for p in prog_q.scalars().all()}

    level_data = []
    for lv in all_levels:
        prog = progress_map.get(lv.id)
        status = prog.status if prog else ("active" if lv.n == 1 else "locked")
        progress = prog.progress if prog else 0.0
        level_data.append(LevelResponse(
            n=lv.n, role=lv.role, title=lv.title, algorithm=lv.algorithm,
            difficulty=lv.difficulty, duration=lv.duration, xp=lv.xp,
            status=status, progress=progress, slug=lv.slug,
            mission=lv.mission, concepts=_to_list(lv.concepts), gates=_to_list(lv.gates),
        ))

    # Challenge stats
    sub_q = await db.execute(
        select(func.count(Submission.id)).where(Submission.user_id == user_id, Submission.passed == True)
    )
    challenges_completed = sub_q.scalar() or 0

    # XP history for weekly sparkline
    xp_q = await db.execute(
        select(XPTransaction).where(XPTransaction.user_id == user_id).order_by(desc(XPTransaction.created_at)).limit(28)
    )
    xp_txns = xp_q.scalars().all()
    weekly_xp = [0] * 7
    for i, txn in enumerate(xp_txns[:7]):
        weekly_xp[6 - i] = txn.amount

    # Level thresholds
    xp_thresholds = [0, 2000, 5000, 10000, 20000, 50000]
    current_lv = user.current_level
    xp_to_next = xp_thresholds[min(current_lv, len(xp_thresholds) - 1)] - user.xp if current_lv < len(xp_thresholds) else 0

    # ── Personalized Recommendation based on real learner performance ──
    rec_q = await db.execute(
        select(UserConceptMastery)
        .where(UserConceptMastery.user_id == user_id)
        .order_by(UserConceptMastery.mastery.asc(), UserConceptMastery.attempts.desc())
    )
    weak_concept = rec_q.scalars().first()
    recommendation = None

    if weak_concept and weak_concept.attempts > 0 and weak_concept.mastery < 75:
        # Match with curriculum level
        matching_level = next(
            (lv for lv in all_levels if weak_concept.concept_name.lower() in lv.algorithm.lower() or any(weak_concept.concept_name.lower() in c.lower() for c in _to_list(lv.concepts))),
            all_levels[0] if all_levels else None
        )
        if matching_level:
            recommendation = {
                "concept": weak_concept.concept_name,
                "text": f"You're struggling with {weak_concept.concept_name} ({weak_concept.successes}/{weak_concept.attempts} passed, {weak_concept.mastery:.0f}% accuracy). Review {matching_level.title} to master this topic.",
                "action_label": "Review lesson",
                "link": f"/learn/{matching_level.slug}",
                "level_slug": matching_level.slug,
                "mastery": weak_concept.mastery,
            }
    elif current_lv <= len(level_data):
        curr = level_data[current_lv - 1]
        recommendation = {
            "concept": curr.algorithm,
            "text": f"Continue your quantum journey with {curr.title} ({curr.algorithm}).",
            "action_label": "Continue project",
            "link": f"/learn/{curr.slug}",
            "level_slug": curr.slug,
            "mastery": 100.0 if curr.status == "completed" else 0.0,
        }

    return DashboardResponse(
        user={
            "id": user.id, "name": user.name, "email": user.email,
            "avatar_initials": user.avatar_initials, "role": user.role,
        },
        current_level=current_lv,
        xp=user.xp,
        xp_to_next_level=max(0, xp_to_next),
        streak=user.streak,
        active_project=level_data[current_lv - 1].model_dump() if current_lv <= len(level_data) else None,
        recommendation=recommendation,
        weekly_xp=weekly_xp,
        stats={
            "challenges_completed": challenges_completed,
            "projects_completed": sum(1 for l in level_data if l.status == "completed"),
            "total_projects": len(level_data),
        },
        levels=level_data,
    )


# ═══════════════════════ CHALLENGES ═══════════════════════

challenges_router = APIRouter(prefix="/challenges", tags=["challenges"])


@challenges_router.get("", response_model=list[ChallengeListItem])
async def list_challenges(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ch_q = await db.execute(select(Challenge).order_by(Challenge.slug))
    challenges = ch_q.scalars().all()

    # Get user's best submissions
    sub_q = await db.execute(
        select(Submission.challenge_id, func.max(Submission.score), func.count(Submission.id))
        .where(Submission.user_id == user_id)
        .group_by(Submission.challenge_id)
    )
    sub_map = {row[0]: (row[1], row[2]) for row in sub_q.all()}

    result = []
    for ch in challenges:
        best, attempts = sub_map.get(ch.id, (0, 0))
        result.append(ChallengeListItem(
            id=ch.id, title=ch.title, algorithm=ch.algorithm,
            difficulty=ch.difficulty, xp=ch.xp_reward,
            best=best or 0, attempts=attempts or 0,
            done=best is not None and best >= 50,
            tone=ch.tone, statement=ch.statement,
        ))
    return result


@challenges_router.get("/{challenge_id}", response_model=ChallengeDetailResponse)
async def get_challenge(
    challenge_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ch_q = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    ch = ch_q.scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")

    sub_q = await db.execute(
        select(func.max(Submission.score), func.count(Submission.id))
        .where(Submission.user_id == user_id, Submission.challenge_id == challenge_id)
    )
    row = sub_q.one()
    best = row[0] or 0
    attempts = row[1] or 0

    return ChallengeDetailResponse(
        id=ch.id, title=ch.title, statement=ch.statement,
        algorithm=ch.algorithm, difficulty=ch.difficulty,
        xp=ch.xp_reward, tone=ch.tone,
        qubit_count=ch.qubit_count,
        allowed_gates=ch.allowed_gates or [],
        max_depth=ch.max_depth, max_gate_count=ch.max_gate_count,
        requirements=ch.requirements or [],
        hints=ch.hints or [],
        expected_output_display=ch.expected_output_display,
        best=best, attempts=attempts, done=best >= 50,
    )


@challenges_router.post("/{challenge_id}/submit", response_model=ChallengeSubmitResponse)
async def submit_challenge(
    challenge_id: str,
    body: ChallengeSubmitRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ch_q = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    ch = ch_q.scalar_one_or_none()
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Convert placements
    placements = [PlacementIn(**p) for p in body.placements]

    # Evaluate deterministically
    eval_result = evaluate_challenge(
        placements=placements,
        qubits=body.qubits,
        challenge_config={
            "target_probabilities": ch.target_probabilities or {},
            "allowed_gates": ch.allowed_gates or [],
            "max_depth": ch.max_depth,
            "max_gate_count": ch.max_gate_count,
            "weight_correctness": ch.weight_correctness,
            "weight_efficiency": ch.weight_efficiency,
            "weight_depth": ch.weight_depth,
            "weight_gate_count": ch.weight_gate_count,
        },
        framework=body.framework,
    )

    # Award XP (idempotent — only on first pass)
    xp_awarded = 0
    if eval_result.passed:
        idempotency_key = f"challenge:{challenge_id}:user:{user_id}"
        existing = await db.execute(
            select(XPTransaction).where(XPTransaction.idempotency_key == idempotency_key)
        )
        if not existing.scalar_one_or_none():
            xp_awarded = ch.xp_reward
            db.add(XPTransaction(
                user_id=user_id, amount=xp_awarded,
                source="challenge", source_id=challenge_id,
                idempotency_key=idempotency_key,
            ))
            # Update user XP
            user_q = await db.execute(select(User).where(User.id == user_id))
            user = user_q.scalar_one_or_none()
            if user:
                user.xp += xp_awarded

    # Save submission
    submission = Submission(
        challenge_id=challenge_id, user_id=user_id,
        circuit_json=body.placements, qubits=body.qubits,
        framework=body.framework, score=eval_result.score,
        correctness=eval_result.correctness, efficiency=eval_result.efficiency,
        depth_score=eval_result.depth_score, gate_count_score=eval_result.gate_count_score,
        passed=eval_result.passed, actual_depth=eval_result.actual_depth,
        actual_gate_count=eval_result.actual_gate_count,
        simulation_results=eval_result.simulation_result,
        feedback=eval_result.feedback, xp_awarded=xp_awarded,
    )
    db.add(submission)

    # Update UserConceptMastery for real performance tracking
    concept_key = ch.algorithm or ch.title
    mastery_entry = await db.execute(
        select(UserConceptMastery).where(
            UserConceptMastery.user_id == user_id,
            UserConceptMastery.concept_name == concept_key
        )
    )
    cm = mastery_entry.scalar_one_or_none()
    if not cm:
        cm = UserConceptMastery(
            user_id=user_id,
            concept_name=concept_key,
            attempts=1,
            successes=1 if eval_result.passed else 0,
            mastery=100.0 if eval_result.passed else 0.0,
        )
        db.add(cm)
    else:
        cm.attempts += 1
        if eval_result.passed:
            cm.successes += 1
        cm.mastery = round((cm.successes / cm.attempts) * 100.0, 1)

    return ChallengeSubmitResponse(
        passed=eval_result.passed, score=eval_result.score,
        correctness=eval_result.correctness, efficiency=eval_result.efficiency,
        depth=eval_result.actual_depth, gate_count=eval_result.actual_gate_count,
        xp_awarded=xp_awarded, feedback=eval_result.feedback,
    )


# ═══════════════════════ PROGRESS / PROFILE ═══════════════════════

progress_router = APIRouter(prefix="/progress", tags=["progress"])


@progress_router.get("", response_model=ProfileResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_q = await db.execute(select(User).where(User.id == user_id))
    user = user_q.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Concept mastery (skill radar)
    mastery_q = await db.execute(
        select(UserConceptMastery).where(UserConceptMastery.user_id == user_id)
    )
    masteries = mastery_q.scalars().all()

    default_skills = ["Quantum Gates", "Superposition", "Entanglement", "Measurement", "Optimization", "Quantum ML"]
    mastery_map = {m.concept_name: m.mastery for m in masteries}
    skill_radar = [
        SkillRadarItem(skill=s, value=mastery_map.get(s, 0.0))
        for s in default_skills
    ]

    # Badges
    ach_q = await db.execute(select(Achievement).order_by(Achievement.order))
    all_achievements = ach_q.scalars().all()
    earned_q = await db.execute(
        select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
    )
    earned_ids = {row[0] for row in earned_q.all()}

    badges = [
        BadgeResponse(name=a.name, tone=a.tone, earned=a.id in earned_ids, desc=a.description)
        for a in all_achievements
    ]

    # Stats
    sub_q = await db.execute(
        select(func.count(Submission.id), func.avg(Submission.score))
        .where(Submission.user_id == user_id, Submission.passed == True)
    )
    stats_row = sub_q.one()

    sorted_skills = sorted(skill_radar, key=lambda s: s.value, reverse=True)

    return ProfileResponse(
        user={
            "id": user.id, "name": user.name, "email": user.email,
            "avatar_initials": user.avatar_initials, "xp": user.xp,
            "current_level": user.current_level, "streak": user.streak, "role": user.role,
        },
        skill_radar=skill_radar,
        badges=badges,
        stats={
            "challenges_completed": stats_row[0] or 0,
            "avg_score": round(stats_row[1] or 0),
        },
        strongest_concepts=[{"name": s.skill, "value": s.value} for s in sorted_skills[:2]],
        weakest_concepts=[{"name": s.skill, "value": s.value} for s in sorted_skills[-2:]],
    )


@progress_router.get("/achievements", response_model=list[BadgeResponse])
async def get_achievements(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    ach_q = await db.execute(select(Achievement).order_by(Achievement.order))
    all_achievements = ach_q.scalars().all()
    earned_q = await db.execute(
        select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
    )
    earned_ids = {row[0] for row in earned_q.all()}
    return [
        BadgeResponse(name=a.name, tone=a.tone, earned=a.id in earned_ids, desc=a.description)
        for a in all_achievements
    ]


# ═══════════════════════ LEADERBOARD ═══════════════════════

leaderboard_router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@leaderboard_router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    scope: str = "global",
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    users_q = await db.execute(
        select(User).where(User.role == "student").order_by(desc(User.xp)).limit(20)
    )
    users = users_q.scalars().all()

    entries = []
    your_rank = 0
    your_xp = 0
    your_eff = 0

    for i, u in enumerate(users, 1):
        # Get challenge count
        sub_q = await db.execute(
            select(func.count(Submission.id)).where(Submission.user_id == u.id, Submission.passed == True)
        )
        ch_count = sub_q.scalar() or 0

        # Efficiency approximation
        total_q = await db.execute(
            select(func.count(Submission.id)).where(Submission.user_id == u.id)
        )
        total = total_q.scalar() or 1
        eff = round((ch_count / max(total, 1)) * 100)

        is_you = u.id == user_id
        if is_you:
            your_rank = i
            your_xp = u.xp
            your_eff = eff

        entries.append(LeaderboardEntry(
            rank=i, name=u.name, level=u.current_level,
            xp=u.xp, challenges=ch_count, eff=eff, you=is_you,
        ))

    return LeaderboardResponse(entries=entries, your_rank=your_rank, your_xp=your_xp, your_eff=your_eff)


# ═══════════════════════ HISTORY ═══════════════════════

history_router = APIRouter(prefix="/history", tags=["history"])


@history_router.get("", response_model=list[HistoryItem])
async def get_history(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.simulation import SimulationResult
    sim_q = await db.execute(
        select(SimulationResult).where(SimulationResult.user_id == user_id)
        .order_by(desc(SimulationResult.created_at)).limit(50)
    )
    sims = sim_q.scalars().all()

    return [
        HistoryItem(
            project=f"Circuit #{i + 1}",
            algorithm="Custom",
            sdk=s.framework.capitalize(),
            score=85,  # derived from last simulation
            date=s.created_at.strftime("%b %d, %Y") if s.created_at else "",
            depth=s.depth,
            status="Passed" if s.success else "Failed",
        )
        for i, s in enumerate(sims)
    ]


# ═══════════════════════ AI TUTOR ═══════════════════════

tutor_router = APIRouter(prefix="/tutor", tags=["tutor"])


def _build_tutor_context(body: TutorChatRequest) -> dict:
    """Build the full context dict from the enriched TutorChatRequest."""
    return {
        "placements": body.placements,
        "qubits": body.qubits,
        "classical_bits": body.classical_bits,
        "simulation_result": body.simulation_result,
        "project_slug": body.project_slug,
        "challenge_id": body.challenge_id,
        "level": body.level,
        "lesson": body.lesson,
        "challenge_context": body.challenge_context,
        "available_gates": body.available_gates,
        "conversation_history": body.conversation_history,
        "mission": body.mission,
        "success_criteria": body.success_criteria,
        "concepts": body.concepts,
        "selected_gate": body.selected_gate,
        "student_history": body.student_history,
        "mode": body.mode,
    }


@tutor_router.post("/chat", response_model=TutorResponse)
async def tutor_chat(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    context = _build_tutor_context(body)

    # University RAG context retrieval
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()
    if user and user.university_id:
        from app.services.ai.vector_store import get_vector_store
        import json
        from app.core.logging import logger

        vector_store = get_vector_store()
        try:
            chunks = await vector_store.similarity_search(
                query=body.question,
                university_id=user.university_id,
                db=db,
                limit=3,
                min_score=0.05,
                allow_global=False,
            )
            doc_ids = list({chunk.document_id for chunk, _ in chunks})
            doc_map = {}
            if doc_ids:
                from app.models.university import UniversityDocument
                docs_res = await db.execute(select(UniversityDocument).where(UniversityDocument.id.in_(doc_ids)))
                for d in docs_res.scalars().all():
                    doc_map[d.id] = d

            citations = []
            for chunk, score in chunks:
                doc = doc_map.get(chunk.document_id)
                citations.append({
                    "document_id": chunk.document_id,
                    "document_title": doc.title if doc else "University Document",
                    "chunk_index": chunk.chunk_index,
                    "page_number": chunk.page_number,
                    "section_title": chunk.section_title,
                    "subject": chunk.subject_id,
                    "course": chunk.course_id,
                    "content": chunk.content,
                    "similarity_score": round(score, 4),
                })
            context["university_citations"] = citations
            context["university_id"] = user.university_id
        except Exception as e:
            logger.warning(f"Failed to query university vector store for tutor: {e}")

    result = await tutor.chat(body.question, context)
    return TutorResponse(**result)


@tutor_router.post("/explain-circuit", response_model=TutorResponse)
async def tutor_explain(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    context = _build_tutor_context(body)
    result = await tutor.explain_circuit(context)
    return TutorResponse(**result)


@tutor_router.post("/debug", response_model=TutorResponse)
async def tutor_debug(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    context = _build_tutor_context(body)
    result = await tutor.debug_circuit(context)
    return TutorResponse(**result)


@tutor_router.post("/hint", response_model=TutorResponse)
async def tutor_hint(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    context = _build_tutor_context(body)
    result = await tutor.give_hint(context)
    return TutorResponse(**result)


@tutor_router.post("/optimize", response_model=TutorResponse)
async def tutor_optimize(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    context = _build_tutor_context(body)
    result = await tutor.optimize(context)
    return TutorResponse(**result)


@tutor_router.post("/verify", response_model=TutorResponse)
async def tutor_verify(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    context = _build_tutor_context(body)
    result = await tutor.verify(context)
    return TutorResponse(**result)


@tutor_router.post("/what-if", response_model=TutorResponse)
async def tutor_what_if(
    body: TutorChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    context = _build_tutor_context(body)
    result = await tutor.what_if(body.question, context)
    return TutorResponse(**result)


# ═══════════════════════ INSTRUCTOR ═══════════════════════

instructor_router = APIRouter(prefix="/instructor", tags=["instructor"])


@instructor_router.get("/dashboard", response_model=InstructorDashboardResponse)
async def instructor_dashboard(
    user_id: str = Depends(require_role("instructor", "admin")),
    db: AsyncSession = Depends(get_db),
):
    # Student count
    student_q = await db.execute(select(func.count(User.id)).where(User.role == "student"))
    student_count = student_q.scalar() or 0

    # Avg progress
    prog_q = await db.execute(select(func.avg(UserProjectProgress.progress)))
    avg_progress = round(prog_q.scalar() or 0)

    # Avg score
    score_q = await db.execute(select(func.avg(Submission.score)))
    avg_score = round(score_q.scalar() or 0)

    # Completion rate
    completed_q = await db.execute(
        select(func.count(UserProjectProgress.id)).where(UserProjectProgress.status == "completed")
    )
    total_q = await db.execute(select(func.count(UserProjectProgress.id)))
    total_prog = total_q.scalar() or 1
    completion_rate = round((completed_q.scalar() or 0) / max(total_prog, 1) * 100)

    # Weekly progress series (simulated for now)
    progress_series = [
        {"week": f"W{i + 1}", "classAvg": 40 + i * 3, "top": 60 + i * 3}
        for i in range(8)
    ]

    # Concept difficulty
    concept_difficulty = [
        {"concept": "Entanglement", "fail": 52},
        {"concept": "Phase Kickback", "fail": 47},
        {"concept": "QFT", "fail": 40},
        {"concept": "Grover Oracle", "fail": 35},
        {"concept": "Superposition", "fail": 18},
        {"concept": "Measurement", "fail": 12},
    ]

    # At-risk students
    students_q = await db.execute(
        select(User).where(User.role == "student").order_by(User.xp).limit(4)
    )
    at_risk = []
    for s in students_q.scalars().all():
        prog_sq = await db.execute(
            select(func.avg(UserProjectProgress.progress)).where(UserProjectProgress.user_id == s.id)
        )
        progress_val = round(prog_sq.scalar() or 15)
        fail_q = await db.execute(
            select(func.count(Submission.id)).where(Submission.user_id == s.id, Submission.passed == False)
        )
        failed = fail_q.scalar() or 0
        risk = "High" if progress_val < 25 else "Medium" if progress_val < 50 else "Low"
        at_risk.append({
            "name": s.name, "progress": progress_val, "failed": failed,
            "concept": "Entanglement", "risk": risk,
            "action": "Assign targeted practice on entanglement concepts",
        })

    return InstructorDashboardResponse(
        stats={
            "students": student_count, "avg_progress": avg_progress,
            "avg_score": avg_score, "completion_rate": completion_rate,
            "at_risk_count": len(at_risk),
        },
        progress_series=progress_series,
        concept_difficulty=concept_difficulty,
        at_risk=at_risk,
    )


@instructor_router.get("/assignments", response_model=list[AssignmentResponse])
async def list_assignments(
    user_id: str = Depends(require_role("instructor", "admin")),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(
        select(InstructorAssignment).where(InstructorAssignment.instructor_id == user_id)
        .order_by(desc(InstructorAssignment.created_at))
    )
    assignments = q.scalars().all()

    result = []
    for a in assignments:
        sub_q = await db.execute(
            select(func.count(AssignmentSubmission.id)).where(AssignmentSubmission.assignment_id == a.id)
        )
        submitted = sub_q.scalar() or 0
        result.append(AssignmentResponse(
            title=a.title, algorithm=a.algorithm, difficulty=a.difficulty,
            due=a.due_date.strftime("%b %d") if a.due_date else "No deadline",
            submitted=submitted, total=a.total_students, status=a.status,
        ))
    return result


@instructor_router.post("/assignments", response_model=AssignmentResponse, status_code=201)
async def create_assignment(
    body: AssignmentCreate,
    user_id: str = Depends(require_role("instructor", "admin")),
    db: AsyncSession = Depends(get_db),
):
    assignment = InstructorAssignment(
        instructor_id=user_id,
        title=body.title, description=body.description,
        algorithm=body.algorithm, difficulty=body.difficulty,
        qubit_count=body.qubit_count, max_depth=body.max_depth,
        target_result=body.target_result, xp_reward=body.xp_reward,
        allowed_gates=body.allowed_gates, hints=body.hints,
        status="Open",
    )
    db.add(assignment)
    await db.flush()

    return AssignmentResponse(
        title=assignment.title, algorithm=assignment.algorithm,
        difficulty=assignment.difficulty, due="No deadline",
        submitted=0, total=assignment.total_students, status="Open",
    )


@instructor_router.get("/assignments/{assignment_id}/submissions", response_model=list[SubmissionListItem])
async def list_assignment_submissions(
    assignment_id: str,
    user_id: str = Depends(require_role("instructor", "admin")),
    db: AsyncSession = Depends(get_db),
):
    q = await db.execute(
        select(AssignmentSubmission, User)
        .join(User, User.id == AssignmentSubmission.user_id)
        .where(AssignmentSubmission.assignment_id == assignment_id)
    )
    rows = q.all()

    return [
        SubmissionListItem(
            name=user.name, score=sub.score,
            correctness=sub.correctness, efficiency=sub.efficiency,
            attempts=sub.attempts,
            status="Passed" if sub.score >= 50 else "Needs review" if sub.score >= 30 else "Failed",
        )
        for sub, user in rows
    ]
