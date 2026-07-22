from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime

class LogSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class LogEntry(BaseModel):
    hostname: Optional[str] = "UNKNOWN"
    service: Optional[str] = "system"
    message: str
    logType: str = "syslog"
    severity: LogSeverity = LogSeverity.INFO
    source_ip: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class LogResponse(LogEntry):
    id: str
