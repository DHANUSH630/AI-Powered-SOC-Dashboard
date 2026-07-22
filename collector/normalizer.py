"""
Unified Log Normalizer for SentinelAI.
Detects log format and normalizes heterogeneous logs into standard dictionary format.
"""

from typing import Any, Dict
from collector.windows.parser import parse_windows_log
from collector.linux.parser import parse_syslog
from collector.nginx.parser import parse_nginx_log
from collector.apache.parser import parse_apache_log
from collector.firewall.parser import parse_firewall_log

def normalize_log(raw_log: Any, log_type: str = "auto") -> Dict[str, Any]:
    """
    Normalize raw log entries into unified SentinelAI Log schema.

    Args:
        raw_log: String or dictionary representation of raw log.
        log_type: Hint ("windows", "syslog", "nginx", "apache", "firewall", "auto").

    Returns:
        Normalized dictionary with standard fields:
        (timestamp, hostname, service, message, logType, severity, source_ip).
    """
    if isinstance(raw_log, dict) and "logType" in raw_log and "message" in raw_log:
        return raw_log

    text_log = str(raw_log)

    if log_type == "windows" or "EventID" in text_log:
        return parse_windows_log(raw_log)
    elif log_type == "nginx" or "GET " in text_log or "POST " in text_log:
        return parse_nginx_log(text_log)
    elif log_type == "apache":
        return parse_apache_log(text_log)
    elif log_type == "firewall" or "SRC=" in text_log or "DST=" in text_log:
        return parse_firewall_log(text_log)
    elif log_type == "syslog":
        return parse_syslog(text_log)
    else:
        # Default fallback to syslog parser
        return parse_syslog(text_log)
