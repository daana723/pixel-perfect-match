"""Exploratory fixed-duration reciprocal RMS fit. NOT a verified historical Trutine.

Neither residual is forced to zero. There are no phase rules, probabilities,
or historical claims. Scan completeness is limited by its declared resolution.
"""
from datetime import date, datetime, time, timedelta, timezone
import math
from .angles import signed_difference
from .civil_time import resolve_interval, julian_day_ut
from .ephemeris import EphemerisPort
from .search import scan_minima

ORIENTATIONS = ["ASC / ASC", "ASC / DSC", "DSC / ASC", "DSC / DSC"]

def residuals(natal: dict, prenatal: dict, orientation: str) -> tuple[float, float]:
    left, right = orientation.split(" / ")
    axis = {"ASC": "ascendant", "DSC": "descendant"}
    nmoon = next(p["longitude"] for p in natal["points"] if p["name"] == "Moon")
    pmoon = next(p["longitude"] for p in prenatal["points"] if p["name"] == "Moon")
    return signed_difference(pmoon, natal[axis[left]]), signed_difference(nmoon, prenatal[axis[right]])

def search_candidates(record: dict, pair: dict, adapter: EphemerisPort, step_seconds: float = 60) -> dict:
    if pair["profile"] != "experimental-topocentric":
        raise ValueError("Searching requires the explicitly experimental topocentric profile.")
    if not 30 <= step_seconds <= 120:
        raise ValueError("Experimental coarse step must be 30–120 seconds.")
    start, end, _ = resolve_interval(date.fromisoformat(record["birthDate"]), time.fromisoformat(record["earliestTime"]), time.fromisoformat(record["latestTime"]), record["timezone"], record["ambiguity"])
    if (end.utc - start.utc).total_seconds() > 26 * 3600:
        raise ValueError("Private search interval is limited to 26 UTC hours.")
    assumption = pair["assumption"]
    delta = timedelta(days=assumption["days"], hours=assumption["hours"])
    cache = {}
    def charts(timestamp):
        if timestamp not in cache:
            utc = datetime.fromtimestamp(timestamp, timezone.utc)
            def chart(epoch, key):
                return {"utc": epoch.isoformat(), **adapter.positions(julian_day_ut(epoch), **pair[key]["observer"], topocentric=True, house_system=record["houseSystem"])}
            cache[timestamp] = chart(utc, "natal"), chart(utc - delta, "prenatal")
        return cache[timestamp]
    candidates, traces = [], []
    for orientation in ORIENTATIONS:
        trace = []
        def objective(timestamp):
            natal, prenatal = charts(timestamp)
            r1, r2 = residuals(natal, prenatal, orientation)
            rms = math.hypot(r1, r2) / math.sqrt(2)
            trace.append({"utc": natal["utc"], "r1": r1, "r2": r2, "rms": rms})
            return rms
        for timestamp, value in scan_minima(objective, start.utc.timestamp(), end.utc.timestamp(), step_seconds, tol=0.5):
            natal, prenatal = charts(timestamp)
            r1, r2 = residuals(natal, prenatal, orientation)
            candidates.append({"orientation": orientation, "utc": natal["utc"], "r1": r1, "r2": r2,
                               "rms": value, "natal": natal, "prenatal": prenatal})
        traces.append({"orientation": orientation, "evaluations": trace})
    candidates.sort(key=lambda c: (c["rms"], c["orientation"], c["utc"]))
    return {**pair, "candidates": candidates,
            "search": {"rule_id": "experimental-fixed-duration-reciprocal-rms-v1", "objective": "sqrt((r1^2+r2^2)/2) in degrees",
                       "r1": "circular(prenatal Moon - natal selected horizon)", "r2": "circular(natal Moon - prenatal selected horizon)",
                       "start_utc": start.utc.isoformat(), "end_utc": end.utc.isoformat(), "step_seconds": step_seconds,
                       "refinement_seconds": 0.5, "deduplication_seconds": 1, "orientations": ORIENTATIONS,
                       "assumption_index": pair["assumption_index"], "completeness": "Resolution-limited coarse minima; not proof of exhaustive roots",
                       "traces": traces}}