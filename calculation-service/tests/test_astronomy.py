"""Real astronomical tests; JPL values independent of Swiss, C values binding regressions."""
import json
import os
from pathlib import Path
import pytest
from app.ephemeris import SwissEphemerisAdapter, EphemerisUnavailable, FILES

REFERENCES = Path(__file__).parent / "references"

@pytest.fixture
def adapter():
    path = os.environ.get("EPHEMERIS_PATH")
    if not path:
        pytest.fail("Real astronomical regressions require EPHEMERIS_PATH; run prepare_ephemeris.py first.")
    return SwissEphemerisAdapter(path)

@pytest.mark.parametrize("body,longitude", [
    ("Sun", 280.3689092), ("Moon", 223.3237860), ("Mercury", 271.8892699),
    ("Jupiter", 25.2530685), ("Saturn", 40.3956366), ("Neptune", 303.1930007),
])
def test_independent_jpl_apparent_longitude(adapter, body, longitude):
    # Horizons quantity 31, geocentric, J2000 UTC noon; 0.001 degree = 3.6 arcsec.
    chart = adapter.positions(2451545.0, 51.5, -0.12)
    point = next(p for p in chart["points"] if p["name"] == body)
    assert abs((point["longitude"] - longitude + 180) % 360 - 180) < 0.001
    assert point["returned_flags"] == 258

@pytest.mark.parametrize("system", ["P", "E", "W", "R"])
def test_native_swetest_cusps_and_axes(adapter, system):
    reference = json.loads((REFERENCES / f"swetest-{system}.json").read_text())
    chart = adapter.positions(2451545.0, 51.5, -0.12, house_system=system)
    assert chart["cusps"] == pytest.approx(reference["cusps"], abs=1e-7)
    assert chart["ascendant"] == pytest.approx(reference["ascendant"], abs=1e-7)
    assert chart["mc"] == pytest.approx(reference["mc"], abs=1e-7)
    assert chart["descendant"] == pytest.approx((reference["ascendant"] + 180) % 360, abs=1e-7)

def test_topocentric_moon_native_reference(adapter):
    reference = json.loads((REFERENCES / "swetest-topocentric.json").read_text())
    chart = adapter.positions(2451545.0, 51.5, -0.12, 15, True)
    moon = next(p for p in chart["points"] if p["name"] == "Moon")
    assert moon["longitude"] == pytest.approx(reference["Moon"], abs=1e-7)
    assert moon["returned_flags"] == 33026
    geo = adapter.positions(2451545.0, 51.5, -0.12)
    assert abs(moon["longitude"] - geo["points"][1]["longitude"]) > 0.1

def test_reject_missing_or_changed_files(tmp_path):
    with pytest.raises(EphemerisUnavailable, match="Missing or unapproved"):
        SwissEphemerisAdapter(tmp_path).positions(2451545)
    for name in FILES:
        (tmp_path / name).write_bytes(b"invalid")
    with pytest.raises(EphemerisUnavailable, match="Missing or unapproved"):
        SwissEphemerisAdapter(tmp_path).positions(2451545)

def test_reject_unsupported_date(adapter):
    with pytest.raises(ValueError, match="1800"):
        adapter.positions(2300000)

def test_polar_placidus_does_not_silently_fallback(adapter):
    with pytest.raises(EphemerisUnavailable):
        adapter.positions(2451545, 89, 0, house_system="P")

def test_observer_state_does_not_leak_between_calls(adapter):
    first = adapter.positions(2451545, 51.5, -0.12, 15, True)
    adapter.positions(2451545, -33.9, 151.2, 300, True)
    repeated = adapter.positions(2451545, 51.5, -0.12, 15, True)
    assert first["points"] == repeated["points"]

def test_moshier_fallback_flags_are_rejected(adapter, monkeypatch):
    import swisseph
    original = swisseph.calc_ut
    def fallback(*args):
        coordinates, _ = original(*args)
        return coordinates, swisseph.FLG_MOSEPH | swisseph.FLG_SPEED
    monkeypatch.setattr(swisseph, "calc_ut", fallback)
    with pytest.raises(EphemerisUnavailable, match="fallback/flags"):
        adapter.positions(2451545)

def test_jd_boundary_includes_last_supported_day(adapter):
    assert adapter.positions(2597641.499)["jd_ut"] == 2597641.499
    with pytest.raises(ValueError):
        adapter.positions(2597641.5)