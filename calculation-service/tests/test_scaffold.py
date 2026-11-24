import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ephemeris import SwissEphemerisAdapter, EphemerisUnavailable

client = TestClient(app)

def request():
    # Explicit synthetic input fixture only; no reference chart or calculated result.
    return {"birth": {"birth_date": "1990-06-15", "earliest_local_time": "23:30:00", "latest_local_time": "00:30:00", "timezone": "Europe/London", "observer": {"latitude": 51.5, "longitude": -0.12}}, "prenatal_assumptions": [{"days": 270, "convention": "custom"}], "prenatal_observer": {"latitude": 51.5, "longitude": -0.12}, "profile": "classical"}

@pytest.fixture
def protected(monkeypatch):
    monkeypatch.setenv("CALCULATION_SERVICE_TOKEN", "local-test-token")
    return {"Authorization": "Bearer local-test-token"}

def test_health_never_claims_calculation_readiness():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["calculation_ready"] is False

def test_methods_preserve_all_four_axis_pairings():
    for method in client.get("/api/v1/methods").json():
        assert method["orientations"] == ["ASC / ASC", "ASC / DSC", "DSC / ASC", "DSC / DSC"]
        assert method["source"] is None

def test_calculation_is_explicitly_unavailable(protected):
    response = client.post("/api/v1/rectifications", json=request(), headers=protected)
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "calculation_not_implemented"

def test_private_endpoints_require_service_token(protected):
    assert client.post("/api/v1/rectifications", json=request()).status_code == 401

def test_missing_timezone_is_not_silently_utc(protected):
    data = request()
    del data["birth"]["timezone"]
    assert client.post("/api/v1/rectifications", json=data, headers=protected).status_code == 422

def test_invalid_timezone_is_rejected(protected):
    data = request()
    data["birth"]["timezone"] = "Not/A_Zone"
    assert client.post("/api/v1/rectifications", json=data, headers=protected).status_code == 422

def test_no_universal_prenatal_duration(protected):
    data = request()
    data["prenatal_assumptions"] = []
    assert client.post("/api/v1/rectifications", json=data, headers=protected).status_code == 422

def test_adapter_never_returns_fabricated_positions():
    with pytest.raises(EphemerisUnavailable):
        SwissEphemerisAdapter().positions(2451545.0)

def test_remaining_endpoints_report_unavailable(protected):
    job = "00000000-0000-4000-8000-000000000001"
    assert client.get(f"/api/v1/rectifications/{job}", headers=protected).status_code == 503
    assert client.post(f"/api/v1/rectifications/{job}/recalculate", json=request(), headers=protected).status_code == 503
    response = client.post("/api/v1/ephemeris/positions", headers=protected, json={"julian_day_ut": 2451545.0, "observer": {"latitude": 0, "longitude": 0}, "topocentric": False})
    assert response.status_code == 503
