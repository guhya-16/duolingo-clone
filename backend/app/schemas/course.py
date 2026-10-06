from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

SkillStatus = Literal["locked", "available", "completed"]


class SkillPathRead(BaseModel):
    id: int
    title: str
    position: int
    max_level: int
    level_completed: int
    status: SkillStatus
    current_lesson_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class UnitPathRead(BaseModel):
    id: int
    title: str
    position: int
    skills: list[SkillPathRead]

    model_config = ConfigDict(from_attributes=True)


class CoursePathResponse(BaseModel):
    course_id: int
    title: str
    code: str
    language: str
    units: list[UnitPathRead]

    model_config = ConfigDict(from_attributes=True)
