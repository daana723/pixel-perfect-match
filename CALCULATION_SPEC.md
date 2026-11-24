# Calculation specification — planned implementation

## Current boundary
There is no astronomical calculation implementation. Browser validation checks input shape, calendar validity and IANA identifier recognition; it does not resolve historical offsets. The Python scaffold validates identifiers with `zoneinfo` but does not convert local timestamps or run Swiss Ephemeris.

## Inputs
Local birth date; earliest/latest local times; explicit IANA timezone; fold policy (reject/earlier/later); birth coordinates/altitude; uncertainty notes; explicit duration assumptions (days + hours and conception/LMP/custom convention); prenatal observer; optional known conception date; profile; tropical zodiac; house system. If latest time is earlier than earliest time, end is on the following date. Equal times are a point interval, not an implicit 24-hour interval.

The frontend preserves assumptions, not derived epochs. An LMP interval must not be silently treated as a conception interval. Known conception dates versus duration-based epochs need an explicit precedence and intraday-time rule before engine implementation.

## Planned processing
1. Validate civil inputs and supported date ranges. Resolve times with versioned IANA tzdb; reject nonexistent times; explicitly disambiguate repeated times. Check offset transitions across the complete interval, not only its endpoints.
2. Convert resolved timestamps to UTC. Calculate UT Julian Day and document time scales, delta-T, historical calendar choice and precision. Pre-Gregorian inputs require an explicit calendar policy before support is claimed.
3. Determine prenatal epoch only under the approved duration convention.
4. Configure the isolated Swiss Ephemeris adapter with licensed files and declared flags. Verify returned flags and reject undesired fallback. Set explicit topocentric observer, ensuring concurrent jobs cannot race mutable Swiss settings; prefer isolated worker processes.
5. Calculate Moon, angles, cusps and required planets. Record geocentric/topocentric choice, house system and errors.
6. For every assumption, profile and each of four orientations: coarse scan the full interval, retain both reciprocal residuals, detect local minima, refine, use continuous root-finding only for valid continuous equations, deduplicate within an explicit time tolerance without collapsing distinct orientations/assumptions.
7. Store full calculation trace and immutable reproducibility manifest. No fabricated probabilities.

## Planned reproducibility manifest
Input archive hash, original local timestamps, fold choice and UTC offsets, UTC instants, natal/prenatal Julian Days, positions and axes, two circular residuals, orientation, source/rule ID, profile, duration convention and values, observer coordinates, ephemeris flags and returned flags, file hashes, Swiss/Python/tzdb/software versions, search settings and precision.

## Search cautions
Circular wrap discontinuities require unwrapping before continuous root searches. One timestamp generally cannot independently force two scalar residuals to zero; a minimum of a declared objective is not automatically a simultaneous reciprocal root. Phase and axis constraints cannot be guessed. Do not discard alternate orientations or present a mathematical root as historical truth.

## Deployment integration plan
A future Lovable Cloud server function can verify caller and limits, forward only user-authorized case input over HTTPS with a private token, and poll job results. Do not expose token in a `VITE_` variable. No bridge or cloud connection exists in this delivery. Python runs on an independent Docker-compatible host, not the web Worker. Durable job storage, queue/workers, cancellation, rate limits and retention policies remain unimplemented.
