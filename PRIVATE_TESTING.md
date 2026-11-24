# Private astronomical testing — 2026-11-24

## Hosting decision and privacy

**Local development only. Nothing was deployed, bought or exposed to external testers.**

Render Free web services have public addresses; Render's private service type does not have a Free instance. Web-service inbound IP restrictions require Scale/Enterprise. An application bearer token would protect a calculation request, but would not make the service itself unreachable publicly. This does not satisfy the owner's current non-public requirement. Hugging Face hosting was not needed or activated.

Sources checked: [Render Free](https://render.com/docs/free), [Private Services](https://render.com/docs/private-services), [Inbound IP Rules](https://render.com/docs/inbound-ip-rules).

The approved calculation path starts **no HTTP listener**. Export a case locally, calculate on your own computer, open the resulting JSON in Chart Comparison or Candidate Explorer. The browser reads the selected file directly; it does not upload it or send birth inputs to Python, Cloud or another provider. Imported results live in memory for this browser session, survive navigation, and disappear on refresh or Clear. Original cases still use local IndexedDB. Backups/result files contain private inputs: protect them like the original records.

The FastAPI scaffold still refuses every astronomical HTTP request, defaults to `SERVICE_ENABLED=false`, and has no public documentation endpoints. Existing Render drafts are dormant. There is no Cloud connection, network bridge, remote job queue or external testing invitation.

## Local setup

From the project root on Linux/macOS with Python 3.12 or 3.13:

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r calculation-service/requirements-private.lock.txt
python3 calculation-service/prepare_ephemeris.py --destination /private/ephemeris
```

The exact lock was tested on Python **3.13.18 / Linux**. Python 3.12 remains the Docker scaffold target, not a tested private numeric runtime. Building pyswisseph from its source archive can require a C compiler. `zoneinfo` uses the operating system's IANA files; the exact zone-file hash and available tzdb version are recorded. On systems without these files, use a Linux environment; missing provenance is refused rather than assumed. Files are downloaded from the official upstream repository and verified against pinned hashes. They are not committed or served by the app. Tests make no live astronomical API calls.

## Real calculation, then searching

Export JSON for one saved case from My Cases. Choose its zero-based case index and an explicit time within its birth interval. Choose a zero-based duration assumption index; there is no universal duration. Paths below are examples: use your actual local filenames.

```sh
PYTHONPATH=calculation-service python3 -m app.cli /private/case.json \
  --case-index 0 --local-time 12:00 --assumption-index 0 \
  --ephemeris-path /private/ephemeris \
  --output /private/astronomy.json
```

This produces **geocentric astronomy**, not a classical Trutine calculation, even when the saved case selected the classical method. Add `--topocentric` for the separately labelled experimental topocentric profile. Prenatal charts use the explicit custom/conception duration subtracted as elapsed UTC hours, and the selected prenatal observer. An LMP assumption and a known conception date are refused until their conversion/precedence/intraday policies are approved.

Run the real reference suite first:

```sh
EPHEMERIS_PATH=/private/ephemeris PYTHONPATH=calculation-service \
  python3 -m pytest calculation-service/tests/test_astronomy.py -q
```

After inspecting real positions and passing regressions, exploratory searching is available **only** with explicit topocentric opt-in:

```sh
PYTHONPATH=calculation-service python3 -m app.cli /private/case.json \
  --case-index 0 --local-time 12:00 --assumption-index 0 \
  --ephemeris-path /private/ephemeris --topocentric \
  --search-experimental --step-seconds 60 --output /private/search.json
```

Open either output with **Open calculation JSON**. Search files contain natal/prenatal charts for every retained minimum; View opens that candidate's charts. Side-by-side and overlay show actual positions, with exact longitudes/angles/cusps below. Imported files are schema- and consistency-checked, not digitally authenticated as Swiss outputs; arbitrary edited JSON is not an independent astronomical reference.

## Calculation settings and supported scope

- Gregorian dates, **1800-01-01 inclusive to 2400-01-01 exclusive**, at both epochs. Other Swiss data centuries and pre-Gregorian calendars are unsupported under this file policy.
- Explicit IANA civil timezone; skipped times rejected; repeated times require `reject`/`earlier`/`later`. Overnight intervals extend to the next date; equal endpoints are a point interval. Offset-transition observations are sampled every 15 UTC minutes, not exact transition instants. Historical tzdb records can be uncertain.
- UTC civil timestamps are used as UT1 without measured DUT1 (up to 0.9 seconds difference). Gregorian UT Julian Day; automatic Swiss ΔT gives TT. No claim of subsecond historical timing accuracy.
- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto. Apparent tropical ecliptic-of-date longitude/latitude, light-time/aberration/nutation according to Swiss defaults; distance AU, speed degrees/day. No sidereal, J2000, true-position or approximate fallback flags.
- Requested/returned geocentric flags **258 = SWIEPH(2) + SPEED(256)**; topocentric **33026 = 258 + TOPOCTR(32768)**. Moshier/JPL engine fallback or missing requested bits raises an error. Files and binding/core versions must match the approved pins.
- Longitude east-positive, latitude north-positive, altitude metres. Topocentric observer is explicitly set before calculation; native mutable settings serialized by a process-local lock. CLI runs in its own process; there is no shared public worker pool.
- House systems: P = Placidus, E = equal (Ascendant-based), W = whole sign, R = Regiomontanus. Swiss computes Ascendant, MC, and 12 cusps; Descendant/IC are opposites. Geographic poles rejected. Swiss polar house failure is an error; no Porphyry substitute accepted. House angles are geographic horizon calculations, not shifted by the topocentric planetary flag.
- Reproducibility: full original case, canonical input hash, selected local time, fold/offset, UTC epochs, exact timezone hash/version, Python version, engine source hashes, two Julian Days, ΔT, observer, settings, file hashes, flags, positions/axes/cusps. Output is not signed or immutable storage; retain an unchanged backup and its source revision.

## Experimental search specification — not historical

For each natal/prenatal horizon pairing (ASC/ASC, ASC/DSC, DSC/ASC, DSC/DSC):

`r1 = signed circular difference(prenatal Moon, natal selected horizon)`

`r2 = signed circular difference(natal Moon, prenatal selected horizon)`

`objective = sqrt((r1² + r2²) / 2)` in degrees.

These are an **explicit exploratory modelling choice**, not a verified quotation or classical rule. Prenatal duration is fixed for each run; no phase, sex, gestation or historical corrections are inferred. A one-dimensional RMS minimum is not a simultaneous zero of two residuals, a probability, or evidence of the true birth time.

Coarse scan: full resolved UTC interval including both boundaries; 30–120-second steps (default 60); maximum 26 UTC hours. Local coarse minima refined by bounded golden-section minimization to 0.5 seconds, including original sampled/boundary values. Deduplicate within 1 second **inside each orientation only**. Run each duration separately, preserving its assumption index. Both residuals and every objective evaluation are recorded. Squared circular residuals avoid a sign-wrap jump in the objective, but a coarse scan is still resolution-limited and can miss narrow minima or discontinuous branches; no exhaustive/root-completeness claim is made. All alternate orientations remain visible, even when their fits are poor.

Classical searching remains unimplemented. Historical source verification and the approved exact equations are still blocking it.

## Dependencies and licences

- **pyswisseph 2.10.3.2**, Swiss C core **2.10.03**. PyPI source SHA-256: `c54c305e83dbd5d2b71e58d8a69d8ee41de24c4d3328ce09e2af860a3537624d`. Binding declares AGPL v3; Swiss core is dual AGPL/Professional. Private testing uses AGPL, not paid rights. No application-wide licence grant or public-source readiness is implied.
- Source: [pyswisseph 2.10.3.2](https://pypi.org/project/pyswisseph/2.10.3.2/), [Swiss licensing](https://www.astro.com/swisseph/swephinfo_e.htm), [GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html). Exact binding licence and bundled Swiss notice preserved under `calculation-service/notices/`.
- `sepl_18.se1` SHA-256 `9f057b316b1890a7f9340d0bf92db96edbab4939dbcc54762b62f6a70a059eb0`; `semo_18.se1` SHA-256 `1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7`. Official provenance: `https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/` plus filename. Swiss data/notice conditions also apply; no asteroid or JPL binary files are needed/included.
- Runtime/test packages, exact resolved versions and declared licence metadata are recorded in `calculation-service/dependencies.private.json`; reproducible package pins in `requirements-private.lock.txt`. Includes FastAPI 0.115.12 (MIT), Uvicorn 0.34.2 (BSD-3-Clause), Pydantic 2.11.4/core 2.33.2 (MIT), Pytest 8.3.5 (MIT), HTTPX 0.28.1 (BSD-3-Clause), and their recorded transitives. Certifi is MPL-2.0; packaging is Apache-2.0 OR BSD-2-Clause. Metadata is an inventory, not a legal compatibility opinion. Optional dependency extras are listed in metadata but not installed by the lock.
- Python standard library/zoneinfo use Python's licence; system IANA tzdb has its own notices. Preserve host/runtime notices when distributing. Frontend packages/fonts remain separately subject to their licences; a comprehensive combined-distribution review is outstanding.

The adapter's `EphemerisPort` contract is the replaceable boundary; civil conversion, prenatal assumptions, experimental search and browser result format are independent of the binding. A future Professional agreement **does not by itself relicense the AGPL Python binding**. It requires a suitable binding implementation and scope review. Separation is modularity, not a workaround for copyleft.

Before any remote/public testing: review AGPL covered-work scope, corresponding source (including build/install instructions and modifications), network source offer, notices and data terms. Astrodienst's published notice expressly describes the whole project AGPL/compatible obligation. A private repository does not itself satisfy a required source offer. Nothing here substitutes for qualified legal review.