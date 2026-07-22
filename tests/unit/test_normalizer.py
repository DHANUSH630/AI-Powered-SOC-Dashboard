import pytest
from collector.normalizer import normalize_log

def test_nginx_log_normalizer():
    raw_nginx = '185.220.101.5 - - [22/Jul/2026:18:50:00 +0000] "GET /admin HTTP/1.1" 401 512 "-" "Mozilla/5.0"'
    normalized = normalize_log(raw_nginx, log_type="nginx")
    assert normalized["logType"] == "nginx"
    assert normalized["source_ip"] == "185.220.101.5"
    assert normalized["severity"] == "WARNING"

def test_firewall_log_normalizer():
    raw_fw = 'IPTables-DROP: IN=eth0 OUT= SRC=194.26.29.112 DST=10.0.1.1 PROTO=TCP DPT=22'
    normalized = normalize_log(raw_fw, log_type="firewall")
    assert normalized["logType"] == "firewall"
    assert normalized["source_ip"] == "194.26.29.112"
    assert normalized["destination_port"] == "22"
    assert normalized["action"] == "DROP"
