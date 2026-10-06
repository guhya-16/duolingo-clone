from datetime import date, timedelta
from app.models import User


class StreakService:
    @staticmethod
    def update_streak(user: User, today: date) -> int:
        """Updates user streak based on practice date.

        - Same day: no change
        - Consecutive day (yesterday): +1
        - Gap day or first time: reset to 1
        """
        if user.last_active_date == today:
            return user.streak

        if user.last_active_date == today - timedelta(days=1):
            user.streak += 1
        else:
            user.streak = 1

        user.last_active_date = today
        return user.streak
