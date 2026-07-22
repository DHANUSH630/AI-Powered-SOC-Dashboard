from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
from backend.models.alert import AlertResponse, AlertUpdate
from backend.services.alert_service import fetch_alerts, add_alert, update_status
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    status: Optional[str] = Query(None, description="Filter by status (NEW, IN_PROGRESS, RESOLVED, DISMISSED)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve security alerts with optional filtering and pagination."""
    alerts = await fetch_alerts(severity=severity, status=status, skip=skip, limit=limit)
    return alerts

@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    alert_update: AlertUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update alert status."""
    updated = await update_status(alert_id, alert_update.status.value)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found."
        )
    return updated
