"""
Firewall and Network IDS Log Parser.
Parses iptables, Suricata, and Zeek network alert logs.
"""

import re
from datetime import datetime, timezone

def parse_firewall_log(raw_log: str) -> dict:
    """Parse firewall / iptables / Suricata log message."""
    # IPTables pattern: ... SRC=1.2.3.4 DST=5.6.7.8 PROTO=TCP SPT=1234 DPT=80 ...
    src_match = re.search(r"SRC=([\d\.]+)", raw_log)
    dst_match = re.search(r"DST=([\d\.]+)", raw_log)
    dpt_match = re.search(r"DPT=(\d+)", raw_log)
    action_match = re.search(r"\b(DROP|REJECT|ACCEPT|DENY|BLOCK)\b", raw_log, re.IGNORECASE)

    source_ip = src_match.group(1) if src_match else None
    dest_ip = dst_match.group(1) if dst_match else None
    dest_port = dpt_match.group(1) if dpt_match else None
    action = action_match.group(1).upper() if action_match else "UNKNOWN"

    severity = "WARNING" if action in ["DROP", "REJECT", "DENY", "BLOCK"] else "INFO"

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hostname": "EDGE-FW-01",
        "service": "firewall",
        "message": raw_log.strip(),
        "logType": "firewall",
        "severity": severity,
        "source_ip": source_ip,
        "destination_ip": dest_ip,
        "destination_port": dest_port,
        "action": action,
    }
