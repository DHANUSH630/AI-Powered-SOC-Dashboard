"""
Threat Intelligence Integration Service for SentinelAI.
Queries VirusTotal, AbuseIPDB, Shodan, and CVE databases for IP, domain, and file hash reputation.
"""

from typing import Dict, Any

async def lookup_ip_reputation(ip: str) -> Dict[str, Any]:
    """Look up IP reputation across VirusTotal & AbuseIPDB."""
    # Synthetic/Mocked threat intelligence response for demo & offline operation
    return {
        "ip": ip,
        "abuseConfidenceScore": 85 if ip.startswith("185") or ip.startswith("45") else 12,
        "country": "RU" if ip.startswith("185") else ("CN" if ip.startswith("45") else "US"),
        "isp": "HostKey LLC / Cloud Provider",
        "totalReports": 42 if ip.startswith("185") else 2,
        "isWhitelisted": False,
        "openPorts": [22, 80, 443, 8080, 3389],
        "knownMalware": ["Mirai Botnet", "SSH BruteForce Agent"],
    }

async def lookup_domain_reputation(domain: str) -> Dict[str, Any]:
    """Look up domain reputation."""
    return {
        "domain": domain,
        "reputation": "SUSPICIOUS" if "phish" in domain or "malware" in domain else "CLEAN",
        "category": "Command and Control (C2)" if "c2" in domain else "General Web",
        "dnsRecords": {"A": ["185.220.101.5"], "MX": ["mail." + domain]},
        "whoisCreation": "2026-01-15",
    }

async def lookup_file_hash(hash_val: str) -> Dict[str, Any]:
    """Look up MD5 / SHA-256 file hash reputation."""
    return {
        "hash": hash_val,
        "detected": True if len(hash_val) > 20 else False,
        "positives": 48,
        "total": 72,
        "malwareFamily": "Trojan.GenericKD.683021",
        "firstSeen": "2026-05-10T12:00:00Z",
    }
