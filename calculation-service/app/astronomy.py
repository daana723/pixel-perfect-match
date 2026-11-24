"""Civil inputs to real natal/prenatal charts, without a Trutine formula."""
from datetime import date, datetime, time, timedelta
from hashlib import sha256
import json
import platform
from pathlib import Path
from zoneinfo import TZPATH
from .civil_time import julian_day_ut, resolve_interval, resolve_local
from .ephemeris import EphemerisPort
from .local_case import LocalCase
from .prenatal import epoch_window

def input_hash(record: dict) -> str:
    return sha256(json.dumps(record, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()

def zone_hash(name: str) -> str:
    for root in TZPATH:
        file = Path(root) / name
        if file.is_file():
            return sha256(file.read_bytes()).hexdigest()
    raise ValueError("Cannot record the exact system timezone file for reproducibility.")

def timezone_version() -> str:
    for root in TZPATH:
        file = Path(root) / "tzdata.zi"
        if file.is_file():
            return file.read_text().splitlines()[0]
    return "system version unavailable; exact zone file hash recorded"

def calculate_pair(record: dict, local_time: str, assumption_index: int, adapter: EphemerisPort, topocentric: bool = False) -> dict:
    LocalCase.model_validate(record)
    d = date.fromisoformat(record["birthDate"])
    earliest, latest, selected = time.fromisoformat(record["earliestTime"]), time.fromisoformat(record["latestTime"]), time.fromisoformat(local_time)
    if selected.tzinfo is not None:
        raise ValueError("Selected time must be local civil time without an embedded offset.")
    start, end, transitions = resolve_interval(d, earliest, latest, record["timezone"], record["ambiguity"])
    if latest < earliest and selected <= latest:
        d += timedelta(days=1)
    instant = resolve_local(d, selected, record["timezone"], record["ambiguity"])
    if not start.utc <= instant.utc <= end.utc:
        raise ValueError("Selected time is outside the saved birth interval.")
    if record.get("conceptionDate"):
        raise ValueError("Known conception date has no approved intraday/precedence rule; clear it or resolve that policy first.")
    if assumption_index < 0 or assumption_index >= len(record["assumptions"]):
        raise ValueError("Choose an existing explicit duration assumption.")
    assumption = record["assumptions"][assumption_index]
    prenatal = epoch_window(instant.utc, instant.utc, assumption["days"], assumption["hours"], assumption["convention"])
    natal_observer = {k: record[k] for k in ("latitude", "longitude", "altitude")}
    prenatal_observer = natal_observer if record["sameLocation"] else {k: record["prenatal" + k[0].upper() + k[1:]] for k in ("latitude", "longitude", "altitude")}
    def chart(utc: datetime, observer: dict):
        return {"utc": utc.isoformat(), **adapter.positions(julian_day_ut(utc), **observer, topocentric=topocentric, house_system=record["houseSystem"])}
    return {"format": "hermes-astronomy", "version": 1, "case_name": record["name"],
            "input_sha256": input_hash(record), "input_record": record, "profile": "experimental-topocentric" if topocentric else "astronomy-geocentric",
            "historical_status": "unresolved", "assumption_index": assumption_index, "assumption": assumption,
            "civil": {"local": instant.local.isoformat(), "timezone": record["timezone"], "fold_policy": record["ambiguity"],
                      "fold_applied": instant.fold_applied, "utc_offset_seconds": instant.utc_offset_seconds,
                      "timezone_file_sha256": zone_hash(record["timezone"]), "tzdb_version": timezone_version(), "offset_transition_samples": [t.isoformat() for t in transitions]},
            "runtime": {"python": platform.python_version(), "engine": "private-astronomy-1",
                        "source_sha256": {file.name: sha256(file.read_bytes()).hexdigest() for file in Path(__file__).parent.glob("*.py")}},
            "natal": chart(instant.utc, natal_observer), "prenatal": chart(prenatal.start_utc, prenatal_observer), "candidates": []}