from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.config import settings
from app.core.clock import utcnow
from app.models import User
from app.repositories.user_repo import UserRepository


class GameService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def sync_user_hearts(self, user: User) -> User:
        """Lazily regenerates hearts at 1 per 4 hours up to MAX_HEARTS."""
        if user.hearts >= settings.MAX_HEARTS:
            user.hearts_updated_at = utcnow()
            return user

        now = utcnow()
        # Both are naive UTC datetimes
        elapsed_seconds = (now - user.hearts_updated_at).total_seconds()
        regen_interval = settings.HEART_REGEN_HOURS * 3600

        if elapsed_seconds >= regen_interval:
            hearts_to_add = int(elapsed_seconds // regen_interval)
            new_hearts = min(settings.MAX_HEARTS, user.hearts + hearts_to_add)
            user.hearts = new_hearts

            remainder_seconds = elapsed_seconds % regen_interval
            user.hearts_updated_at = now - timedelta(seconds=remainder_seconds)
            self.db.flush()

        return user

    def update_streak(self, user: User, today: date) -> None:
        """Extends streak on the first lesson completed each day; handles missed days."""
        yesterday = today - timedelta(days=1)
        today_activity = self.user_repo.get_daily_activity(user.id, today)
        yesterday_activity = self.user_repo.get_daily_activity(user.id, yesterday)

        # If already practiced today, streak is already counted
        if today_activity and today_activity.lessons_completed > 0:
            return

        if yesterday_activity and yesterday_activity.lessons_completed > 0:
            user.streak += 1
        else:
            # Broken streak or first day ever
            user.streak = 1

    def deduct_heart(self, user: User) -> int:
        self.sync_user_hearts(user)
        if user.hearts > 0:
            user.hearts -= 1
            if user.hearts < settings.MAX_HEARTS:
                user.hearts_updated_at = utcnow()
            self.db.commit()
        return user.hearts