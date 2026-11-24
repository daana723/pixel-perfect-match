"""Civil time resolution and Julian Day (UT). Library-independent; uses IANA tzdb via zoneinfo.
NOT a historical Trutine rule. Gregorian calendar only (proleptic dates before 1582-10-15 rejected)."""
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

GREGORIAN_START = date(1582, 10, 15)

class CivilTimeError(ValueError):
    pass

@dataclass(frozen=True)
class ResolvedInstant:
    local: datetime
    utc: datetime
    utc_offset_seconds: int
    fold_applied: int | None  # None = unambiguous

def _exists(naive: datetime, zone: ZoneInfo, fold: int) -> bool:
    aware = naive.replace(tzinfo=zone, fold=fold)
    return aware.astimezone(timezone.utc).astimezone(zone).replace(tzinfo=None) == naive

def resolve_local(d: date, t: time, tz_name: str, policy: str = "reject") -> ResolvedInstant:
    if d < GREGORIAN_START:
        raise CivilTimeError("Pre-Gregorian dates need an explicit calendar policy; not supported.")
    zone = ZoneInfo(tz_name)
    naive = datetime.combine(d, t)
    e0, e1 = _exists(naive, zone, 0), _exists(naive, zone, 1)
    if not e0 and not e1:
        raise CivilTimeError(f"{naive.isoformat()} does not exist in {tz_name} (clock skipped).")
    o0 = naive.replace(tzinfo=zone, fold=0).utcoffset()
    o1 = naive.replace(tzinfo=zone, fold=1).utcoffset()
    fold = None
    if e0 and e1 and o0 != o1:
        if policy == "reject":
            raise CivilTimeError(f"{naive.isoformat()} is ambiguous in {tz_name}; choose earlier or later.")
        if policy not in ("earlier", "later"):
            raise CivilTimeError("Unknown ambiguity policy.")
        fold = 0 if policy == "earlier" else 1
    aware = naive.replace(tzinfo=zone, fold=fold or 0)
    if not e0:
        aware = naive.replace(tzinfo=zone, fold=1)
    off = aware.utcoffset()
    assert off is not None
    return ResolvedInstant(naive, aware.astimezone(timezone.utc), int(off.total_seconds()), fold)

def resolve_interval(d: date, earliest: time, latest: time, tz_name: str, policy: str = "reject"):
    """Latest < earliest means the end is on the following date. Equal = point interval."""
    end_date = d + timedelta(days=1) if latest < earliest else d
    start = resolve_local(d, earliest, tz_name, policy)
    end = resolve_local(end_date, latest, tz_name, policy)
    transitions = offset_transitions(start.utc, end.utc, tz_name)
    return start, end, transitions

def offset_transitions(start_utc: datetime, end_utc: datetime, tz_name: str, step_minutes: int = 15):
    """UTC instants (step resolution) where the zone offset changes inside the interval."""
    zone = ZoneInfo(tz_name)
    found, cur = [], start_utc
    prev = cur.astimezone(zone).utcoffset()
    while cur < end_utc:
        nxt = min(cur + timedelta(minutes=step_minutes), end_utc)
        off = nxt.astimezone(zone).utcoffset()
        if off != prev:
            found.append(nxt)
            prev = off
        cur = nxt
    return found

def julian_day_ut(utc: datetime) -> float:
    """Gregorian calendar JD (Meeus, Astronomical Algorithms ch. 7). UT, no delta-T."""
    if utc.tzinfo is None or utc.utcoffset() != timedelta(0):
        raise CivilTimeError("A UTC-aware datetime is required.")
    y, m = utc.year, utc.month
    dayfrac = utc.day + (utc.hour + (utc.minute + (utc.second + utc.microsecond / 1e6) / 60) / 60) / 24
    if m <= 2:
        y, m = y - 1, m + 12
    a = y // 100
    b = 2 - a + a // 4
    return int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + dayfrac + b - 1524.5
