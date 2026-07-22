"""
Apache Access and Error Log Parser.
Parses Apache Common and Combined access logs.
"""

import re
from datetime import datetime, timezone

APACHE_COMBINED_REGEX = re.compile(
    r'^(\S+)\s+\S+\s+(\S+)\s+\[([^\]]+)\]\s+"(\S+)\s+(\S+)\s+([^"]+)"\s+(\d{3})\s+(\d+|-)\s+"([^"]*)"\s+"([^"]*)"$'
)

def parse_apache_log(raw_log: str) -> dict:
    """Parse Apache combined log line."""
    match = APACHE_COMBINED_REGEX.match(raw_log.strip())
    if match:
        ip, user, time_str, method, url, proto, status_code, bytes_sent, referer, agent = match.groups()
        status_code = int(status_code)
        
        severity = "INFO"
        if 400 <= status_code < 500:
            severity = "WARNING"
        elif status_code >= 500:
            severity = "ERROR"

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "hostname": "WEB-SERVER-APACHE",
            "service": "apache",
            "message": f'{method} {url} HTTP status {status_code} from {ip}',
            "logType": "apache",
            "severity": severity,
            "source_ip": ip,
            "http_method": method,
            "url": url,
            "status_code": status_code,
            "user_agent": agent,
        }

    ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", raw_log)
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hostname": "WEB-SERVER-APACHE",
        "service": "apache",
        "message": raw_log.strip(),
        "logType": "apache",
        "severity": "INFO",
        "source_ip": ip_match.group(0) if ip_match else None,
    }
