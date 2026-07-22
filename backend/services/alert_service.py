"""
Alert Service for SentinelAI.
Manages alert listing, creation, filtering, and status updates.
"""

from typing import List, Optional
from backend.database.crud import list_alerts, create_alert, update_alert_status, get_alert_by_id

async def fetch_alerts(severity: Optional[str] = None, status: Optional[str] = None, skip: int = 0, limit: int = 50) -> List[dict]:
    """Fetch alerts with optional severity and status filters."""
    query_filter = {}
    if severity and severity.upper() != "ALL":
        query_filter["severity"] = severity.upper()
    if status:
        query_filter["status"] = status.upper()
    return await list_alerts(query_filter=query_filter, skip=skip, limit=limit)

async def add_alert(alert_data: dict) -> dict:
    """Add a new alert to MongoDB."""
    return await create_alert(alert_data)

async def update_status(alert_id: str, new_status: str) -> Optional[dict]:
    """Update alert status."""
    return await update_alert_status(alert_id, new_status)
