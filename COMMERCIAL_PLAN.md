# Commercial planning report — 2026-11-24

Nothing purchased, applied or activated. Service stays `SERVICE_ENABLED=false`. No astronomical results exist.

## 1. pyswisseph vs direct C-library binding

| | pyswisseph (current plan) | Own ctypes/CFFI adapter over C library | pysweph (sailorfe) |
|---|---|---|---|
| Wrapper licence | AGPL-3.0 (Marquis copyright, no commercial offer found) | Our own code — proprietary-capable | AGPL-3.0, but **named in Astrodienst contract §13** as a binding that must honour dual licensing |
| Covered by Professional Licence? | Unclear: contract §13 says bindings must be dual-licensed, yet wrapper carries its own AGPL notice | Yes, if C library used under the Professional contract | Likely, but Astrodienst "assumes but cannot guarantee" |
| Effort | Lowest, mature | Medium: wrap ~10 functions (`swe_set_ephe_path`, `swe_julday`, `swe_utc_to_jd`, `swe_calc_ut`, `swe_houses_ex`, `swe_set_topo`, `swe_close`, error buffers) + build C lib in Docker | Low, similar API |
| Risks | Licence conflict for proprietary use | Memory/thread safety; must test against reference values; global C state (topo, path) → one worker process per job | Smaller project, maintenance |
| Isolation | Behind `SwissEphemerisAdapter` | Same interface | Same interface |

**Recommendation:** build a thin in-house ctypes adapter behind the existing interface (smallest licence surface), keep pysweph as a fallback after written Astrodienst confirmation. Do not use pyswisseph for the proprietary route.

## 2. Licensing risk assessment (proprietary subscription SaaS)

Source: Astrodienst contract "Edition September 2026 update 9 Nov 2026" (official GitHub copy; astro.com pages could not be fully loaded — UNVERIFIED there).

| Question | Finding | Risk |
|---|---|---|
| Price | CHF 700, unlimited projects | Low |
| Duration | **Valid 6 years**, then renew or stop | Medium — budget renewal |
| SaaS / browser users | §2: server use allowed; "End users use an internet browser to connect to the server" | Low |
| Selling an API to other businesses | §3: each business must buy its own licence; we must document this and tell Astrodienst who they are | **High if we offer an API** → keep it to end-user app only |
| Wrapper licence | pyswisseph AGPL independent of C licence | **High** → own adapter |
| Server count / replicas | "Unlimited" refers to projects; servers not stated | Medium → ask Astrodienst |
| Timing | Choice must be made before any public service is activated | Hard gate (current state complies) |

**Questions to send Astrodienst (in writing) before purchase:**
1. Does the licence cover a subscription web app for professional astrologers with several server replicas?
2. Is an in-house ctypes binding to the C library covered without further permission?
3. Is pysweph covered under the Professional route?
4. Confirm the 6-year term and renewal price.
5. Confirm that a private server function used only by our own app is not an "API service to third parties".

Not legal advice; a lawyer should review the signed contract.

## 3. Hosting cost estimate (monthly, USD, live prices 2026-11-24)

| Item | Render (Hobby workspace) | Railway Hobby |
|---|---|---|
| Base | $0 workspace | $5 minimum (includes $5 usage) |
| Calculation service 0.5 CPU / 512 MB, always on | $7.00 | ≈ $5 RAM + up to $10 CPU at full load; idle usage much lower → ≈ $5–15 |
| 1 GB disk for ephemeris files | $0.25 | ≈ $0.16 |
| Bandwidth | 5 GB included, then $0.15/GB | $0.05/GB |
| Postgres (only if needed for jobs) | $6 + $0.30/GB | usage-based |
| **Estimated total** | **≈ $7–14** | **≈ $5–20** |

Render gives a fixed, predictable price; Railway is cheaper when idle but varies with CPU. User accounts and cloud sync would use Lovable Cloud, billed separately (not estimated here). Render's Pro workspace ($25/month) is only needed for team features.

## 4. Revised architecture

```text
Browser app (TanStack, local-first IndexedDB)   ← provider-independent
   │  no secrets, no calculation logic
   ▼
App server functions (Lovable Cloud)            ← auth, entitlements, sync (later)
   │  private service token, HTTPS
   ▼
Calculation service (Docker, FastAPI)           ← runs on Render / Railway / any host
   ├─ methods/   historical rules (gated by SOURCES.md)  ← library-independent
   ├─ search/    candidate search, residuals             ← library-independent
   ├─ angles.py  numerical conventions                   ← library-independent
   └─ EphemerisPort interface
        └─ adapter: own ctypes binding (planned) | pysweph | pyswisseph
             └─ Swiss Ephemeris C library + licensed .se1 files (mounted disk)
```

Provider-specific files: only `render.yaml` / `render.production.yaml`. The Docker image reads `PORT`, `SERVICE_ENABLED`, `CALCULATION_SERVICE_TOKEN`, `ALLOWED_ORIGINS`, `EPHEMERIS_PATH`, so moving to Railway needs no code change.

Commercial readiness still to come: accounts, tiers/entitlements and payments are deferred until the engine is validated.
