from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.deps import get_current_user, get_today_dep
from app.schemas.lesson import (
    AnswerCheckResponse,
    AnswerSubmitRequest,
    LessonClientRead,
    LessonCompleteRequest,
    LessonCompleteResponse,
)
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{lesson_id}", response_model=LessonClientRead)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = LessonService(db)
    return service.get_lesson_client(lesson_id, user=current_user)


@router.post("/{lesson_id}/answer", response_model=AnswerCheckResponse)
def check_answer(
    lesson_id: int,
    request: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = LessonService(db)
    return service.check_answer(current_user, lesson_id, request.exercise_id, request.answer)


@router.post("/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson(
    lesson_id: int,
    request: LessonCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    today: date = Depends(get_today_dep),
):
    service = LessonService(db)
    return service.complete_lesson(current_user, lesson_id, request.mistakes, today)
