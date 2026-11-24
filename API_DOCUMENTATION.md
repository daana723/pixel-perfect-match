# Python API and deployment scaffold

Base path `/api/v1`. Run the independent service with `uvicorn app.main:app --app-dir calculation-service --no-access-log`. OpenAPI schema is at `/openapi.json`; interactive API documentation at `/docs` on the **Python host**, not the web app.

## Current endpoints
| Method | Path | Current behavior |
|---|---|---|
| GET | `/api/v1/health` | Public: scaffold status, software/binding version, `calculation_ready: false` |
| GET | `/api/v1/methods` | Public: two planned profiles, no approved source, four orientations each |
| POST | `/api/v1/rectifications` | Token required, Pydantic input validation, then 503 not implemented |
| GET | `/api/v1/rectifications/{id}` | Token required, UUID validation, then 503; no jobs created |
| POST | `/api/v1/rectifications/{id}/recalculate` | Token required, UUID/input validation, then 503 |
| POST | `/api/v1/ephemeris/positions` | Token required, input validation, then 503; no positions returned |

Protected endpoints require `Authorization: Bearer <private service token>`. Configure `CALCULATION_SERVICE_TOKEN` only in host secrets. Missing configuration fails closed (503); missing/incorrect credentials fail with 401. Do not put a token in the browser, documentation examples, or source control. No CORS browser access is enabled.

## Rectification request fields
`birth` contains `birth_date`, `earliest_local_time`, `latest_local_time`, `timezone`, `observer` and `ambiguous_time_policy`. An observer contains `latitude`, `longitude`, `altitude`. `prenatal_assumptions` contains explicit `days`, optional additional `hours`, and `convention` (`conception`, `lmp`, `custom`). `prenatal_observer` and `profile` (`classical`, `modern`, `comparison`) are required; `known_conception_date` is optional. Field validation errors are 422 with structured field locations. No body is processed astronomically or retained.

Position inputs are `julian_day_ut`, `observer`, `topocentric`, optional `house_system` (`P`, `E`, `W`, `R`). This is a planned contract, not a validated numerical service.

## Unavailable response
```json
{"detail":{"code":"calculation_not_implemented","message":"This is a Stage 2 scaffold. No astronomical result has been generated.","stage":"scaffold"}}
```

## Docker
```sh
docker build -t hermes-calculation calculation-service
# --env-file should point to a private, locally provisioned file, not tracked in Git.
docker run --rm --env-file /secure/hermes-service.env -p 8000:8000 hermes-calculation
```
The image uses a non-root runtime user. It intentionally does not bundle ephemeris files, workers, queues or a database. Docker build/run and live external deployment are not yet verified. Select a Python container host with sufficient CPU/memory and native wheel support. Deploy behind HTTPS; do not expose the scaffold as production-ready.

## Before real integration
Resolve licensing, provision and hash ephemeris files, implement the adapter and engines, use durable jobs for large searches, enforce per-caller and compute-budget rate limits, configure allowed origins/bridge, review body logging at the reverse proxy, authenticate and authorize ownership, validate service responses, add retention/deletion controls and verify reference charts. Future job response schemas must be specified once the methodology is approved; no speculative result schema or ID is returned now.
