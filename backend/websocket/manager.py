"""
WebSocket Connection Manager for SentinelAI.

Manages real-time WebSocket connections for live alerts,
log streaming, and dashboard metric updates.
"""

import json
from datetime import datetime
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    """
    Manages WebSocket connections and message broadcasting.

    Supports multiple channels (e.g., 'alerts', 'logs', 'metrics')
    so clients can subscribe to specific event streams.
    """

    def __init__(self):
        """Initialize the connection manager."""
        # channel_name -> list of connected WebSocket clients
        self.active_connections: dict[str, list[WebSocket]] = {}
        # All connections regardless of channel
        self.all_connections: list[WebSocket] = []

    async def connect(
        self, websocket: WebSocket, channel: str = "general"
    ) -> None:
        """
        Accept a WebSocket connection and register it to a channel.

        Args:
            websocket: The WebSocket connection to accept.
            channel: The channel to subscribe the connection to.
        """
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        self.all_connections.append(websocket)

    def disconnect(
        self, websocket: WebSocket, channel: str = "general"
    ) -> None:
        """
        Remove a WebSocket connection from tracking.

        Args:
            websocket: The WebSocket connection to remove.
            channel: The channel to unsubscribe from.
        """
        if channel in self.active_connections:
            if websocket in self.active_connections[channel]:
                self.active_connections[channel].remove(websocket)
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)

    async def send_personal_message(
        self, message: dict[str, Any], websocket: WebSocket
    ) -> None:
        """Send a JSON message to a specific WebSocket client."""
        await websocket.send_json(message)

    async def broadcast(
        self, message: dict[str, Any], channel: str = "general"
    ) -> None:
        """
        Broadcast a JSON message to all clients on a channel.

        Args:
            message: The message payload to broadcast.
            channel: The channel to broadcast on.
        """
        connections = self.active_connections.get(channel, [])
        disconnected = []

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn, channel)

    async def broadcast_all(self, message: dict[str, Any]) -> None:
        """Broadcast a JSON message to ALL connected clients."""
        disconnected = []

        for connection in self.all_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            # Remove from all channels
            for channel in self.active_connections:
                if conn in self.active_connections[channel]:
                    self.active_connections[channel].remove(conn)
            if conn in self.all_connections:
                self.all_connections.remove(conn)

    def get_connection_count(self, channel: str | None = None) -> int:
        """Get the number of active connections, optionally filtered by channel."""
        if channel:
            return len(self.active_connections.get(channel, []))
        return len(self.all_connections)

    async def broadcast_alert(self, alert_data: dict[str, Any]) -> None:
        """Convenience method to broadcast a new alert event."""
        event = {
            "type": "alert_triggered",
            "timestamp": datetime.utcnow().isoformat(),
            "data": alert_data,
        }
        await self.broadcast(event, channel="alerts")
        await self.broadcast(event, channel="general")

    async def broadcast_metrics(self, metrics_data: dict[str, Any]) -> None:
        """Convenience method to broadcast updated metrics."""
        event = {
            "type": "metrics_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": metrics_data,
        }
        await self.broadcast(event, channel="metrics")


# Global singleton instance
manager = ConnectionManager()
