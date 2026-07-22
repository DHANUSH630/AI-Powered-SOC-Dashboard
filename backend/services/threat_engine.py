"""
Integrated Threat Detection Pipeline for SentinelAI.
Runs incoming logs through Rule-Based signatures and ML Anomaly Detection,
automatically generates Alert documents in MongoDB, and streams updates to WebSockets.
"""

from typing import Dict, Any, Optional
from loguru import logger
from ai_engine.rule_engine import RuleEngine
from ai_engine.ml_engine import MLEngine
from backend.database.crud import create_alert
from backend.websocket.manager import manager as ws_manager

ml_engine_instance = MLEngine()

async def process_log_for_threats(log_entry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Process a single normalized log entry for threats.

    1. Inspect using Rule-Based signatures.
    2. If no signature match, inspect using ML Isolation Forest anomaly model.
    3. If a threat is detected, save Alert to MongoDB and broadcast via WebSockets.
    """
    threat = RuleEngine.inspect(log_entry)
    detection_source = "Rule Engine"

    if not threat:
        threat = ml_engine_instance.predict_anomaly(log_entry)
        detection_source = "ML Anomaly Engine"

    if threat:
        logger.warning(f"🚨 [{detection_source}] Threat Detected: {threat['attackType']} from IP {threat['sourceIP']}")
        
        alert_document = {
            "attackType": threat["attackType"],
            "severity": threat["severity"],
            "confidence": threat.get("confidence", 0.9),
            "sourceIP": threat.get("sourceIP", log_entry.get("source_ip", "UNKNOWN")),
            "destinationIP": log_entry.get("destination_ip", "10.0.1.100"),
            "country": threat.get("country", "UNKNOWN"),
            "status": "NEW",
            "mitreId": threat.get("mitreId", "T1000"),
            "cvssScore": threat.get("cvssScore", 7.0),
            "recommendation": threat.get("recommendation", "Review host activity."),
            "logMessage": log_entry.get("message", ""),
        }

        # Save to MongoDB
        try:
            created = await create_alert(alert_document)
            # Broadcast over WebSocket channel
            await ws_manager.broadcast_alert(created)
            return created
        except Exception as e:
            logger.error(f"Error saving alert: {e}")
            return alert_document

    return None
