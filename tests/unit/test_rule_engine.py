import pytest
from ai_engine.rule_engine import RuleEngine

def test_sqli_detection():
    log = {"message": "GET /api/users?id=1' UNION SELECT username, password FROM users--"}
    threat = RuleEngine.inspect(log)
    assert threat is not None
    assert threat["attackType"] == "SQL Injection"
    assert threat["severity"] == "HIGH"
    assert threat["mitreId"] == "T1190"

def test_xss_detection():
    log = {"message": "GET /search?q=<script>document.cookie</script>"}
    threat = RuleEngine.inspect(log)
    assert threat is not None
    assert threat["attackType"] == "Cross-Site Scripting (XSS)"
    assert threat["severity"] == "MEDIUM"

def test_brute_force_detection():
    log = {"message": "Failed password for root from 185.220.101.5 port 22 ssh2"}
    threat = RuleEngine.inspect(log)
    assert threat is not None
    assert threat["attackType"] == "Brute Force"
    assert threat["severity"] == "HIGH"

def test_benign_log():
    log = {"message": "User logged in successfully from internal network."}
    threat = RuleEngine.inspect(log)
    assert threat is None
