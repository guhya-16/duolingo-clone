from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class ExerciseClientRead(BaseModel):
    id: int
    lesson_id: int
    type: str
    payload: dict[str, Any]
    position: int

    model_config = ConfigDict(from_attributes=True)


class LessonClientRead(BaseModel):
    id: int
    skill_id: int
    skill_title: str
    position: int
    level: int
    exercises: list[ExerciseClientRead]

    model_config = ConfigDict(from_attributes=True)


class AnswerSubmitRequest(BaseModel):
    exercise_id: int
    answer: Any


class AnswerCheckResponse(BaseModel):
    correct: bool
    correct_answer: Any
    hearts: int
    message: Optional[str] = None


class LessonCompleteRequest(BaseModel):
    mistakes: int = 0


class LessonCompleteResponse(BaseModel):
    xp_earned: int
    total_xp: int
    streak: int
    daily_xp: int
    daily_goal: int
    level_completed: int
    new_achievements: list[str] = []