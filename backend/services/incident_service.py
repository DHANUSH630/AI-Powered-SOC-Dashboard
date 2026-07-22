"""
Incident Management Service for SentinelAI.
Manages incident creation, analyst assignment, evidence uploads, timelines, and resolution notes.
"""

from typing import List, Optional
from datetime import datetime, timezone
from backend.database.crud import list_incidents, create_incident, format_doc
from backend.database.connection import get_database
from backend.utils.helpers import generate_incident_number
from bson import ObjectId

async def fetch_incidents(skip: int = 0, limit: int = 50) -> List[dict]:
    """List all incidents."""
    return await list_incidents(skip=skip, limit=limit)

async def add_incident(incident_data: dict, creator_name: str) -> dict:
    """Create a new security incident."""
    incident_data["incidentNumber"] = generate_incident_number()
    incident_data["status"] = "NEW"
    incident_data["timeline"] = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": f"Incident created by {creator_name}."
        }
    ]
    return await create_incident(incident_data)

async def update_incident_status(incident_id: str, new_status: str, note: Optional[str] = None) -> Optional[dict]:
    """Update incident status and add event note to timeline."""
    db = get_database()
    timeline_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": f"Status updated to {new_status}. Note: {note}" if note else f"Status updated to {new_status}."
    }
    
    try:
        updated = await db.incidents.find_one_and_update(
            {"_id": ObjectId(incident_id)},
            {
                "$set": {"status": new_status, "updatedAt": datetime.now(timezone.utc)},
                "$push": {"timeline": timeline_entry}
            },
            return_document=True
        )
        return format_doc(updated)
    except Exception:
        return None
