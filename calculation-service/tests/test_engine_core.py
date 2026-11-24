from datetime import date, datetime, time, timezone
import math, pytest
from app.civil_time import CivilTimeError, julian_day_ut, resolve_interval, resolve_local
from app.prenatal import epoch_window
from app.search import scan_minima, search_orientations

def test_jd_j2000():
    assert julian_day_ut(datetime(2000, 1, 1, 12, tzinfo=timezone.utc)) == 2451545.0

def test_jd_meeus_example():  # Meeus ex. 7.a: 1957-10-04.81 -> 2436116.31
    assert abs(julian_day_ut(datetime(1957, 10, 4, 19, 26, 24, tzinfo=timezone.utc)) - 2436116.31) < 1e-6

def test_nonexistent_time_rejected():
    with pytest.raises(CivilTimeError):
        resolve_local(date(2021, 3, 28), time(1, 30), "Europe/London")

def test_ambiguous_policy():
    with pytest.raises(CivilTimeError):
        resolve_local(date(2021, 10, 31), time(1, 30), "Europe/London")
    assert resolve_local(date(2021, 10, 31), time(1, 30), "Europe/London", "earlier").utc_offset_seconds == 3600
    assert resolve_local(date(2021, 10, 31), time(1, 30), "Europe/London", "later").utc_offset_seconds == 0

def test_interval_crossing_midnight_and_transition():
    s, e, tr = resolve_interval(date(2021, 3, 27), time(23, 0), time(3, 0), "Europe/London")
    assert e.local.date() == date(2021, 3, 28) and len(tr) == 1

def test_pre_gregorian_rejected():
    with pytest.raises(CivilTimeError):
        resolve_local(date(1500, 1, 1), time(12), "UTC")

def test_lmp_not_treated_as_conception():
    t = datetime(2000, 1, 1, tzinfo=timezone.utc)
    with pytest.raises(ValueError):
        epoch_window(t, t, 280, 0, "lmp")
    assert (t - epoch_window(t, t, 273, 6, "custom").start_utc).total_seconds() == (273 * 24 + 6) * 3600

def test_scan_finds_all_minima_and_keeps_orientations():
    f = lambda x: math.cos(x) + 1
    mins = scan_minima(f, 0, 4 * math.pi, 0.1)
    assert [round(x, 4) for x, _ in mins] == [round(math.pi, 4), round(3 * math.pi, 4)]
    res = search_orientations({"ASC / ASC": f, "DSC / DSC": f}, 0, 4 * math.pi, 0.1)
    assert len(res) == 4 and {r.orientation for r in res} == {"ASC / ASC", "DSC / DSC"}
