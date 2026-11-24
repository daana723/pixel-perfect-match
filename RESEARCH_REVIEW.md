# Verification & research review — 2026-11-24

Render: **off** (Blueprint not applied; `SERVICE_ENABLED=false`). Licence: **not selected**. No historical rules implemented. No results generated.

## 1. Rule-by-rule comparison

| # | Rule | Status | Basis |
|---|---|---|---|
| R1 | Sign of the Moon at birth = sign ascending at conception | **Explicit** | Centiloquium 51 (Boer Greek; Coley 1676; Ashmand 1822) |
| R2 | Sign of the Moon at conception = sign ascending at birth | **Explicit** | Same aphorism |
| R2b | …"or its opposite" (Descendant alternative) | **Interpretation / textual variant** | In Coley & Ashmand English; **not in Boer's Greek** |
| R3 | Matching to the degree, not just the sign | **Interpretation** | Aphorism speaks of signs only; degree-level use belongs to later tradition (Ibn Ezra passage not yet transcribed) |
| R4 | Waxing/waning Moon decides ASC vs DSC | **Unresolved** | Not in the aphorism; source for this rule not verified |
| R5 | Prenatal duration (e.g. ~273 days, Moon-based adjustment) | **Unresolved** | Likely in Ibn Ezra *Moladot* II 5–6 and Bailey 1916; text not read |
| R6 | Tolerances / orbs | **Unresolved** | No source located |
| R7 | Four ASC/DSC orientations | **Exploratory (software)** | Not a historical claim |
| R8 | Topocentric Moon, observer location | **Experimental (Engine B)** | No historical source; kept separate |
| R9 | Sepharial "Solar Epoch" rules | **Later interpretation, unresolved** | Contents (lunar/solar horoscope chapters) located; rules not transcribed |

## 2. Verified sources (with links)

