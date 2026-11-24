import json
import os
from copy import deepcopy
from pathlib import Path
import pytest
from app.astronomy import calculate_pair, input_hash
from app.ephemeris import SwissEphemerisAdapter
from app.experimental import search_candidates, ORIENTATIONS, residuals
from app.search import scan_minima

@pytest.fixture
def record():
    return json.loads((Path(__file__).parent / "references/private-j2000-pair.json").read_text())["input_record"]

@pytest.fixture
def adapter():
    path = os.environ.get("EPHEMERIS_PATH")
    if not path: pytest.fail("EPHEMERIS_PATH required for real calculation tests.")
    return SwissEphemerisAdapter(path)

def test_real_pair_duration_and_reproducibility(record, adapter):
    result = calculate_pair(record, "12:00", 0, adapter)
    assert result["natal"]["jd_ut"] == 2451545
    assert result["prenatal"]["jd_ut"] == 2451271.75  # explicit 273 days + 6 hours
    assert result["input_sha256"] == input_hash(record)
    assert result["historical_status"] == "unresolved"
    repeated = calculate_pair(record, "12:00", 0, adapter)
    assert repeated["natal"]["points"] == result["natal"]["points"]

def test_lmp_is_not_silently_converted(record, adapter):
    record["assumptions"][0]["convention"] = "lmp"
    with pytest.raises(ValueError, match="LMP"):
        calculate_pair(record, "12:00", 0, adapter)

def test_known_conception_time_remains_unresolved(record, adapter):
    record["conceptionDate"] = "1999-04-03"
    with pytest.raises(ValueError, match="intraday/precedence"):
        calculate_pair(record, "12:00", 0, adapter)

def test_outside_interval_refused(record, adapter):
    with pytest.raises(ValueError, match="outside"):
        calculate_pair(record, "14:00", 0, adapter)

def test_prenatal_observer_is_independent(record, adapter):
    record.update(sameLocation=False, prenatalLatitude=-33.9, prenatalLongitude=151.2, prenatalAltitude=30)
    pair = calculate_pair(record, "12:00", 0, adapter, True)
    assert pair["natal"]["observer"]["latitude"] == 51.5
    assert pair["prenatal"]["observer"]["latitude"] == -33.9
    assert pair["prenatal"]["observer"]["longitude"] == 151.2

def test_search_requires_explicit_experimental_profile(record, adapter):
    pair = calculate_pair(record, "12:00", 0, adapter)
    with pytest.raises(ValueError, match="experimental"):
        search_candidates(record, pair, adapter)

def test_real_experimental_search_preserves_four_orientations(record, adapter):
    pair = calculate_pair(record, "12:00", 0, adapter, True)
    result = search_candidates(record, pair, adapter, 60)
    assert {c["orientation"] for c in result["candidates"]} == set(ORIENTATIONS)
    assert len(result["search"]["traces"]) == 4
    for c in result["candidates"]:
        r1, r2 = residuals(c["natal"], c["prenatal"], c["orientation"])
        assert (c["r1"], c["r2"]) == pytest.approx((r1, r2))
        assert c["rms"] == pytest.approx(((r1*r1 + r2*r2) / 2)**0.5)
        assert c["prenatal"]["jd_ut"] == pytest.approx(c["natal"]["jd_ut"] - 273.25)
    assert result["search"]["deduplication_seconds"] == 1
    assert result["search"]["refinement_seconds"] == 0.5

def test_boundaries_not_shifted_into_interval():
    assert scan_minima(lambda x: x*x, 0, 1, 0.1, 0.001) == [(0, 0)]
    assert scan_minima(lambda x: (x-1)**2, 0, 1, 0.1, 0.001)[0] == (1, 0)

def test_nonfinite_or_zero_tolerance_refused():
    with pytest.raises(ValueError): scan_minima(lambda x: x, 0, 1, 0.1, 0)
    with pytest.raises(ValueError): scan_minima(lambda x: x, 0, float("inf"), 1)