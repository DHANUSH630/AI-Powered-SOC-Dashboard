"""
MongoDB CRUD Data Access Layer for SentinelAI.
Provides async helper functions for managing collection documents.
"""

from typing import Any, List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from backend.database.connection import get_database

def format_doc(doc: Optional[dict]) -> Optional[dict]:
    """Convert MongoDB document ObjectId to string _id for JSON serialization."""
    if not doc:
        return None
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# ==================== USERS ====================

async def create_user(user_data: dict) -> dict:
    """Create a new user document."""
    db = get_database()
    user_data["createdAt"] = datetime.now(timezone.utc)
    user_data["updatedAt"] = datetime.now(timezone.utc)
    result = await db.users.insert_one(user_data)
    user_data["id"] = str(result.inserted_id)
    return format_doc(user_data)

async def get_user_by_email(email: str) -> Optional[dict]:
    """Find a user by email address."""
    db = get_database()
    user = await db.users.find_one({"email": email})
    return format_doc(user)

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Find a user by ID."""
    db = get_database()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        return format_doc(user)
    except Exception:
        return None

async def list_users(skip: int = 0, limit: int = 50) -> List[dict]:
    """List users with pagination."""
    db = get_database()
    cursor = db.users.find().skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    return [format_doc(u) for u in users]

# ==================== ALERTS ====================

async def create_alert(alert_data: dict) -> dict:
    """Create a new security alert document."""
    db = get_database()
    if "timestamp" not in alert_data:
        alert_data["timestamp"] = datetime.now(timezone.utc)
    result = await db.alerts.insert_one(alert_data)
    alert_data["id"] = str(result.inserted_id)
    return format_doc(alert_data)

async def get_alert_by_id(alert_id: str) -> Optional[dict]:
    """Find an alert by ID."""
    db = get_database()
    try:
        alert = await db.alerts.find_one({"_id": ObjectId(alert_id)})
        return format_doc(alert)
    except Exception:
        return None

async def list_alerts(
    query_filter: dict = None, skip: int = 0, limit: int = 50
) -> List[dict]:
    """Query alerts with filtering and pagination."""
    db = get_database()
    query_filter = query_filter or {}
    cursor = db.alerts.find(query_filter).sort("timestamp", -1).skip(skip).limit(limit)
    alerts = await cursor.to_list(length=limit)
    return [format_doc(a) for a in alerts]

async def update_alert_status(alert_id: str, status: str) -> Optional[dict]:
    """Update alert status (NEW, IN_PROGRESS, RESOLVED, DISMISSED)."""
    db = get_database()
    try:
        result = await db.alerts.find_one_and_update(
            {"_id": ObjectId(alert_id)},
            {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc)}},
            return_document=True
        )
        return format_doc(result)
    except Exception:
        return None

# ==================== INCIDENTS ====================

async def create_incident(incident_data: dict) -> dict:
    """Create a new security incident document."""
    db = get_database()
    incident_data["createdAt"] = datetime.now(timezone.utc)
    incident_data["updatedAt"] = datetime.now(timezone.utc)
    result = await db.incidents.insert_one(incident_data)
    incident_data["id"] = str(result.inserted_id)
    return format_doc(incident_data)

async def list_incidents(skip: int = 0, limit: int = 50) -> List[dict]:
    """List incidents ordered by priority and creation time."""
    db = get_database()
    cursor = db.incidents.find().sort("createdAt", -1).skip(skip).limit(limit)
    incidents = await cursor.to_list(length=limit)
    return [format_doc(i) for i in incidents]

# ==================== LOGS ====================

async def insert_log_batch(logs: List[dict]) -> int:
    """Insert a batch of log documents into the database."""
    if not logs:
        return 0
    db = get_database()
    now = datetime.now(timezone.utc)
    for log in logs:
        if "timestamp" not in log:
            log["timestamp"] = now
    result = await db.logs.insert_many(logs)
    return len(result.inserted_ids)

async def query_logs(
    query_filter: dict = None, skip: int = 0, limit: int = 100
) -> List[dict]:
    """Query logs with filters and pagination."""
    db = get_database()
    query_filter = query_filter or {}
    cursor = db.logs.find(query_filter).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    return [format_doc(l) for l in logs]
