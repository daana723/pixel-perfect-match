"""Numerical conventions only. These are NOT historical Trutine rules."""
import math

def normalize(value: float) -> float:
    if not math.isfinite(value):
        raise ValueError("Angle must be finite.")
    result = value % 360.0
    return 0.0 if result == 360.0 else result

def signed_difference(a: float, b: float) -> float:
    """((a - b + 180) mod 360) - 180, range [-180, 180)."""
    return ((a - b + 180.0) % 360.0) - 180.0

def opposite(longitude: float) -> float:
    return normalize(longitude + 180.0)
