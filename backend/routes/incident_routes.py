from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
from backend.models.incident import IncidentCreate, IncidentResponse, IncidentUpdate
from backend.services.incident_service import fetch_incidents, add_incident, update_incident_status
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
async def get_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all security incidents."""
    return await fetch_incidents(skip=skip, limit=limit)

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_new_incident(
    incident_in: IncidentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new security incident."""
    incident_dict = incident_in.model_dump()
    return await add_incident(incident_dict, creator_name=current_user.get("name", "Analyst"))

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    update_in: IncidentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update incident status and add timeline resolution note."""
    updated = await update_incident_status(
        incident_id,
        new_status=update_in.status.value if update_in.status else "IN_PROGRESS",
        note=update_in.resolution_notes
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found."
        )
    return updated
