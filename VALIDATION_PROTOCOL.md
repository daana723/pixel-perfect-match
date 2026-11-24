# Validation protocol

## Current tests (not astronomical validation)
Frontend tests: explicit IANA timezone requirement, no implicit prenatal duration, all four axis pairings, midnight-crossing detection, leap-date rejection, duration arithmetic, coordinates, archive format validation and safe CSV escaping; existing root-route matching test.

Python scaffold tests: health never claims readiness, four orientations, missing/wrong service token, explicit unavailable results on all calculation endpoints, missing/invalid timezone, explicit prenatal assumptions, and adapter refusal to produce fabricated positions.

Browser acceptance: create a real local case, reload/read it, edit it, duplicate it, export/import JSON and confirm deletion; navigate every view; inspect desktop/mobile and confirm no horizontal overflow. A local workflow success does not validate astronomy.

## Commands
```sh
bunx vitest run src/features/laboratory/cases.test.ts src/test/app-routing.test.tsx
PYTHONPATH=calculation-service pytest -q calculation-service/tests
```

## Required astronomical suite (not yet implemented)
- Circular angular normalization and signed residuals at wrap boundaries.
- Ascendant/Descendant and MC/IC; supported house systems and polar failures.
- UT Julian Day/calendar/time-scale conversions.
- IANA historical timezone, daylight saving, repeated/nonexistent times, leap days and midnight transition cases, documented tzdb versions.
- Swiss planetary positions, verified returned flags and absence of unintended fallback.
- Topocentric/geocentric differences and observer handling; concurrency isolation.
- Distinct conception, LMP and custom duration semantics; known conception-date handling.
- Full interval enumeration, both reciprocal residuals, four orientations, minima/root-finding and deduplication.
- Reproducibility across repeated runs with recorded file/settings/software versions.
- Independently calculated reference natal/prenatal charts.

Each reference must include origin, exact input/timezone/observer, ephemeris files, flags, time scales, independent output, precision and justified tolerance. There are **no approved numerical reference charts yet**. Do not use self-generated values as independent references or claim mathematically validated until the relevant suite passes.

## Deployment/security verification outstanding
Docker build/run, deployed HTTPS, token handling, caller ownership, rate/compute limits, job isolation and persistence, request/body logging audit, cancellation/retention/deletion, opt-in cloud access policies, and disaster recovery remain future checks.

## First-deliverable verification results
On 2026-11-24: 10 frontend tests and 9 Python scaffold tests passed. Python emitted one dependency deprecation warning from Starlette/AnyIO, not a failing test. Latest preview build reported `build OK`.

Playwright verified local creation and readback after reload, editing, duplication, versioned JSON export/import and confirmed deletion. All seven views loaded with app-specific titles. Desktop (1440×1050) and phone (390×844) were inspected; dashboard and birth workflow had no horizontal overflow after correcting the phone step selector. Browser runtime error list was empty. These tests used explicit synthetic **input** fixtures, not fabricated astronomical outputs.

No Docker deployment, live Python-to-frontend integration, historical reference chart or astronomical equation was validated. The installed binding's availability was inspected by the scaffold, not numerical accuracy.
