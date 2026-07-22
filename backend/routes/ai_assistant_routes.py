from fastapi import APIRouter, Depends, Body
from backend.services.ai_assistant_service import query_ai_security_assistant
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/ai-assistant", tags=["AI Security Assistant"])

@router.post("/chat")
async def chat_with_assistant(
    prompt: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    """Interact with the SentinelAI Security Assistant chatbot."""
    return await query_ai_security_assistant(prompt)
