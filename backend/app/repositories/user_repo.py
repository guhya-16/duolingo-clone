from datetime import date
from typing import Optional
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.core.clock import utcnow
from app.models import (
    Achievement,
    DailyActivity,
    User,
    UserAchievement,
    XpEvent,
)


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_default_user(self) -> User:
        """Returns the default 'learner' user or creates one if not found."""
        user = self.db.scalar(select(User).where(User.username == "learner"))
        if not user:
            user = User(
                username="learner",
                total_xp=0,
                hearts=5,
                hearts_updated_at=utcnow(),
                streak=0,
                daily_goal_xp=20,
                gems=500,
                created_at=utcnow(),
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.get(User, user_id)

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.scalar(select(User).where(User.username == username))

    def update(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_daily_activity(self, user_id: int, activity_date: date) -> Optional[DailyActivity]:
        return self.db.scalar(
            select(DailyActivity).where(
                DailyActivity.user_id == user_id,
                DailyActivity.activity_date == activity_date,
            )
        )

    def upsert_daily_activity(
        self, user_id: int, activity_date: date, xp_earned: int, lessons_increment: int = 1
    ) -> DailyActivity:
        activity = self.get_daily_activity(user_id, activity_date)
        if not activity:
            activity = DailyActivity(
                user_id=user_id,
                activity_date=activity_date,
                lessons_completed=lessons_increment,
                xp_earned=xp_earned,
            )
            self.db.add(activity)
        else:
            activity.lessons_completed += lessons_increment
            activity.xp_earned += xp_earned
            self.db.add(activity)
        return activity

    def add_xp_event(
        self, user_id: int, xp_amount: int, lesson_id: Optional[int] = None
    ) -> XpEvent:
        event = XpEvent(
            user_id=user_id,
            lesson_id=lesson_id,
            xp_amount=xp_amount,
            created_at=utcnow(),
        )
        self.db.add(event)
        return event

    def get_all_achievements(self) -> list[Achievement]:
        return list(self.db.scalars(select(Achievement)).all())

    def get_user_achievements(self, user_id: int) -> list[UserAchievement]:
        return list(
            self.db.scalars(
                select(UserAchievement).where(UserAchievement.user_id == user_id)
            ).all()
        )

    def unlock_achievement(self, user_id: int, achievement_id: int) -> UserAchievement:
        existing = self.db.scalar(
            select(UserAchievement).where(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id,
            )
        )
        if existing:
            return existing
        ua = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id,
            unlocked_at=utcnow(),
        )
        self.db.add(ua)
        return ua

    def get_leaderboard(self, limit: int = 50) -> list[User]:
        return list(
            self.db.scalars(
                select(User).order_by(desc(User.total_xp), desc(User.streak)).limit(limit)
            ).all()
        )