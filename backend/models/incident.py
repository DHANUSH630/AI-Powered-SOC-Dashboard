from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List, Any
from datetime import datetime

class Priority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class IncidentStatus(str, Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"

class IncidentCreate(BaseModel):
    title: str
    assignedAnalyst: Optional[str] = "SecOps Lead"
    priority: Priority = Priority.HIGH

class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    assignedAnalyst: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentResponse(BaseModel):
    id: str
    incidentNumber: str
    title: str
    assignedAnalyst: Optional[str] = "SecOps Lead"
    priority: Priority
    status: IncidentStatus
    timeline: Optional[List[Any]] = []
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
