from datetime import date
from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.clock import get_today
from app.database import get_db
from app.models import User
from app.repositories.user_repo import UserRepository
from app.services.hearts_service import HeartsService


def get_today_dep(request: Request) -> date:
    """Dependency returning today's date honoring X-Debug-Date header."""
    return get_today(request)


def get_current_user(db: Session = Depends(get_db)) -> User:
    """Dependency returning the default learner user with synced hearts."""
    user_repo = UserRepository(db)
    user = user_repo.get_default_user()
    hearts_service = HeartsService(db)
    hearts_service.get_current_hearts(user)
    return user
