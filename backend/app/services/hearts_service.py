from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.core.clock import utcnow
from app.models import User
from app.repositories.user_repo import UserRepository

REFILL_GEM_COST = 100


class HeartsService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_current_hearts(
        self, user: User, now: datetime | None = None
    ) -> tuple[int, int, int | None]:
        """Applies lazy heart regeneration (+1 per HEART_REGEN_HOURS up to MAX_HEARTS).

        Rules:
        - When hearts < MAX_HEARTS, advance hearts_updated_at by (regenerated_hearts * HEART_REGEN_HOURS).
        - When hearts reach MAX_HEARTS, set hearts_updated_at to now.
        Returns: (current_hearts, max_hearts, next_heart_in_seconds)
        """
        if now is None:
            now = utcnow()

        max_hearts = settings.MAX_HEARTS
        regen_interval = settings.HEART_REGEN_HOURS * 3600

        if user.hearts >= max_hearts:
            user.hearts = max_hearts
            user.hearts_updated_at = now
            return user.hearts, max_hearts, None

        elapsed_seconds = int((now - user.hearts_updated_at).total_seconds())

        if elapsed_seconds >= regen_interval:
            hearts_to_add = elapsed_seconds // regen_interval
            actual_regen = min(hearts_to_add, max_hearts - user.hearts)
            user.hearts += actual_regen

            if user.hearts >= max_hearts:
                user.hearts = max_hearts
                user.hearts_updated_at = now
            else:
                # Advance hearts_updated_at by (actual_regen * HEART_REGEN_HOURS)
                user.hearts_updated_at = user.hearts_updated_at + timedelta(
                    hours=actual_regen * settings.HEART_REGEN_HOURS
                )

            self.db.add(user)
            self.db.commit()

        if user.hearts >= max_hearts:
            return user.hearts, max_hearts, None

        # Calculate time remaining until next heart
        current_elapsed = int((now - user.hearts_updated_at).total_seconds())
        seconds_left = max(0, regen_interval - current_elapsed)
        return user.hearts, max_hearts, seconds_left

    def lose_heart(self, user: User, now: datetime | None = None) -> int:
        """Deducts 1 heart if available.
        
        Resets hearts_updated_at ONLY when hearts were at MAX before the loss.
        """
        if now is None:
            now = utcnow()

        # Apply lazy regen up to now first
        self.get_current_hearts(user, now=now)
        if user.hearts > 0:
            was_at_max = (user.hearts == settings.MAX_HEARTS)
            user.hearts -= 1
            if was_at_max:
                user.hearts_updated_at = now
            self.db.add(user)
            self.db.commit()
        return user.hearts

    def refill_hearts(self, user: User, now: datetime | None = None) -> tuple[int, int]:
        """Refills hearts to MAX_HEARTS for gems cost."""
        if now is None:
            now = utcnow()

        if user.gems < REFILL_GEM_COST:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough gems. Refill costs {REFILL_GEM_COST} gems, but you have {user.gems}.",
            )
        user.gems -= REFILL_GEM_COST
        user.hearts = settings.MAX_HEARTS
        user.hearts_updated_at = now
        self.db.add(user)
        self.db.commit()
        return user.hearts, user.gems
