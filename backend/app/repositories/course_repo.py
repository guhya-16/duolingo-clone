from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Course, Skill, Unit, UserSkillProgress


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_default_course(self) -> Optional[Course]:
        return self.db.scalar(
            select(Course)
            .options(
                selectinload(Course.units)
                .selectinload(Unit.skills)
                .selectinload(Skill.lessons)
            )
            .where(Course.code == "es")
        )

    def get_user_skill_progress(self, user_id: int, skill_id: int) -> Optional[UserSkillProgress]:
        return self.db.scalar(
            select(UserSkillProgress).where(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.skill_id == skill_id,
            )
        )

    def get_all_user_skill_progress(self, user_id: int) -> dict[int, int]:
        """Returns map of {skill_id: level_completed} for user."""
        records = self.db.scalars(
            select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
        ).all()
        return {r.skill_id: r.level_completed for r in records}

    def upsert_user_skill_progress(
        self, user_id: int, skill_id: int, new_level: int
    ) -> UserSkillProgress:
        progress = self.get_user_skill_progress(user_id, skill_id)
        if not progress:
            progress = UserSkillProgress(
                user_id=user_id,
                skill_id=skill_id,
                level_completed=new_level,
            )
            self.db.add(progress)
        else:
            if new_level > progress.level_completed:
                progress.level_completed = new_level
            self.db.add(progress)
        return progress
