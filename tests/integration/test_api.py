import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data

def test_unauthenticated_protected_route():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 401
