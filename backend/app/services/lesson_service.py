import re
import unicodedata
from datetime import date
from typing import Any
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Exercise, ExerciseType, Lesson, User
from app.repositories.course_repo import CourseRepository
from app.repositories.lesson_repo import LessonRepository
from app.repositories.user_repo import UserRepository
from app.schemas.lesson import (
    AnswerCheckResponse,
    ExerciseClientRead,
    LessonClientRead,
    LessonCompleteResponse,
)
from app.services.hearts_service import HeartsService
from app.services.path_service import PathService
from app.services.streak_service import StreakService


def normalize_text(text: str) -> str:
    """Normalize text: lowercase, strip accents, punctuation, and extra whitespace."""
    text = str(text).strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[¿?¡!.,;:\"'()\-]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def sanitize_payload_for_client(ex_type: ExerciseType, payload: dict[str, Any]) -> dict[str, Any]:
    """Strips all solution keys from exercise payload before sending to client."""
    clean = dict(payload)
    if ex_type == ExerciseType.MULTIPLE_CHOICE:
        clean.pop("correct_index", None)
    elif ex_type == ExerciseType.TRANSLATE_WORD_BANK:
        clean.pop("correct_answer", None)
    elif ex_type == ExerciseType.FILL_BLANK:
        clean.pop("correct_option", None)
    elif ex_type == ExerciseType.TYPE_ANSWER:
        clean.pop("accepted_answers", None)
    return clean


class LessonService:
    def __init__(self, db: Session):
        self.db = db
        self.lesson_repo = LessonRepository(db)
        self.user_repo = UserRepository(db)
        self.course_repo = CourseRepository(db)
        self.hearts_service = HeartsService(db)
        self.path_service = PathService(db)

    def get_lesson_client(self, lesson_id: int, user: User | None = None) -> LessonClientRead:
        """Returns lesson and exercises with solution keys removed.
        
        Enforces skill locking check when user is provided.
        """
        lesson = self.lesson_repo.get_lesson(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        if user and self.path_service.is_skill_locked(user.id, lesson.skill_id):
            raise HTTPException(
                status_code=403,
                detail={"code": "skill_locked", "message": "This skill is locked. Complete previous skills first."},
            )

        exercises_client: list[ExerciseClientRead] = []
        for ex in sorted(lesson.exercises, key=lambda e: e.position):
            clean_payload = sanitize_payload_for_client(ex.type, ex.payload)
            exercises_client.append(
                ExerciseClientRead(
                    id=ex.id,
                    lesson_id=ex.lesson_id,
                    type=ex.type.value,
                    payload=clean_payload,
                    position=ex.position,
                )
            )

        return LessonClientRead(
            id=lesson.id,
            skill_id=lesson.skill_id,
            skill_title=lesson.skill.title if lesson.skill else "Skill",
            position=lesson.position,
            level=lesson.level,
            exercises=exercises_client,
        )

    def check_answer(
        self, user: User, lesson_id: int, exercise_id: int, answer: Any
    ) -> AnswerCheckResponse:
        """Evaluates answer server-side per exercise type. Deducts heart on mistake."""
        # 1. Block answering if user has 0 hearts
        hearts, _, _ = self.hearts_service.get_current_hearts(user)
        if hearts <= 0:
            raise HTTPException(
                status_code=403,
                detail={"code": "out_of_hearts", "message": "You have 0 hearts left."},
            )

        exercise = self.lesson_repo.get_exercise(exercise_id)
        if not exercise:
            raise HTTPException(status_code=404, detail="Exercise not found")

        lesson = exercise.lesson
        if not lesson or lesson.id != lesson_id:
            lesson = self.lesson_repo.get_lesson(lesson_id)

        # 2. Block answering if skill is locked
        if lesson and self.path_service.is_skill_locked(user.id, lesson.skill_id):
            raise HTTPException(
                status_code=403,
                detail={"code": "skill_locked", "message": "This skill is locked."},
            )

        payload = exercise.payload
        is_correct = False
        correct_answer_display: Any = None

        if exercise.type == ExerciseType.MULTIPLE_CHOICE:
            correct_idx = payload["correct_index"]
            expected_option = payload["options"][correct_idx]
            correct_answer_display = expected_option

            if isinstance(answer, int):
                is_correct = (answer == correct_idx)
            elif isinstance(answer, str):
                is_correct = (normalize_text(answer) == normalize_text(expected_option))

        elif exercise.type == ExerciseType.TRANSLATE_WORD_BANK:
            expected_words = payload["correct_answer"]
            correct_answer_display = " ".join(expected_words)

            if isinstance(answer, list):
                sub_norm = [normalize_text(w) for w in answer]
                exp_norm = [normalize_text(w) for w in expected_words]
                is_correct = (sub_norm == exp_norm)
            elif isinstance(answer, str):
                is_correct = (normalize_text(answer) == normalize_text(correct_answer_display))

        elif exercise.type == ExerciseType.MATCH_PAIRS:
            expected_pairs = payload["pairs"]
            correct_answer_display = expected_pairs

            if answer is True:
                is_correct = True
            elif isinstance(answer, list):
                expected_map = {normalize_text(p["left"]): normalize_text(p["right"]) for p in expected_pairs}
                sub_map = {normalize_text(p.get("left", "")): normalize_text(p.get("right", "")) for p in answer}
                is_correct = (expected_map == sub_map)

        elif exercise.type == ExerciseType.FILL_BLANK:
            expected = payload["correct_option"]
            correct_answer_display = expected
            is_correct = (normalize_text(str(answer)) == normalize_text(expected))

        elif exercise.type == ExerciseType.TYPE_ANSWER:
            accepted = payload["accepted_answers"]
            correct_answer_display = accepted[0]
            sub_norm = normalize_text(str(answer))
            is_correct = any(normalize_text(a) == sub_norm for a in accepted)

        # Deduct heart on incorrect answer
        if not is_correct:
            remaining_hearts = self.hearts_service.lose_heart(user)
        else:
            remaining_hearts = user.hearts

        return AnswerCheckResponse(
            correct=is_correct,
            correct_answer=correct_answer_display,
            hearts=remaining_hearts,
            message="Nicely done!" if is_correct else "Incorrect solution",
        )

    def complete_lesson(
        self, user: User, lesson_id: int, mistakes: int, today: date
    ) -> LessonCompleteResponse:
        """Completes a lesson in ONE transactional unit.
        
        Enforces skill locking, level locking, and mistakes clamping.
        """
        lesson = self.lesson_repo.get_lesson(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        # 1. Skill lock check
        if self.path_service.is_skill_locked(user.id, lesson.skill_id):
            raise HTTPException(
                status_code=403,
                detail={"code": "skill_locked", "message": "This skill is locked."},
            )

        # 2. Level lock check
        user_progress_map = self.course_repo.get_all_user_skill_progress(user.id)
        current_level_done = user_progress_map.get(lesson.skill_id, 0)
        if lesson.level > current_level_done + 1:
            raise HTTPException(
                status_code=403,
                detail={"code": "level_locked", "message": "This level is locked. Complete previous level first."},
            )

        try:
            # 3. Mistakes clamping and XP calculation
            num_exercises = len(lesson.exercises) or 8
            original_mistakes = mistakes
            clamped_mistakes = max(0, min(mistakes, num_exercises))
            # Perfect-lesson bonus applies ONLY if unmodified client mistakes was 0
            is_perfect = (original_mistakes == 0 and clamped_mistakes == 0)
            xp_earned = 15 if is_perfect else 10

            user.total_xp += xp_earned
            self.user_repo.add_xp_event(user.id, xp_amount=xp_earned, lesson_id=lesson.id)

            # 4. Upsert Daily Activity
            daily_act = self.user_repo.upsert_daily_activity(
                user.id, today, xp_earned=xp_earned, lessons_increment=1
            )

            # 5. Update Streak
            StreakService.update_streak(user, today)

            # 6. Bump User Skill Progress (level_completed never decreases)
            new_level = max(current_level_done, lesson.level)
            skill_prog = self.course_repo.upsert_user_skill_progress(
                user.id, lesson.skill_id, new_level=new_level
            )

            # 7. Check & Unlock Achievements
            new_unlocked: list[str] = []
            all_achs = {a.key: a for a in self.user_repo.get_all_achievements()}
            user_ach_ids = {ua.achievement_id for ua in self.user_repo.get_user_achievements(user.id)}

            def try_unlock(key: str):
                ach = all_achs.get(key)
                if ach and ach.id not in user_ach_ids:
                    self.user_repo.unlock_achievement(user.id, ach.id)
                    new_unlocked.append(ach.title)

            try_unlock("first_lesson")
            if user.streak >= 3:
                try_unlock("streak_3")
            if user.streak >= 7:
                try_unlock("streak_7")
            if user.total_xp >= 100:
                try_unlock("xp_100")
            if user.total_xp >= 500:
                try_unlock("xp_500")
            if is_perfect:
                try_unlock("perfect_lesson")
            if daily_act.xp_earned >= user.daily_goal_xp:
                try_unlock("daily_goal")

            all_prog = self.course_repo.get_all_user_skill_progress(user.id)
            if sum(1 for lvl in all_prog.values() if lvl >= 2) >= 3:
                try_unlock("skills_3")

            # 8. Commit single atomic transaction
            self.db.commit()
            self.db.refresh(user)

            return LessonCompleteResponse(
                xp_earned=xp_earned,
                total_xp=user.total_xp,
                streak=user.streak,
                daily_xp=daily_act.xp_earned,
                daily_goal=user.daily_goal_xp,
                level_completed=skill_prog.level_completed,
                new_achievements=new_unlocked,
            )
        except Exception as e:
            self.db.rollback()
            raise e