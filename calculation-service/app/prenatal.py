"""Prenatal epoch windows from an EXPLICIT user duration assumption.
No universal duration is assumed. Historical rules (e.g. Moon-phase adjustments) are not applied here."""
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass(frozen=True)
class EpochWindow:
    convention: str
    start_utc: datetime
    end_utc: datetime

def epoch_window(birth_start_utc: datetime, birth_end_utc: datetime, days: float, hours: float, convention: str) -> EpochWindow:
    if convention == "lmp":
        raise ValueError("An LMP duration is not a conception interval; an explicit LMP→conception rule is required.")
    if convention not in ("conception", "custom"):
        raise ValueError("Unknown convention.")
    if days <= 0 or not (0 <= hours < 24):
        raise ValueError("Invalid duration.")
    delta = timedelta(days=days, hours=hours)
    return EpochWindow(convention, birth_start_utc - delta, birth_end_utc - delta)
