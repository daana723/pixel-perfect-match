# Hermes Trutine — Birth Time Rectification

## Simplified edition

The existing visual identity and “A timeless method. A precise inquiry.” are preserved. Case storage remains private in the browser. Create a birth record, specify a prenatal duration, choose Equal or Whole sign houses, then select **Save & calculate**. That uses the earliest saved birth time and first assumption. Chart Comparison also allows choosing any saved case, selected time and assumption. Calculation, candidate scanning and PDF preparation run locally without a Python install, account, paid API or calculation server.

The original Python source is unchanged and preserved at commit `8e6482a`. A clean source ZIP was also saved for the owner. The archive excludes repository metadata, dependencies and generated route output; ephemeris binaries were never committed and must be obtained using the original setup instructions.

## Calculation settings and limits

- Astronomy Engine **2.1.19**, by Donald Cross, MIT. Source: https://github.com/cosinekitty/astronomy . Its documented design target is ±1 arcminute, not Swiss Ephemeris equivalence. This application's limited J2000 checks do not establish that accuracy for every date.
- `GeoVector(body, time, true)` followed by `Ecliptic`: geocentric, light-time/aberration-corrected ecliptic of date; tropical zodiac. Sun, Moon and eight planets, including Pluto.
- Apparent sidereal time and true obliquity feed analytic ASC/DSC/MC/IC geometry. Equal houses start at ASC; Whole sign starts at the ASC sign boundary. Placidus/Regiomontanus and topocentric positions stay in the original Python edition; no silent substitution.
- Browser edition intentionally limits natal and prenatal epochs to **1900–2100** and latitude to **strictly between −66° and +66°**. The library supports a wider range, but this edition does not claim to validate it.
- `@js-temporal/polyfill` **0.5.1**, ISC, resolves explicit IANA zones, rejects gaps, and applies reject/earlier/later fold policies. Browser timezone data and its exact version cannot be exported reproducibly. UTC approximates UT1; Astronomy Engine supplies its own modeled ΔT.
- Search is a **60-second grid**, retaining at most five sampled local minima per each of four orientations, including boundary minima. No sub-grid refinement, exhaustive-root, probability or historically correct birth-time claim. Duration is exactly the user-entered elapsed days/hours; no universal gestation duration or prenatal syzygy rule is invented. LMP and known-conception intraday policy remain unresolved and are refused.
- RMS uses shortest signed angular residuals: prenatal Moon minus natal horizon, natal Moon minus prenatal horizon. This is an experimental research relationship, not an implemented classical Trutine algorithm.
- Results remain in session memory. PDF exports include the selected candidate, charts, positions, all candidates, assumptions, recorded verification and notes. Built-in PDF fonts represent unsupported Unicode as explicit codepoint escapes rather than losing it.

## Licensing and cost

`jspdf` **4.2.1** is MIT. Browser dependency notices are supplied under `public/licenses/`. MIT licences cover those dependencies, **not** an automatic relicensing of this repository. The independent Swiss/pyswisseph code and notices keep their existing conditions. No AGPL server is exposed or enabled.

The earlier claim that switching libraries supplies a historically validated Trutine algorithm was incorrect. Exact historical equations and phase/duration/axis policies still require source approval and reference validation. No prenatal syzygy formula has been added.

No recurring billing, payment processing, three-date limit, licence purchase, Render deployment, Cloud sync or paid infrastructure was activated. A support link needs the owner's actual destination. Browser calculations remove the need for a calculation server; free hosting availability and platform terms are not guaranteed forever. The current TanStack app has not been repackaged as a standalone static-site export.

## Verification

Run `bunx vitest run src/features/laboratory/browser-astronomy.test.ts src/features/laboratory/pdf-report.test.ts src/features/laboratory/astronomy-results.test.ts src/features/laboratory/cases.test.ts src/test/app-routing.test.tsx`.

Browser tests check J2000 longitudes against recorded JPL Horizons outputs, axes against documented native Swiss fixtures, house geometry, DST gaps/folds, overnight dates, explicit durations and scan residuals. These are limited astronomy/behavior checks, not historical-method tests. Historical-method validation remains unavailable.