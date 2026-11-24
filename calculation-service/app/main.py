"""FastAPI scaffold. Protected endpoints deliberately refuse calculations.

No request body is logged, persisted, or forwarded. Health/method catalog
are public. Production transport, proxy, rate limits and jobs are future work.
"""
import hmac
import os
from uuid import UUID
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .ephemeris import SwissEphemerisAdapter
from .schemas import ErrorResponse, HealthResponse, MethodDescriptor, PositionsRequest, RectificationRequest

app = FastAPI(title="Hermes Trutine Calculation Service", version="0.1.0")
bearer = HTTPBearer(auto_error=False)
ORIENTATIONS = ["ASC / ASC", "ASC / DSC", "DSC / ASC", "DSC / DSC"]

async def verify_service_token(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    expected = os.environ.get("CALCULATION_SERVICE_TOKEN")
    if not expected:
        raise HTTPException(503, detail={"code": "service_not_configured", "message": "Service authentication is not configured.", "stage": "scaffold"})
    if credentials is None or not hmac.compare_digest(credentials.credentials, expected):
        raise HTTPException(401, detail="A valid service bearer token is required.")


def unavailable():
    raise HTTPException(503, detail={"code": "calculation_not_implemented", "message": "This is a Stage 2 scaffold. No astronomical result has been generated.", "stage": "scaffold"})


@app.get("/api/v1/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="scaffold", version="0.1.0", calculation_ready=False, ephemeris_binding_version=SwissEphemerisAdapter.binding_version())


@app.get("/api/v1/methods", response_model=list[MethodDescriptor])
def methods():
    return [
        MethodDescriptor(id="classical", name="Classical Trutine of Hermes", status="awaiting_historical_source", source=None, orientations=ORIENTATIONS),
        MethodDescriptor(id="modern", name="Experimental modern corrected", status="not_implemented", source=None, orientations=ORIENTATIONS),
    ]


@app.post("/api/v1/rectifications", dependencies=[Depends(verify_service_token)], responses={503: {"model": ErrorResponse}})
def create_rectification(request: RectificationRequest):
    unavailable()


@app.get("/api/v1/rectifications/{job_id}", dependencies=[Depends(verify_service_token)], responses={503: {"model": ErrorResponse}})
def get_rectification(job_id: UUID):
    unavailable()


@app.post("/api/v1/rectifications/{job_id}/recalculate", dependencies=[Depends(verify_service_token)], responses={503: {"model": ErrorResponse}})
def recalculate(job_id: UUID, request: RectificationRequest):
    unavailable()


@app.post("/api/v1/ephemeris/positions", dependencies=[Depends(verify_service_token)], responses={503: {"model": ErrorResponse}})
def positions(request: PositionsRequest):
    unavailable()
