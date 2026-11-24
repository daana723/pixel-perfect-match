# Hermes Trutine Laboratory roadmap

## First deliverable
- [x] Stage 1: laboratory dashboard, seven navigation views, birth/prenatal/method workflow, private local case CRUD and import/export.
- [x] Stage 2 scaffold: independent Python FastAPI service, isolated Swiss Ephemeris adapter, Docker setup and explicit unavailable calculation responses.
- [x] Document methodology gates, integration, privacy, licensing, validation and outstanding requirements.
- [x] Run available frontend and Python scaffold tests; verify real local case workflow on desktop and mobile.

## Private astronomical implementation (current request)
- [x] Confirm declared dependency terms; select local private testing (Render Free lacks the required private service access).
- [x] Implement modular Swiss adapter, real longitudes/axes/houses, strict file/flag no-fallback checks and UTC/JD.
- [x] Demonstrate actual planetary positions and pass documented regressions before implementing searching.
- [x] Populate natal/prenatal wheels and overlays from locally calculated files; no private-case transmission.
- [x] Implement clearly labelled experimental fixed-duration RMS search/traces across all four orientations.
- [x] Document dependencies/settings/reproducibility; verify case export → offline calculation → chart/candidate selection on desktop and phone.

## Later stages (not part of this delivery)
- [x] Render deployment config, CORS, health check, deployment guide.
- [ ] Stage 2 public deployment, secure bridge, jobs. Blocked by public licensing/source-disclosure review; local testing only.
- [ ] Stage 3: source-approved classical equations and independent reference validation. Source framework written (SOURCES.md); blocked by exact editions/passages.
- [x] Stage 4: private experimental topocentric profile; not a historically validated corrected Trutine.
- [x] Stage 5: private resolution-limited all-orientation RMS minima, traces and comparison; no exhaustive-root claim.
- [x] Stage 6 scaffold: chart wheel frame (shows no data until calculated).
- [x] Stage 6: real local planets, axes, cusps, exact tables and overlays.
- [ ] Stage 7: explicit opt-in cloud sync and authentication.
- [x] Stage 8: limited private astronomical regressions and no-network UI acceptance.
- [ ] Stage 8: comprehensive independent multi-epoch astronomy and public security/deployment verification; blocked by public licensing/source review.
## Commercial planning (current)
- [x] Production Render config (Starter, not applied).
- [x] Report: COMMERCIAL_PLAN.md.
- [ ] Written confirmation from Astrodienst (user to send questions).
- [ ] Payments: deferred until engine validated.
## Calculation engine (started, no subscriptions)
- [x] Civil time → UTC (gap/fold handling, offset transitions), Julian Day UT, explicit prenatal windows, orientation-separated minimum search — ephemeris-independent, tested.
- [x] Real Moon/planetary positions, ASC/DSC/MC and houses for local private AGPL testing only.
- [ ] Classical equations. Blocked by exact source passages.
## Product direction (2026-11-24)
- [x] PRODUCT_ROADMAP.md: tiers, future auth/entitlement/payment architecture.
- [ ] Repository visibility: owner to set GitHub repo private (recommended).
- [ ] Public licence/source-disclosure review; private AGPL testing approved, no public activation.
