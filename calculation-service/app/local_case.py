"""Validate calculation-relevant fields from the browser's Zod-validated archive."""
from typing import Literal
from datetime import date
from pydantic import BaseModel, ConfigDict, Field, field_validator
from .schemas import PrenatalAssumption, BirthRecord

class LocalCase(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: str = Field(min_length=1, max_length=120)
    birthDate: str
    earliestTime: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    latestTime: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    timezone: str
    ambiguity: Literal["reject", "earlier", "later"]
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    altitude: float = Field(ge=-500, le=10000, allow_inf_nan=False)
    prenatalLatitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    prenatalLongitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    prenatalAltitude: float = Field(ge=-500, le=10000, allow_inf_nan=False)
    sameLocation: bool = Field(strict=True)
    conceptionDate: str
    assumptions: list[PrenatalAssumption] = Field(min_length=1, max_length=20)
    houseSystem: Literal["P", "E", "W", "R"]

    @field_validator("birthDate")
    @classmethod
    def valid_date(cls, value: str):
        date.fromisoformat(value)
        return value

    @field_validator("timezone")
    @classmethod
    def valid_timezone(cls, value: str):
        return BirthRecord.require_iana_timezone(value)