from datetime import date, time
from enum import Enum
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from pydantic import BaseModel, Field, field_validator

class CalculationProfile(str, Enum):
    classical = "classical"
    modern = "modern"
    comparison = "comparison"

class Observer(BaseModel):
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    altitude: float = Field(default=0, ge=-500, le=10000, allow_inf_nan=False)

class BirthRecord(BaseModel):
    birth_date: date
    earliest_local_time: time
    latest_local_time: time
    timezone: str
    observer: Observer
    ambiguous_time_policy: str = Field(default="reject", pattern="^(reject|earlier|later)$")

    @field_validator("timezone")
    @classmethod
    def require_iana_timezone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as error:
            raise ValueError("An explicit valid IANA timezone is required; UTC is never assumed.") from error
        return value

class PrenatalAssumption(BaseModel):
    days: float = Field(gt=0, le=500, allow_inf_nan=False)
    hours: float = Field(default=0, ge=0, lt=24, allow_inf_nan=False)
    convention: str = Field(pattern="^(conception|lmp|custom)$")

class RectificationRequest(BaseModel):
    birth: BirthRecord
    prenatal_assumptions: list[PrenatalAssumption] = Field(min_length=1, max_length=20)
    prenatal_observer: Observer
    profile: CalculationProfile
    known_conception_date: date | None = None

class PositionsRequest(BaseModel):
    julian_day_ut: float = Field(allow_inf_nan=False)
    observer: Observer
    topocentric: bool
    house_system: str = Field(default="P", pattern="^[PEWR]$")

class UnavailableDetail(BaseModel):
    code: str
    message: str
    stage: str

class ErrorResponse(BaseModel):
    detail: UnavailableDetail

class HealthResponse(BaseModel):
    status: str
    version: str
    calculation_ready: bool
    ephemeris_binding_version: str | None

class MethodDescriptor(BaseModel):
    id: str
    name: str
    status: str
    source: str | None
    orientations: list[str]
