"""
Rule-Based Threat Detection Engine.
Applies signature and regex heuristic detection rules to inspect security logs.
"""

import re
from typing import Optional, Dict, Any, List

class RuleEngine:
    """Detects known attack patterns using regular expressions and heuristics."""

    RULES = [
        {
            "name": "SQL Injection Attempt",
            "pattern": r"(?i)(\bUNION\b.*\bSELECT\b|' OR '1'='1|--|;\s*DROP\s+TABLE|SELECT\s+.*\bFROM\s+information_schema)",
            "attack_type": "SQL Injection",
            "severity": "HIGH",
            "mitre_id": "T1190",
            "cvss": 8.5,
            "recommendation": "Block IP and inspect web application parameter sanitization.",
        },
        {
            "name": "Cross-Site Scripting (XSS)",
            "pattern": r"(?i)(<script[^>]*>|javascript\s*:|onerror\s*=|onload\s*=|eval\(|\bdocument\.cookie\b)",
            "attack_type": "Cross-Site Scripting (XSS)",
            "severity": "MEDIUM",
            "mitre_id": "T1189",
            "cvss": 6.1,
            "recommendation": "Enable Content-Security-Policy (CSP) headers and escape output.",
        },
        {
            "name": "SSH / Auth Brute Force",
            "pattern": r"(?i)(failed password|authentication failure|invalid user|4625)",
            "attack_type": "Brute Force",
            "severity": "HIGH",
            "mitre_id": "T1110",
            "cvss": 7.5,
            "recommendation": "Enforce fail2ban rate limiting and mandatory MFA.",
        },
        {
            "name": "Directory Traversal",
            "pattern": r"(?i)(\.\./\.\./|\.\.\\\.\.\\|%2e%2e%2f|/etc/passwd|/windows/win\.ini)",
            "attack_type": "Directory Traversal",
            "severity": "MEDIUM",
            "mitre_id": "T1083",
            "cvss": 5.3,
            "recommendation": "Restrict web server root directory permissions.",
        },
        {
            "name": "Malicious Command / PowerShell Injection",
            "pattern": r"(?i)(-enc\s+[A-Za-z0-9+/=]+|Invoke-Expression|cmd\.exe\s+/c|powershell\.exe\s+-nop|bypass)",
            "attack_type": "Command Injection",
            "severity": "CRITICAL",
            "mitre_id": "T1059.001",
            "cvss": 9.8,
            "recommendation": "Enable PowerShell Constrained Language Mode and isolate endpoint.",
        },
        {
            "name": "Port Scanning Activity",
            "pattern": r"(?i)(nmap|masscan|zgrab|SYN scan|port scan|REJECT|DROP.*DPT=)",
            "attack_type": "Port Scan",
            "severity": "LOW",
            "mitre_id": "T1046",
            "cvss": 4.0,
            "recommendation": "Block scanning source IP at peripheral firewall.",
        },
    ]

    @classmethod
    def inspect(cls, log: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Inspect a normalized log entry against signature detection rules.

        Returns a threat dictionary if a rule is triggered, or None.
        """
        message = log.get("message", "")
        if not message:
            return None

        for rule in cls.RULES:
            if re.search(rule["pattern"], message):
                return {
                    "rule_triggered": rule["name"],
                    "attackType": rule["attack_type"],
                    "severity": rule["severity"],
                    "mitreId": rule["mitre_id"],
                    "cvssScore": rule["cvss"],
                    "confidence": 0.95,
                    "sourceIP": log.get("source_ip", "UNKNOWN"),
                    "recommendation": rule["recommendation"],
                }

        return None
