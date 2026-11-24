# Hermes Trutine Laboratory

Ancient astrological methodology. Transparent astronomical calculations.

A local-first research workspace for professional astrologers investigating birth-time rectification. **This delivery implements Stage 1 and the Stage 2 service scaffold only. It does not generate astronomical results or claim astronomical validation.**

## Stage 1 delivered
- Midnight navy / antique gold dashboard with real local case counts and explicit unavailable result states.
- Seven addressable views: Dashboard, New Rectification, My Cases, Candidate Explorer, Chart Comparison, Methodology, Settings.
- Four-step birth record, prenatal assumptions, calculation profile, and review workflow.
- Explicit historical IANA timezone, ambiguity policy, manual observer coordinates, altitude, local midnight-crossing interval annotation, notes and user-recorded verification status.
- Multiple explicit prenatal duration assumptions, separate conception/LMP/custom conventions, separate prenatal location, optional known conception date.
- Classical, experimental modern and comparison profile selection. All four exploratory axis pairings preserved in the profile specification.
- IndexedDB case create/edit/duplicate/delete; persistence across reloads; versioned JSON export/import and CSV export. Imports receive new IDs and do not overwrite cases.
- No accounts, network case transmission or cloud synchronization.

Candidate Explorer and Chart Comparison are readiness views, not completed result tools. No candidates, residual curves, chart positions or traces are simulated.

## Stage 2 scaffold delivered
`calculation-service/` contains independent FastAPI endpoints, Pydantic inputs/response models, a fail-closed service-token boundary, an isolated Swiss Ephemeris adapter, a Dockerfile and scaffold tests. The adapter reports binding availability and deliberately refuses numerical calls. Protected calculation endpoints return 503. Health availability does not mean calculation readiness.

The Python service is **not hosted by Lovable** and is not connected to the web app. Lovable's web runtime cannot execute Python native bindings. Deploy it separately to a compatible container provider after completing Stage 2.

## Development
```sh
bun install
bun run dev
bunx vitest run
```
The preview development server is managed by Lovable. Frontend source is React / TypeScript / TanStack Start / Tailwind v4.

Python scaffold:
```sh
python3 -m venv .venv
. .venv/bin/activate
pip install -r calculation-service/requirements-dev.txt
PYTHONPATH=calculation-service pytest calculation-service/tests
# Runs scaffold only; does not enable calculations:
uvicorn app.main:app --app-dir calculation-service --port 8000 --no-access-log
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
2. Complete Swiss Ephemeris file provisioning, verify requested flags, avoid silent Moshier fallback, record file hashes/version, and resolve licensing.
3. Implement historical timezone conversion (folds/gaps, midnight, DST), UTC/Julian Day handling and prenatal epoch conventions.
4. Implement classical and separately specified experimental topocentric engines, traces and reproducibility manifests.
5. Durable background jobs, all four orientation searches, coarse/fine scans, appropriate root-finding, minima detection and candidate deduplication.
6. Calculated SVG chart wheels, cusps, exact degrees, synchronized switching, zoom, tooltips and overlays.
7. Deploy Python service with HTTPS, resource/rate limits, data-retention controls and secure authenticated bridge. Never put service credentials in browser code. The frontend does not call the scaffold.
8. Optional explicitly activated cloud accounts and synchronization, private access policies, conflict handling. Decide profile-data needs before implementing authentication.
9. Independent astronomical reference charts, full regression and security suites, Docker image/deployment verification.

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for deployment instructions and [VALIDATION_PROTOCOL.md](VALIDATION_PROTOCOL.md) for precise validation boundaries. No ephemeris data files or historical reference values are bundled.
