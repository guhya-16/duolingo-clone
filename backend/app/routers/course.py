from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.routers.deps import get_current_user
from app.schemas.course import CoursePathResponse
from app.services.path_service import PathService

router = APIRouter(tags=["course"])


@router.get("/course/path", response_model=CoursePathResponse)
def get_course_path(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PathService(db)
    return service.get_user_path(current_user.id)