**Centiloquium 51.** Boer, *Karpos*, Leipzig 1952, rev. 1961 — online transcription: https://ptolemaeus.badw.de/edition/10/24/text/1 · Holden, *Five Medieval Astrologers* (2008) pp. 71–87 (English of Boer) · Plato of Tivoli Latin (1136) https://ptolemaeus.badw.de/work/41 · Pontano, crit. ed. Rinaldi (Brepols 2025).
Coley 1676 (transcribed by D. Houlding, https://www.skyscript.co.uk/centiloquium1.html):
> "In what sign the Moon is at the time of birth, make that sign the ascendant in conception; and in what sign she is found at the conception, make that or its opposite the sign ascending at the birth."

Ashmand (https://www.renaissanceastrology.com/liberfructus.html):
> "Make the sign occupied by the Moon at the time of birth the sign ascending at the conception; and consider that in which she may be posited at the conception, or the opposite one, as the sign ascending at the birth."

Numbering: Boer 51, Coley 51, Ashmand LI. Hermes' separate *Centiloquium* no. 51 must not be confused with it. **UNVERIFIED:** any Schmidt/Project Hindsight translation; full numbering concordance.

**Ibn Ezra.** *Sefer ha-Moladot* II 5,1–10 (and II 6), ed./tr. Shlomo Sela, *Abraham Ibn Ezra on Nativities and Continuous Horoscopy*, Brill (AIEAW vol. 4, ©2014), discussion pp. 41, 221, 231–232; appendices pp. 442–449 (Mishpetei ha-Mazzalot, Latin 1485 *Liber de nativitatibus*, Exodus 2:2 commentary). Attributed to **Enoch** ("Enoch's balance"). Sela p. 41 n. 197: the exact phrase *trutina Hermetis* appears in none of the early Latin witnesses; coined later (Lilly 1647 "Trutine of Hermes"). Also: Sela, "Calculating Birth…", Brepols 2019, pp. 79–106 (not read). Epstein translations (ARHAT 2008) exist; **Trutine passages in them UNVERIFIED**.

**Sepharial.** *The Solar Epoch: A New Astrological Thesis*, London: W. Foulsham, 90 pp. **Year UNRESOLVED: 1924 (Casa Fernando Pessoa, Google Books) vs 1925 (dealer listing).** Chapters: Horoscope of Birth p. 11; Lunar Horoscope p. 25; Solar Horoscope p. 44; Directional Influences p. 77. Related: E. H. Bailey, *The Pre-Natal Epoch*, Foulsham 1916, 239 pp. (verified).

## 3. Swiss Ephemeris plan

- Package: `pyswisseph==2.10.3.2` (latest on PyPI), bundles Swiss Ephemeris C **2.10.03**. PyPI licence field empty; `LICENSE.txt` is **AGPL-3.0**.
- Now moved to `requirements-ephemeris.txt` — **not installed in the Docker image** until licensing is decided.
- Files needed (1800–2399): `sepl_18.se1` (planets), `semo_18.se1` (Moon). `seas_18.se1` (asteroids) not needed. None included.
- Risk: missing files silently fall back to Moshier; the adapter must check returned flags and reject it.
- Licensing: AGPL → whole project under AGPL-compatible terms, source offered to network users. Professional → CHF 700 unlimited (Astrodienst price page), signed contract. **Caution:** a Professional licence covers the C library; the pyswisseph wrapper is itself AGPL, so the Professional route may need a different binding (e.g. own ctypes wrapper). Needs legal review.

## 4. Render configuration check

| Area | Status |
|---|---|
| Kept disabled | Blueprint not applied; `autoDeploy: false`; `SERVICE_ENABLED=false` → all protected endpoints return 503 `service_disabled` (tested) |
| Secrets | `CALCULATION_SERVICE_TOKEN` generated inside Render; timing-safe comparison; never in browser code |
| CORS | Only origins in `ALLOWED_ORIGINS`; empty = none; GET/POST, Authorization/Content-Type only |
| Health | `/api/v1/health` public, reports `calculation_ready: false`, no data |
| Logging | Access log off; request bodies never logged |
| Image | Non-root user; Swiss Ephemeris not included |
| Gaps | No rate limiting; FastAPI auto-docs now disabled; free tier sleeps |

## 5. Tests (actual results)

`PYTHONPATH=calculation-service pytest -v calculation-service/tests` → **14 passed**
- Angle maths (4): wrap normalisation, signed difference at 0/360, opposite point, NaN rejection.
- Service scaffold (10): health, four orientations, unavailable results, token required, timezone required/invalid, no default duration, adapter refuses fake positions, disabled by default.

`bunx vitest run` → **10 passed** (input validation, archive, CSV safety, routing).

**Astronomical tests: 0. Historical-method tests: 0.** Neither exists yet.

## 6. File tree and status

Implemented: `src/features/laboratory/*` (case storage, forms, dashboard, case list, shell, views), `src/routes/*`, `calculation-service/app/angles.py`, `schemas.py`, auth/CORS/gate in `main.py`, all tests.
Scaffolded (deliberately unavailable): `main.py` calculation endpoints, `ephemeris.py` adapter, `Dockerfile`, `render.yaml`, Candidate Explorer, Chart Comparison, `chart-wheel.tsx` (frame only, empty).
Documentation: README, METHODOLOGY, CALCULATION_SPEC, API_DOCUMENTATION, PRIVACY, VALIDATION_PROTOCOL, SOURCES, LICENSING, DEPLOYMENT_RENDER, roadmap.
Placeholders: none with fake data.

```
.gitignore
.lovable/north-star/north-star.md
.lovable/project.json
.prettierignore
.prettierrc
AGENTS.md
API_DOCUMENTATION.md
CALCULATION_SPEC.md
DEPLOYMENT_RENDER.md
LICENSING.md
METHODOLOGY.md
PRIVACY.md
README.md
SOURCES.md
VALIDATION_PROTOCOL.md
bun.lock
bunfig.toml
calculation-service/.dockerignore
calculation-service/.env.example
calculation-service/Dockerfile
calculation-service/app/__init__.py
calculation-service/app/angles.py
calculation-service/app/ephemeris.py
calculation-service/app/main.py
calculation-service/app/schemas.py
calculation-service/requirements-dev.txt
calculation-service/requirements-ephemeris.txt
calculation-service/requirements.txt
calculation-service/tests/test_angles.py
calculation-service/tests/test_scaffold.py
components.json
eslint.config.js
package.json
public/favicon.ico
public/robots.txt
render.yaml
roadmap.md
src/features/laboratory/case-list.tsx
src/features/laboratory/case-provider.tsx
src/features/laboratory/cases.test.ts
src/features/laboratory/cases.ts
src/features/laboratory/celestial-instrument.tsx
src/features/laboratory/chart-wheel.tsx
src/features/laboratory/dashboard.tsx
src/features/laboratory/database.ts
src/features/laboratory/rectification-form.tsx
src/features/laboratory/research-views.tsx
src/features/laboratory/shared.tsx
src/features/laboratory/shell.tsx
src/hooks/use-mobile.tsx
src/lib/error-capture.ts
src/lib/error-page.ts
src/lib/lovable-error-reporting.ts
src/lib/utils.ts
src/routeTree.gen.ts
src/router.tsx
src/routes/README.md
src/routes/__root.tsx
src/routes/candidates.tsx
src/routes/cases.tsx
src/routes/comparison.tsx
src/routes/index.tsx
src/routes/methodology.tsx
src/routes/new-rectification.tsx
src/routes/settings.tsx
src/server.ts
src/start.ts
src/styles.css
src/test/app-routing.test.tsx
src/test/setup.ts
tsconfig.json
vite.config.ts
vitest.config.ts
src/components/ui/ (46 standard UI parts)
```

## 7. Full documents

### SOURCES.md
```markdown
# Historical source and methodology framework

Status: research framework only. **No rule below is verified or implemented.** Every rule is `UNRESOLVED` until an exact author, edition, translator and passage are recorded.

## Source hierarchy (chosen by project owner)
| Layer | Source | Role | Status |
|---|---|---|---|
| Primary textual starting point | Pseudo-Ptolemy, *Centiloquium (Karpos)*, Aphorism 51 | Earliest text for the Trutine principle | Candidates verified: Boer Greek ed. (Leipzig 1952, rev. 1961); Coley 1676; Ashmand 1822; Holden 2008 (Eng. of Boer). Edition not yet selected |
| Historical transmission | Abraham Ibn Ezra, *Sefer ha-Moladot* II 5,1–10 (also II 6), ed./tr. S. Sela, Brill 2013/2014 (AIEAW vol. 4) | Method attributed to Enoch ("Enoch's balance") | Passage located; text not yet transcribed into a rule record |
| Later interpretation | Sepharial, *The Solar Epoch*, London: W. Foulsham, 1924 [also catalogued 1925] | **Modern interpretation, not an ancient source** | Year disputed (UNRESOLVED); 90 pp. |

Ptolemy's *Tetrabiblos* Book III is not used as the primary authority.
Traditions must never be silently combined; each becomes a separate selectable rule variant.

See `RESEARCH_REVIEW.md` for verified quotations, URLs and the rule comparison table.

## Rule record template (fill for every rule)
- Rule ID / variant:
- Author, work, edition, translator, passage (page/line):
- Original text and translation quoted:
- Interpretation chosen and why; competing readings:
- Exact equation, sign convention, orientations, phase (waxing/waning) conditions:
- Prenatal duration convention:
- Status: UNRESOLVED | VERIFIED (by whom, date)

## Open questions (all UNRESOLVED)
1. Which axis (ASC/DSC) applies at each epoch, and under what Moon condition.
2. Prenatal duration rule (fixed ~273 days vs. Moon-dependent adjustments).
3. Tolerances and whether the text implies reciprocity in both directions.
4. Where Ibn Ezra's version differs from the Centiloquium; where Sepharial departs from both.

Unresolved rules stay unimplemented or configurable with explicit user selection.
```

### LICENSING.md
```markdown
# Licensing checklist

Swiss Ephemeris is dual-licensed. Review the exact licenses shipped with the selected distribution and the official terms: https://www.astro.com/swisseph/swephinfo_e.htm and https://www.astro.com/swisseph/swephprg.htm

## Alternatives
- **AGPL-3.0 route:** comply with the applicable network-use and source-disclosure obligations. Separating a service does not automatically remove licensing obligations. Review the combined distribution and deployment with qualified advice.
- **Professional license route:** obtain the applicable agreement from the rights holder before relying on closed-source commercial rights. No license purchase or permission has been assumed or obtained by this project.

The Python `pyswisseph` binding and any ephemeris data files have their own applicable notices/terms that must also be reviewed. Pinning or installing a package is not evidence of commercial permission. The scaffold adapter is isolated to make implementation/distribution changes possible without rewriting the frontend, not to circumvent license obligations.

## Before distribution
- [ ] Decide AGPL-compliant distribution versus a professional agreement.
- [ ] Review Swiss Ephemeris, pyswisseph, ephemeris-data and transitive dependency terms.
- [ ] Obtain any required professional permission; document scope.
- [ ] Include required notices and license copies.
- [ ] Make corresponding source available when required.
- [ ] Review API/network deployment obligations.
- [ ] Document provenance, versions and file hashes.
- [ ] Review fonts and frontend dependency licenses.

No license choice for proprietary commercial distribution is made by this scaffold. No ephemeris data files are included. This document is not legal advice.

## Decision status
Undecided. The project is **neither AGPL nor proprietary** until the owner decides explicitly.

## Implications if AGPL is chosen
- The AGPL network clause applies: users interacting with the service over a network must be offered its corresponding source.
- If the frontend and service form one combined work, the obligations may extend to the whole project; whether separation is sufficient needs legal advice.
- Any modifications to Swiss Ephemeris or the service must be published under AGPL-compatible terms.

## Implications if the Professional Licence is chosen
- Closed-source and commercial distribution become possible under the agreement's scope.
- Fee and scope are set by Astrodienst; the agreement must be in hand before public activation.

## Until decided
Ephemeris access stays behind `SwissEphemerisAdapter`; the service is not publicly activated or distributed with Swiss Ephemeris enabled.
```

### DEPLOYMENT_RENDER.md
```markdown
# Render deployment (prototype, not activated)

**Do not deploy publicly with Swiss Ephemeris until the AGPL vs Professional licence decision is made.** The current service returns explicit "unavailable" responses and calculates nothing.

## Configuration (`render.yaml`)
- Docker web service, root `calculation-service/`, free plan, `autoDeploy: false`.
- Health check: `GET /api/v1/health` (public, reports `calculation_ready: false`).
- `CALCULATION_SERVICE_TOKEN`: generated by Render; never placed in `VITE_` variables or browser code. Only a future server function will hold a copy.
- `ALLOWED_ORIGINS`: comma-separated app origins for CORS. Empty means no browser origin is allowed.
- Port is taken from Render's `PORT`.

## Steps (when licensing is decided)
1. In Render: New → Blueprint → select this repository. Never share Render credentials in chat.
2. Set `ALLOWED_ORIGINS` to the published app URL.
3. Confirm `/api/v1/health` responds; protected endpoints return 401 without the token.
4. Add the token to the app's secure secrets for the server bridge (Stage 2 completion).

Free tier sleeps when idle; first request may take ~30–60 s.
```
