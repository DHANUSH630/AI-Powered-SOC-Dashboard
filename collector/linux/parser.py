"""
Linux Syslog Parser.
Parses RFC 3164 / RFC 5424 syslog messages and auth.log entries.
"""

import re
from datetime import datetime, timezone

# Standard RFC 3164 syslog regex: <PRIVAL>Month Day HH:MM:SS Hostname Process[PID]: Message
SYSLOG_REGEX = re.compile(
    r"^(?:<(\d+)>)?([A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+([\w\.\-]+)\s+([\w\.\-]+)(?:\[(\d+)\])?:?\s+(.*)$"
)

def parse_syslog(raw_log: str) -> dict:
    """Parse standard Linux syslog or auth.log entry."""
    match = SYSLOG_REGEX.match(raw_log.strip())
    if match:
        prival, timestamp_str, hostname, service, pid, message = match.groups()
        
        # Determine severity
        severity = "INFO"
        if "failed" in message.lower() or "denied" in message.lower() or "error" in message.lower():
            severity = "WARNING"
        if "critical" in message.lower() or "emergency" in message.lower() or "panic" in message.lower():
            severity = "CRITICAL"

        # Extract IP if present
        ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", message)
        source_ip = ip_match.group(0) if ip_match else None

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "hostname": hostname,
            "service": service,
            "message": message,
            "logType": "syslog",
            "severity": severity,
            "source_ip": source_ip,
        }

    # Fallback for non-standard lines
    ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", raw_log)
    source_ip = ip_match.group(0) if ip_match else None
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hostname": "LINUX-HOST",
        "service": "syslog",
        "message": raw_log.strip(),
        "logType": "syslog",
        "severity": "WARNING" if "fail" in raw_log.lower() else "INFO",
        "source_ip": source_ip,
    }
