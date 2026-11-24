# Methodology — source approval required

## Status
Stage 1 specification, not an executable historical engine. Classical implementation is blocked until an exact author/work/edition/passage and interpretation are selected. The user explicitly chose to select the source later. No historical references or equations have been invented.

The conceptual Trutine tradition concerns reciprocal Moon–horizon relationships between birth and a prenatal epoch. That description alone is insufficient to define historical axis choices, phase rules, prenatal duration, or a complete rectification algorithm.

## Required historical rule record
Each variant must have its own ID, source citation including edition and passage, translation where appropriate, exact equations, sign convention, permitted orientations, waxing/waning conditions, prenatal epoch convention, tolerances and ambiguities. Historical variants must be separately selectable, not merged.

## Planned astronomical conventions (not a historical rule)
- Tropical ecliptic longitude in degrees, normalized to [0,360).
- Circular signed difference planned as `((a - b + 180) mod 360) - 180` with range [-180,180). This is a numerical convention, not an asserted historical formula.
- Descendant is the longitude opposite Ascendant; IC is opposite MC. House cusps must come from Swiss Ephemeris with the declared house system and an explicit handling of unsupported polar cases.
- Four exploratory pairings: natal ASC / prenatal ASC; natal ASC / prenatal DSC; natal DSC / prenatal ASC; natal DSC / prenatal DSC.
- For exploration, the two proposed residuals compare natal Moon to the selected prenatal horizon, and prenatal Moon to the selected natal horizon. Their use, sign/orientation criteria, aggregation and interpretation are **not approved historical rules** and must remain gated.
- Both residual components must be preserved. A single aggregate score must not conceal a poor reciprocal match. Aggregation choice awaits an explicit specification.

## Experimental profile
Engine B will be explicitly experimental: topocentric lunar longitude, recorded observer coordinates, separate prenatal observer, configurable axes, geocentric comparison and recorded lunar parallax assumptions. Its exact equations and horizon treatment require a separate approved specification. Do not silently topocentrically correct Engine A or assert all modern astrologers endorse Engine B.

## Interpretation
Mathematical fit, agreement between methods, and independently recorded documentary verification are distinct. Never convert residual into a probability/confidence percentage or automatically identify the true birth time. An astrologer's verification label is a manually recorded assertion, not a computed confirmation.

## Historical references
None approved or used yet. Official Swiss Ephemeris documentation is astronomical software documentation, not a historical source for the Trutine formula: https://www.astro.com/swisseph/swephinfo_e.htm
