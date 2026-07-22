from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status
from typing import List, Optional, Any
from backend.models.log import LogEntry, LogResponse
from backend.services.log_service import ingest_raw_log, ingest_log_batch, fetch_logs
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.get("", response_model=List[LogResponse])
async def get_logs(
    severity: Optional[str] = Query(None, description="Filter by log severity (INFO, WARNING, ERROR, CRITICAL)"),
    log_type: Optional[str] = Query(None, description="Filter by log type (windows, syslog, nginx, apache, firewall)"),
    search: Optional[str] = Query(None, description="Regex message search string"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    """Query normalized logs with filtering, searching, and pagination."""
    logs = await fetch_logs(severity=severity, log_type=log_type, search=search, skip=skip, limit=limit)
    return logs

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_single_log(
    log_data: dict,
    log_type: str = Query("auto"),
    current_user: dict = Depends(get_current_user)
):
    """Ingest a single raw/structured log entry through the threat analysis pipeline."""
    result = await ingest_raw_log(log_data, log_type=log_type)
    return {"status": "success", "log": result}

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_log_file(
    file: UploadFile = File(...),
    log_type: str = Query("auto"),
    current_user: dict = Depends(get_current_user)
):
    """Upload a log file (syslog, web server access log, or Windows JSON event export)."""
    contents = await file.read()
    lines = contents.decode("utf-8", errors="ignore").splitlines()
    
    if not lines:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    inserted_count = await ingest_log_batch(lines, log_type=log_type)
    return {
        "status": "success",
        "filename": file.filename,
        "processed_logs": len(lines),
        "inserted": inserted_count
    }
