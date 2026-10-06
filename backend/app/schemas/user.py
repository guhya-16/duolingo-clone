from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    id: int
    username: str
    total_xp: int
    hearts: int
    hearts_updated_at: datetime
    streak: int
    last_active_date: Optional[date] = None
    daily_goal_xp: int
    gems: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    daily_goal_xp: Optional[int] = None
    username: Optional[str] = None


class HeartStatusResponse(BaseModel):
    hearts: int
    max_hearts: int
    next_heart_in_seconds: Optional[int] = None
    gems: int


class RefillHeartsResponse(BaseModel):
    success: bool
    hearts: int
    gems: int
    message: str


class AchievementRead(BaseModel):
    id: int
    key: str
    title: str
    description: Optional[str] = None
    threshold: int
    unlocked: bool
    unlocked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LeaderboardUserRead(BaseModel):
    id: int
    username: str
    total_xp: int
    streak: int
    gems: int
    rank: int
    is_current_user: bool = False

    model_config = ConfigDict(from_attributes=True)