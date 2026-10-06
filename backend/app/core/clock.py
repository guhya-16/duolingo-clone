from datetime import date, datetime, timezone
from typing import Optional
from fastapi import Request
from app.config import settings


def utcnow() -> datetime:
    """Return current naive UTC datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def get_today(request: Optional[Request] = None) -> date:
    """Return today's date in UTC, or honors X-Debug-Date header (YYYY-MM-DD) if present."""
    if request:
        debug_date_str = request.headers.get(settings.DEBUG_DATE_HEADER)
        if debug_date_str:
            try:
                return datetime.strptime(debug_date_str, "%Y-%m-%d").date()
            except ValueError:
                pass
    return utcnow().date()
