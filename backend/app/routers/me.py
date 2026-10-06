from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.repositories.user_repo import UserRepository
from app.routers.deps import get_current_user
from app.schemas.user import (
    AchievementRead,
    HeartStatusResponse,
    LeaderboardUserRead,
    RefillHeartsResponse,
    UserRead,
    UserUpdate,
)
from app.services.hearts_service import HeartsService

router = APIRouter(tags=["me"])


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = UserRepository(db)
    if update_data.daily_goal_xp is not None:
        current_user.daily_goal_xp = update_data.daily_goal_xp
    if update_data.username is not None:
        current_user.username = update_data.username
    return repo.update(current_user)


@router.get("/me/hearts", response_model=HeartStatusResponse)
def get_my_hearts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HeartsService(db)
    hearts, max_hearts, next_secs = service.get_current_hearts(current_user)
    return HeartStatusResponse(
        hearts=hearts,
        max_hearts=max_hearts,
        next_heart_in_seconds=next_secs,
        gems=current_user.gems,
    )


@router.post("/me/hearts/refill", response_model=RefillHeartsResponse)
def refill_my_hearts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HeartsService(db)
    hearts, gems = service.refill_hearts(current_user)
    return RefillHeartsResponse(
        success=True,
        hearts=hearts,
        gems=gems,
        message="Hearts refilled to maximum!",
    )


@router.get("/me/achievements", response_model=list[AchievementRead])
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = UserRepository(db)
    all_achievements = repo.get_all_achievements()
    user_achievements = {ua.achievement_id: ua.unlocked_at for ua in repo.get_user_achievements(current_user.id)}

    results: list[AchievementRead] = []
    for ach in all_achievements:
        unlocked = ach.id in user_achievements
        unlocked_at = user_achievements.get(ach.id)
        results.append(
            AchievementRead(
                id=ach.id,
                key=ach.key,
                title=ach.title,
                description=ach.description,
                threshold=ach.threshold,
                unlocked=unlocked,
                unlocked_at=unlocked_at,
            )
        )
    return results


@router.get("/leaderboard", response_model=list[LeaderboardUserRead])
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = UserRepository(db)
    users = repo.get_leaderboard(limit=50)

    # Ensure current user is in leaderboard list
    user_ids = {u.id for u in users}
    if current_user.id not in user_ids:
        users.append(current_user)
        users.sort(key=lambda u: (u.total_xp, u.streak), reverse=True)

    results: list[LeaderboardUserRead] = []
    for rank, u in enumerate(users, start=1):
        results.append(
            LeaderboardUserRead(
                id=u.id,
                username=u.username,
                total_xp=u.total_xp,
                streak=u.streak,
                gems=u.gems,
                rank=rank,
                is_current_user=(u.id == current_user.id),
            )
        )
    return results
