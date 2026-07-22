from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.websocket.manager import manager

router = APIRouter(tags=["WebSocket Stream"])

@router.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket, channel: str = "general"):
    """
    WebSocket endpoint for real-time security alert and log telemetry streaming.

    Channels: 'general', 'alerts', 'metrics', 'logs'
    """
    await manager.connect(websocket, channel=channel)
    try:
        while True:
            # Keep connection alive and receive ping/pong messages
            data = await websocket.receive_text()
            await manager.send_personal_message(
                {"status": "ack", "received": data, "channel": channel}, websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel=channel)
