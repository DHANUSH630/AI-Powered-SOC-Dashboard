"""
Notification and Webhook Dispatcher Service.
Sends high-priority security notifications to Email (SMTP), Slack, and Discord webhooks.
"""

from typing import Dict, Any
from loguru import logger
import httpx
from backend.config import settings

async def send_slack_notification(alert_data: Dict[str, Any]) -> bool:
    """Send alert notification payload to Slack Webhook."""
    if not settings.SLACK_WEBHOOK_URL:
        logger.info(f"Slack Webhook URL not configured. Skipping Slack dispatch for {alert_data.get('attackType')}")
        return False

    payload = {
        "text": f"🚨 *SentinelAI Critical Alert Triggered!*",
        "attachments": [
            {
                "color": "#dc2626" if alert_data.get("severity") == "CRITICAL" else "#f97316",
                "fields": [
                    {"title": "Attack Type", "value": alert_data.get("attackType"), "short": True},
                    {"title": "Severity", "value": alert_data.get("severity"), "short": True},
                    {"title": "Source IP", "value": alert_data.get("sourceIP"), "short": True},
                    {"title": "MITRE ATT&CK", "value": alert_data.get("mitreId", "N/A"), "short": True},
                    {"title": "Recommendation", "value": alert_data.get("recommendation", "N/A"), "short": False},
                ],
            }
        ],
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(settings.SLACK_WEBHOOK_URL, json=payload, timeout=5.0)
            return resp.status_code == 200
    except Exception as e:
        logger.error(f"Error dispatching Slack notification: {e}")
        return False

async def dispatch_alert_notifications(alert_data: Dict[str, Any]):
    """Dispatch notifications across configured notification channels."""
    if alert_data.get("severity") in ["CRITICAL", "HIGH"]:
        await send_slack_notification(alert_data)
