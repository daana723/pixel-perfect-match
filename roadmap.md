# Hermes Trutine — Birth Time Rectification roadmap

## Astrologer-facing results
- [ ] Show zodiac degrees/minutes, prominent Ascendant and local clock times, planetary houses, and readable natal/prenatal comparisons in charts, candidates and PDF.
- [ ] Verify a 05:00–07:00 window accepts 06:33 without presenting the entered time as a rectification result; run regression tests and desktop/phone checks.
- [ ] Validate the owner's manual 06:33 result independently: awaiting exact birthplace and worked method/prenatal epoch; do not force this target or implement an invented historical rule.

## Simplified browser edition
- [x] Check entered birth times and add approximate weeks: 44 frontend tests passed; desktop/phone create → calculate → edit verified, no private POSTs. Read new/edit form, shared schemas, saved-case calculator (comparison/candidates), browser scan, case archive CRUD/import/export, dashboard, settings backups, results import, wheels/report flow and offline Python pair/search/validation. Existing records and Python service unchanged; approximate assumptions remain marked, no automatic LMP-to-conception conversion.
- [x] Add private search across 34,246 GeoNames cities for birth and prenatal places, automatic coordinates and birth timezone, manual overrides; verified saved case → real charts, phone layout and privacy (38 frontend tests passed).
- [ ] Three free birth-date cases, then EUR 12 once via Stripe: owner deferred payment setup; no enforcement until checkout and paid-access verification exist.
- [x] Preserve an original source backup and rename the app, retaining its visual direction and tagline.
- [x] Add private browser astronomy and explicitly experimental fixed-duration candidate scanning; retain the Python engine unchanged.
- [x] Add downloadable PDF research reports and document engine/licensing limits.
- [x] Verify calculations, case-to-chart-to-report flow and mobile layout (32 tests; desktop and phone).
- [x] Optional support-link plumbing; superseded by the requested one-time Stripe/trial direction, not activated.

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
- Earlier subscription tiers and paid hosting plans are superseded by three free birth-date cases and EUR 12 once via Stripe; setup is deferred by the owner, no payment gate is active.
- [x] Production Render config (Starter, not applied).
- [x] Report: COMMERCIAL_PLAN.md.
- [ ] Written confirmation from Astrodienst (user to send questions).
- [ ] Payments: owner chose to decide on Stripe setup later.
## Calculation engine (started, no subscriptions)
- [x] Civil time → UTC (gap/fold handling, offset transitions), Julian Day UT, explicit prenatal windows, orientation-separated minimum search — ephemeris-independent, tested.
- [x] Real Moon/planetary positions, ASC/DSC/MC and houses for local private AGPL testing only.
- [ ] Classical equations. Blocked by exact source passages.
## Product direction (2026-11-24)
- [x] PRODUCT_ROADMAP.md: tiers, future auth/entitlement/payment architecture.
- [ ] Repository visibility: owner to set GitHub repo private (recommended).
- [ ] Public licence/source-disclosure review; private AGPL testing approved, no public activation.
