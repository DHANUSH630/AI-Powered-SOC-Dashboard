"""
Database Seeding Script for SentinelAI.
Seeds MongoDB with initial admin/analyst users, security logs, alerts, and incidents for development.
"""

import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Crypt context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "sentinelai"

async def seed():
    print(f"Connecting to MongoDB at {MONGODB_URL}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    # 1. Seed Users
    print("Seeding Users collection...")
    await db.users.delete_many({})
    
    admin_user = {
        "name": "SecOps Admin",
        "email": "admin@sentinelai.io",
        "password": pwd_context.hash("AdminSecret123!"),
        "role": "ADMIN",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }

    analyst_user = {
        "name": "Sarah Connor",
        "email": "analyst@sentinelai.io",
        "password": pwd_context.hash("AnalystSecret123!"),
        "role": "ANALYST",
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }

    await db.users.insert_many([admin_user, analyst_user])
    print("✓ Users seeded (admin@sentinelai.io / analyst@sentinelai.io)")

    # 2. Seed Alerts
    print("Seeding Alerts collection...")
    await db.alerts.delete_many({})
    now = datetime.now(timezone.utc)
    
    mock_alerts = [
        {
            "timestamp": now - timedelta(minutes=5),
            "severity": "CRITICAL",
            "attackType": "SSH Brute Force",
            "confidence": 0.98,
            "sourceIP": "185.220.101.5",
            "destinationIP": "10.0.1.50",
            "country": "RU",
            "status": "NEW",
            "mitreId": "T1110",
            "cvssScore": 9.8,
            "recommendation": "Block source IP 185.220.101.5 immediately and enforce MFA.",
        },
        {
            "timestamp": now - timedelta(minutes=15),
            "severity": "HIGH",
            "attackType": "SQL Injection",
            "confidence": 0.92,
            "sourceIP": "45.142.120.10",
            "destinationIP": "10.0.1.100",
            "country": "CN",
            "status": "IN_PROGRESS",
            "mitreId": "T1190",
            "cvssScore": 8.5,
            "recommendation": "Inspect web application firewall logs and sanitize inputs.",
        },
        {
            "timestamp": now - timedelta(minutes=30),
            "severity": "MEDIUM",
            "attackType": "Port Scan",
            "confidence": 0.85,
            "sourceIP": "194.26.29.112",
            "destinationIP": "10.0.1.1",
            "country": "DE",
            "status": "NEW",
            "mitreId": "T1046",
            "cvssScore": 5.3,
            "recommendation": "Monitor source IP for subsequent exploit attempts.",
        },
        {
            "timestamp": now - timedelta(hours=1),
            "severity": "HIGH",
            "attackType": "PowerShell Malicious Script Execution",
            "confidence": 0.95,
            "sourceIP": "10.0.4.15",
            "destinationIP": "10.0.4.15",
            "country": "INTERNAL",
            "status": "RESOLVED",
            "mitreId": "T1059.001",
            "cvssScore": 8.1,
            "recommendation": "Isolate host 10.0.4.15 and conduct memory forensics.",
        },
        {
            "timestamp": now - timedelta(hours=2),
            "severity": "LOW",
            "attackType": "Directory Traversal",
            "confidence": 0.78,
            "sourceIP": "89.248.165.74",
            "destinationIP": "10.0.1.100",
            "country": "NL",
            "status": "DISMISSED",
            "mitreId": "T1083",
            "cvssScore": 3.4,
            "recommendation": "Verify path traversal protections on Nginx proxy.",
        },
    ]
    await db.alerts.insert_many(mock_alerts)
    print("✓ Alerts seeded.")

    # 3. Seed Incidents
    print("Seeding Incidents collection...")
    await db.incidents.delete_many({})
    
    mock_incidents = [
        {
            "incidentNumber": "INC-20260722-001",
            "title": "Credential Stuffing Campaign targeting Admin API",
            "assignedAnalyst": "Sarah Connor",
            "priority": "HIGH",
            "status": "IN_PROGRESS",
            "timeline": [
                {"timestamp": (now - timedelta(hours=3)).isoformat(), "event": "Anomalous spikes in 401 Unauthorized responses detected."},
                {"timestamp": (now - timedelta(hours=2)).isoformat(), "event": "Analyst assigned to investigate IP pool."},
            ],
            "createdAt": now - timedelta(hours=3),
            "updatedAt": now - timedelta(hours=1),
        }
    ]
    await db.incidents.insert_many(mock_incidents)
    print("✓ Incidents seeded.")

    # 4. Seed Security Logs
    print("Seeding Logs collection...")
    await db.logs.delete_many({})
    
    log_types = ["windows", "syslog", "nginx", "apache", "firewall", "suricata"]
    severities = ["INFO", "WARNING", "ERROR", "CRITICAL"]
    
    mock_logs = []
    for i in range(100):
        t = now - timedelta(minutes=i*2)
        mock_logs.append({
            "timestamp": t,
            "hostname": f"srv-prod-{i%5 + 1}.sentinelai.internal",
            "service": log_types[i % len(log_types)],
            "message": f"Security event log entry #{i} - Connection established from remote host.",
            "logType": log_types[i % len(log_types)],
            "severity": severities[i % len(severities)],
        })
    await db.logs.insert_many(mock_logs)
    print("✓ 100 sample Security Logs seeded.")

    client.close()
    print("Database seeding completed successfully! 🎉")

if __name__ == "__main__":
    asyncio.run(seed())
