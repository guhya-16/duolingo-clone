from typing import Generator
from fastapi import Depends, Request
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.time import get_today
from app.models import User
from app.repositories.user_repo import UserRepository
from app.services.game_service import GameService

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_repo = UserRepository(db)
    user = user_repo.get_default_user()
    game_service = GameService(db)
    user = game_service.sync_user_hearts(user)
    db.commit()
    return user