"""
Windows Event Log Parser.
Parses Windows Security, System, and Application event logs (XML / JSON / Raw string).
"""

import json
import re
from datetime import datetime, timezone
from typing import Optional

# Common Windows Security Event IDs
EVENT_IDS = {
    "4624": ("Successful Logon", "INFO"),
    "4625": ("Anomalous Failed Logon", "WARNING"),
    "4672": ("Special Privileges Assigned", "INFO"),
    "4688": ("New Process Created", "INFO"),
    "4720": ("User Account Created", "WARNING"),
    "4726": ("User Account Deleted", "WARNING"),
    "1102": ("Audit Log Cleared", "CRITICAL"),
}

def parse_windows_log(raw_log: str | dict) -> dict:
    """
    Parse Windows Event Log entry into standardized dictionary format.
    """
    if isinstance(raw_log, dict):
        event_id = str(raw_log.get("EventID", "0"))
        event_info = EVENT_IDS.get(event_id, ("Windows Event", "INFO"))
        return {
            "timestamp": raw_log.get("TimeCreated", datetime.now(timezone.utc).isoformat()),
            "hostname": raw_log.get("Computer", "WINDOWS-HOST"),
            "service": "windows-security",
            "message": raw_log.get("Message", f"Event ID {event_id}: {event_info[0]}"),
            "event_id": event_id,
            "logType": "windows",
            "severity": raw_log.get("Level", event_info[1]),
            "source_ip": raw_log.get("IpAddress", "127.0.0.1"),
        }

    # Try parsing JSON string
    try:
        data = json.loads(raw_log)
        return parse_windows_log(data)
    except Exception:
        pass

    # Regex fallback for raw text Windows event lines
    match = re.search(r"EventID[=:\s]+(\d+)", raw_log, re.IGNORECASE)
    event_id = match.group(1) if match else "0"
    event_info = EVENT_IDS.get(event_id, ("Windows Event Log", "INFO"))

    ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", raw_log)
    source_ip = ip_match.group(0) if ip_match else None

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hostname": "WINDOWS-HOST",
        "service": "windows-security",
        "message": raw_log.strip(),
        "event_id": event_id,
        "logType": "windows",
        "severity": event_info[1],
        "source_ip": source_ip,
    }
