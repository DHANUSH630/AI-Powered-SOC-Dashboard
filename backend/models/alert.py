from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime

class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class AlertStatus(str, Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"

class AlertCreate(BaseModel):
    attackType: str
    severity: Severity = Severity.MEDIUM
    confidence: float = 0.8
    sourceIP: str
    destinationIP: Optional[str] = None
    country: Optional[str] = "UNKNOWN"
    status: AlertStatus = AlertStatus.NEW
    mitreId: Optional[str] = None
    cvssScore: Optional[float] = 5.0
    recommendation: Optional[str] = None

class AlertUpdate(BaseModel):
    status: AlertStatus

class AlertResponse(BaseModel):
    id: str
    timestamp: datetime
    severity: Severity
    attackType: str
    confidence: Optional[float] = 0.8
    sourceIP: str
    destinationIP: Optional[str] = None
    country: Optional[str] = "UNKNOWN"
    status: AlertStatus
    mitreId: Optional[str] = None
    cvssScore: Optional[float] = None
    recommendation: Optional[str] = None
