from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import get_db
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserRead
from app.seed import seed_database

router = APIRouter(prefix="/dev", tags=["dev"])


@router.post("/reset", response_model=UserRead)
def dev_reset(db: Session = Depends(get_db)):
    """Reseeds the database to fresh initial state and returns the default user."""
    if not settings.ENABLE_DEV_ENDPOINTS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "dev_endpoints_disabled", "message": "Dev endpoints are disabled."},
        )

    # Reseed using the active database engine
    active_engine = db.get_bind()
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=active_engine)
    seed_database(target_engine=active_engine, target_session_factory=session_factory, reset=True)

    # Fetch fresh default user
    user_repo = UserRepository(db)
    user = user_repo.get_default_user()
    return user
