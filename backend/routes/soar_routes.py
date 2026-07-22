from fastapi import APIRouter, Depends, Body, HTTPException
from ai_engine.soar_engine import SOAREngine
from backend.auth.dependencies import get_current_user, require_roles
from backend.models.user import Role

router = APIRouter(prefix="/soar", tags=["SOAR Automation"])

@router.get("/playbooks")
async def get_playbooks(current_user: dict = Depends(get_current_user)):
    """List available SOAR automated response playbooks."""
    return SOAREngine.list_playbooks()

@router.post("/playbooks/execute")
async def execute_playbook(
    playbook_id: str = Body(..., embed=True),
    target: str = Body(..., embed=True),
    current_user: dict = Depends(require_roles([Role.ADMIN, Role.ANALYST]))
):
    """Execute an automated SOAR containment playbook against a target."""
    return SOAREngine.execute_playbook(playbook_id, target)
