"""Isolated Swiss Ephemeris adapter. No fallback ephemeris is permitted.

Stage 2 scaffold only. Do not implement numerical operations until the
licensed ephemeris file policy and calculation specification are approved.
"""
from importlib import import_module

class EphemerisUnavailable(RuntimeError):
    pass

class SwissEphemerisAdapter:
    @staticmethod
    def binding_version() -> str | None:
        try:
            module = import_module("swisseph")
            return str(module.version)
        except ImportError:
            return None

    def positions(self, *args, **kwargs):
        raise EphemerisUnavailable(
            "Swiss Ephemeris position calculation is not implemented. "
            "No approximation or synthetic position was generated."
        )
