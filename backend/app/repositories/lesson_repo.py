from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Exercise, Lesson, Skill


class LessonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_lesson(self, lesson_id: int) -> Optional[Lesson]:
        return self.db.scalar(
            select(Lesson)
            .options(
                selectinload(Lesson.exercises),
                selectinload(Lesson.skill),
            )
            .where(Lesson.id == lesson_id)
        )

    def get_exercise(self, exercise_id: int) -> Optional[Exercise]:
        return self.db.get(Exercise, exercise_id)

    def get_skill_lessons(self, skill_id: int) -> list[Lesson]:
        return list(
            self.db.scalars(
                select(Lesson)
                .where(Lesson.skill_id == skill_id)
                .order_by(Lesson.position)
            ).all()
        )