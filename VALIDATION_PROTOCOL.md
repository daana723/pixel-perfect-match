# Validation protocol

## Original tests (superseded below by limited private astronomical validation)
Frontend tests: explicit IANA timezone requirement, no implicit prenatal duration, all four axis pairings, midnight-crossing detection, leap-date rejection, duration arithmetic, coordinates, archive format validation and safe CSV escaping; existing root-route matching test.

Python scaffold tests: health never claims readiness, four orientations, missing/wrong service token, explicit unavailable results on all calculation endpoints, missing/invalid timezone, explicit prenatal assumptions, and adapter refusal to produce fabricated positions.

Browser acceptance: create a real local case, reload/read it, edit it, duplicate it, export/import JSON and confirm deletion; navigate every view; inspect desktop/mobile and confirm no horizontal overflow. A local workflow success does not validate astronomy.

## Commands
```sh
bunx vitest run src/features/laboratory/cases.test.ts src/test/app-routing.test.tsx
EPHEMERIS_PATH=/private/ephemeris PYTHONPATH=calculation-service python3 -m pytest -q calculation-service/tests
```

## Broader validation targets (only the checks below are implemented)
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

Each reference must include origin, exact input/timezone/observer, ephemeris files, flags, time scales, independent output, precision and justified tolerance. Six independent JPL planetary values and native Swiss binding reference outputs are now retained; no historical birth-time charts are approved. Do not use self-generated values as independent references or claim mathematically validated until the relevant suite passes.

## Deployment/security verification outstanding
Docker build/run, deployed HTTPS, token handling, caller ownership, rate/compute limits, job isolation and persistence, request/body logging audit, cancellation/retention/deletion, opt-in cloud access policies, and disaster recovery remain future checks.

## First-deliverable verification results
On 2026-11-24: 10 frontend tests and 9 Python scaffold tests passed. Python emitted one dependency deprecation warning from Starlette/AnyIO, not a failing test. Latest preview build reported `build OK`.

Playwright verified local creation and readback after reload, editing, duplication, versioned JSON export/import and confirmed deletion. All seven views loaded with app-specific titles. Desktop (1440×1050) and phone (390×844) were inspected; dashboard and birth workflow had no horizontal overflow after correcting the phone step selector. Browser runtime error list was empty. These tests used explicit synthetic **input** fixtures, not fabricated astronomical outputs.

No Docker deployment, live Python-to-frontend integration, historical reference chart or astronomical equation was validated. The installed binding's availability was inspected by the scaffold, not numerical accuracy.


## Private astronomical verification — 2026-11-24

**48 Python tests passed**: 4 angle-math, 8 civil/JD/prenatal/generic-search, 10 HTTP scaffold/input/safety, 17 real-astronomy/reference/safety, 9 private-pair/experimental-search. **16 frontend tests passed**: 9 case rules, 6 calculation-file integrity rules, 1 route matching. One Starlette/AnyIO deprecation warning; no failures. Latest preview: build OK. Historical-method tests: **0**.

First demonstration, before searching: Gregorian 2000-01-01 12:00 UTC, London latitude 51.5°, longitude −0.12°, geocentric apparent tropical positions, JD UT 2451545.0, flags 258. Sun **280.3689185203509°**, Moon **223.32375144634491°**, ASC **24.024664733469837°**, DSC **204.02466473346985°**, MC **279.500418364528°**. Binding 2.10.3.2/core 2.10.03 and pinned sepl_18/semo_18 files. First 15 astronomical tests passed before searching; two subsequent fallback/boundary checks brought the suite to 17.

### Independent JPL references
NASA/JPL Horizons API, retrieved 2026-11-24: EPHEM_TYPE=OBSERVER, CENTER=500@399, START_TIME=2000-01-01 12:00, STOP_TIME=2000-01-01 12:01, STEP_SIZE=1m, QUANTITIES=31, CSV_FORMAT=YES. Quantity 31 is apparent observer-centred IAU76/80 ecliptic-of-date longitude/latitude. Target IDs: Sun 10, Moon 301, Mercury 199, Jupiter 599, Saturn 699, Neptune 899. Raw response headers/frames/time scales are retained in calculation-service/tests/references/horizons-*.json. Longitudes respectively: **280.3689092°, 223.3237860°, 271.8892699°, 25.2530685°, 40.3956366°, 303.1930007°**.

Tolerance **0.001° (3.6 arcsec)** allows model/frame/UTC-UT1/ΔT differences. This single-epoch check does not independently validate all ten bodies, houses, parallax or all centuries. Tests do not call live JPL services.

### Native Swiss binding regressions
Unmodified bundled C swetest from the pinned pyswisseph source archive was compiled locally with make swetest. Source hash/notices recorded in PRIVATE_TESTING.md. Arguments: -b1.1.2000 -ut12 -p0123456789 -eswe -edir<verified-data> -house-0.12,51.5,P -fPlb -g, -head (also E/W/R). Native outputs and commands retained in swetest-{P,E,W,R}.{txt,json}. Twelve cusps, ASC, MC and derived DSC compare at **1e-7°**, matching printed rounding. Native -topo-0.12,51.5,15 Moon reference: **223.0854699°**, returned flags 33026.

These are wiring/settings regressions against the **same Swiss core**, not independent house/parallax validation. Comparing Swiss with itself does not establish core correctness. File hashes, fallback flags, date bounds, polar failures and observer state isolation are separately tested.

### Actual case-to-browser acceptance
Playwright imported a technical case into My Cases, reloaded/read it, exported through the UI, ran the real offline CLI on that export, and opened returned JSON in Chart Comparison. Verified 20 planet glyphs, 24 house labels, UTC/JD readback, overlay, seven computed experimental minima across four orientations for that input, candidate selection, invalid-file refusal and Clear restoring empty wheels. Desktop and 390×844 phone screenshots were inspected; no page overflow, runtime errors or case-bearing network POSTs observed. Seven minima is an observed technical-input result, not a guarantee or true birth-time claim.

private-j2000-pair.json is **actual adapter output for explicit technical inputs**, used only for interchange tests, never seeded into the UI. It is not independent astronomical evidence. Classical tests: zero; no public deployment, Docker deployment or historical Trutine validation was performed.
