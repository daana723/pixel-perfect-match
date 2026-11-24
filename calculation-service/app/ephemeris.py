"""Private AGPL testing adapter. Native mutable settings are serialized.

Only the pinned Swiss files are accepted. Moshier/JPL fallback is rejected.
No classical Trutine rules live here; replace this port for a future binding.
"""
from datetime import datetime, timezone
from hashlib import sha256
from importlib import import_module
from importlib.metadata import version
import math
from pathlib import Path
from threading import RLock
from typing import Protocol

FILES = {
    "sepl_18.se1": "9f057b316b1890a7f9340d0bf92db96edbab4939dbcc54762b62f6a70a059eb0",
    "semo_18.se1": "1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7",
}
LOCK = RLock()
START_JD, END_JD = 2378496.5, 2597641.5  # Gregorian 1800-01-01 through 2399-12-31

class EphemerisPort(Protocol):
    def positions(self, jd_ut: float, latitude: float, longitude: float,
                  altitude: float = 0, topocentric: bool = False,
                  house_system: str = "P") -> dict: ...

class EphemerisUnavailable(RuntimeError):
    pass

class SwissEphemerisAdapter:
    def __init__(self, ephemeris_path: str | Path | None = None):
        self.path = Path(ephemeris_path).resolve() if ephemeris_path else None

    @staticmethod
    def binding_version() -> str | None:
        try:
            module = import_module("swisseph")
            return str(module.version)
        except ImportError:
            return None

    def positions(self, jd_ut: float, latitude: float = 0, longitude: float = 0,
                  altitude: float = 0, topocentric: bool = False,
                  house_system: str = "P") -> dict:
        if self.path is None:
            raise EphemerisUnavailable("An explicit, verified local ephemeris directory is required.")
        values = (jd_ut, latitude, longitude, altitude)
        if not all(math.isfinite(v) for v in values):
            raise ValueError("Non-finite astronomical input.")
        if not START_JD <= jd_ut < END_JD:
            raise ValueError("This file policy supports Gregorian 1800–2399 only.")
        if not (-90 < latitude < 90 and -180 <= longitude <= 180 and -500 <= altitude <= 10000):
            raise ValueError("Invalid observer or undefined polar horizon.")
        if house_system not in ("P", "E", "W", "R"):
            raise ValueError("Unsupported house system.")
        for name, expected in FILES.items():
            file = self.path / name
            if not file.is_file() or sha256(file.read_bytes()).hexdigest() != expected:
                raise EphemerisUnavailable(f"Missing or unapproved ephemeris file: {name}")
        try:
            swe = import_module("swisseph")
        except ImportError as error:
            raise EphemerisUnavailable("Install the approved private-testing requirements.") from error
        if version("pyswisseph") != "2.10.3.2" or str(swe.version) != "2.10.03":
            raise EphemerisUnavailable("Unapproved binding/core version.")
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED | (swe.FLG_TOPOCTR if topocentric else 0)
        bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
        try:
            with LOCK:
                swe.set_ephe_path(str(self.path))
                swe.set_delta_t_userdef(swe.DELTAT_AUTOMATIC)
                swe.set_topo(longitude, latitude, altitude)
                delta_t = swe.deltat_ex(jd_ut, swe.FLG_SWIEPH) * 86400
                points = []
                for body, name in enumerate(bodies):
                    coordinates, returned = swe.calc_ut(jd_ut, body, flags)
                    ephemeris_mask = swe.FLG_JPLEPH | swe.FLG_SWIEPH | swe.FLG_MOSEPH
                    if returned & ephemeris_mask != swe.FLG_SWIEPH or returned & flags != flags:
                        raise EphemerisUnavailable(f"Rejected ephemeris fallback/flags for {name}: {returned}")
                    if not all(math.isfinite(v) for v in coordinates):
                        raise EphemerisUnavailable(f"Invalid coordinates for {name}")
                    points.append({"name": name, "longitude": coordinates[0] % 360,
                                   "latitude": coordinates[1], "distance_au": coordinates[2],
                                   "speed_deg_day": coordinates[3], "returned_flags": returned})
                # Swiss raises on Placidus/Regiomontanus polar failure; never accept Porphyry fallback.
                cusps, axes = swe.houses_ex(jd_ut, latitude, longitude, house_system.encode("ascii"), 0)
        except swe.Error as error:
            raise EphemerisUnavailable(f"Swiss calculation failed (no substitute): {error}") from error
        return {"jd_ut": jd_ut, "jd_tt": jd_ut + delta_t / 86400, "delta_t_seconds": delta_t,
                "observer": {"latitude": latitude, "longitude": longitude, "altitude": altitude},
                "topocentric": topocentric, "house_system": house_system, "points": points,
                "ascendant": axes[0] % 360, "descendant": (axes[0] + 180) % 360,
                "mc": axes[1] % 360, "ic": (axes[1] + 180) % 360,
                "cusps": [v % 360 for v in cusps],
                "settings": {"binding": "pyswisseph", "binding_version": version("pyswisseph"),
                             "core_version": str(swe.version), "files": FILES,
                             "requested_flags": flags, "zodiac": "tropical",
                             "coordinates": "apparent ecliptic of date", "calendar": "Gregorian",
                             "ut_policy": "UTC used as UT1; no DUT1 correction (up to 0.9 seconds)",
                             "delta_t": "Swiss automatic model", "calculated_at": datetime.now(timezone.utc).isoformat()}}
