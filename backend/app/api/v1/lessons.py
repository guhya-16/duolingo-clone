from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.time import get_today
from app.models import User
from app.schemas.lesson import (
    ExerciseClientView, AnswerSubmitRequest,
    AnswerResultResponse, LessonCompleteRequest, LessonCompleteResponse
)
from app.services.lesson_service import LessonService
from app.repositories.lesson_repo import LessonRepository

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.get("/{lesson_id}/exercises", response_model=List[ExerciseClientView])
def get_exercises(lesson_id: int, db: Session = Depends(get_db)):
    repo = LessonRepository(db)
    exercises = repo.get_exercises_for_lesson(lesson_id)
    return [
        ExerciseClientView(
            id=ex.id,
            type=ex.type,
            prompt=ex.prompt,
            options=ex.options,
            order=ex.order
        ) for ex in exercises
    ]

@router.post("/verify", response_model=AnswerResultResponse)
def verify_answer(
    req: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = LessonService(db)
    result = service.verify_answer(user, req.exercise_id, req.submission)
    return AnswerResultResponse(**result)

@router.post("/complete", response_model=LessonCompleteResponse)
def complete_lesson(
    req: LessonCompleteRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = LessonService(db)
    today = get_today(request)
    updated_user = service.complete_lesson(user, req.lesson_id, req.xp_earned, today)
    return LessonCompleteResponse(
        success=True,
        total_xp=updated_user.total_xp,
        streak=updated_user.current_streak,
        hearts=updated_user.hearts
    )