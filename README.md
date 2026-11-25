# Hermes Trutine — Birth Time Rectification

## Current simplified browser edition

Create a local birth record, choose an explicit prenatal duration and Equal or Whole sign houses, then **Save & calculate**. Real geocentric charts, experimental one-minute candidate scans and downloadable research PDFs run in the browser without accounts or a calculation server. No recurring payments or three-date gate were introduced. Classical Trutine equations remain unresolved. See [BROWSER_EDITION.md](BROWSER_EDITION.md) for browser settings, licences and verification boundaries.

The original Python edition below is preserved unchanged in `calculation-service/` and at commit `8e6482a`; it is not a prerequisite for browser calculations.

## Original laboratory edition

Ancient astrological methodology. Transparent astronomical calculations.

A local-first research workspace for professional astrologers investigating birth-time rectification. **Real Swiss Ephemeris astronomy now runs privately through an offline CLI. Classical Trutine rules remain unresolved; no public astronomical service is active.**

## Stage 1 delivered
- Midnight navy / antique gold dashboard with real local case counts and explicit unavailable result states.
- Seven addressable views: Dashboard, New Rectification, My Cases, Candidate Explorer, Chart Comparison, Methodology, Settings.
- Four-step birth record, prenatal assumptions, calculation profile, and review workflow.
- Explicit historical IANA timezone, ambiguity policy, manual observer coordinates, altitude, local midnight-crossing interval annotation, notes and user-recorded verification status.
- Multiple explicit prenatal duration assumptions, separate conception/LMP/custom conventions, separate prenatal location, optional known conception date.
- Classical, experimental modern and comparison profile selection. All four exploratory axis pairings preserved in the profile specification.
- IndexedDB case create/edit/duplicate/delete; persistence across reloads; versioned JSON export/import and CSV export. Imports receive new IDs and do not overwrite cases.
- No accounts, network case transmission or cloud synchronization.

Candidate Explorer and Chart Comparison open real local calculation JSON: planets, axes, cusps, overlays and explicitly experimental RMS minima/traces. Without a file, wheels remain empty. See PRIVATE_TESTING.md for setup, commands and limitations.

## Stage 2 scaffold delivered
`calculation-service/` contains independent FastAPI endpoints, Pydantic inputs/response models, a fail-closed service-token boundary, an isolated Swiss Ephemeris adapter, a Dockerfile and scaffold tests. The isolated adapter now performs real offline numerical calls; the HTTP scaffold does not. Protected calculation endpoints return 503. Health availability does not mean calculation readiness.

The Python service is **not hosted by Lovable** and is not connected to the web app. Lovable's web runtime cannot execute Python native bindings. Current testing is local-only: do not deploy or invite external testers before licensing/source-disclosure review.

## Development
```sh
bun install
bun run dev
bunx vitest run
```
The preview development server is managed by Lovable. Frontend source is React / TypeScript / TanStack Start / Tailwind v4.

Private Python astronomy:
```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r calculation-service/requirements-private.lock.txt
python3 calculation-service/prepare_ephemeris.py --destination /private/ephemeris
EPHEMERIS_PATH=/private/ephemeris PYTHONPATH=calculation-service python3 -m pytest calculation-service/tests
# No listener, token or account needed; see PRIVATE_TESTING.md for the CLI.
```

## File guide
- `src/features/laboratory/`: shell, dashboard, form, case list, readiness views, case schema, IndexedDB provider, and rule tests.
- `src/routes/`: seven leaf routes with individual metadata and shared shell in `__root.tsx`.
- `src/styles.css`: semantic color, typography, layout and instrument tokens/styles.
- `calculation-service/app/{main,schemas,ephemeris}.py`: API scaffold and isolated native binding boundary.
- `calculation-service/{Dockerfile,requirements.txt,requirements-dev.txt,.env.example}`: independent deployment scaffold.
- `calculation-service/tests/test_scaffold.py`: unavailable-state, input and service-token tests.
- `METHODOLOGY.md`, `CALCULATION_SPEC.md`, `API_DOCUMENTATION.md`, `PRIVACY.md`, `LICENSING.md`, `VALIDATION_PROTOCOL.md`: research and deployment specifications.
- `roadmap.md`: staged outstanding work.

## Outstanding requirements
1. Choose and approve the classical historical source and exact rule variants. The user elected to select a source later; classical calculations remain unavailable.
2. Public licensing/source-disclosure review. Private pinned-file astronomy and no-fallback checks are implemented; no Professional Licence purchase is approved.
3. Broader calendar/timezone precision checks. Civil folds/gaps, UTC/JD, explicit custom/conception durations are implemented; LMP and known-conception policies remain unresolved.
4. Classical equations and historical validation. Experimental topocentric fixed-duration RMS searching remains separately labelled.
5. Durable jobs, exhaustive-search analysis and any approved root-finding; current offline minima/refinement/deduplication keeps all four orientations per assumption run.
6. Further chart ergonomics such as zoom. Real planets/cusps/axes, exact tables, glyph tooltips, overlays and candidate selection are implemented.
7. Deploy Python service with HTTPS, resource/rate limits, data-retention controls and secure authenticated bridge. Never put service credentials in browser code. The frontend does not call the scaffold.
8. Optional explicitly activated cloud accounts and synchronization, private access policies, conflict handling. Decide profile-data needs before implementing authentication.
9. Independent astronomical reference charts, full regression and security suites, Docker image/deployment verification.

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for deployment instructions and [VALIDATION_PROTOCOL.md](VALIDATION_PROTOCOL.md) for precise validation boundaries. No ephemeris binaries or historical rule values are bundled. Documented JPL/native-Swiss astronomical outputs are retained in tests. See PRIVATE_TESTING.md for the approved local workflow.
