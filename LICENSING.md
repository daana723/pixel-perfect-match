# Licensing checklist

## Browser edition (2026-11-25)

The separate browser path uses Astronomy Engine 2.1.19 (MIT), `@js-temporal/polyfill` 0.5.1 (ISC), and jsPDF 4.2.1 (MIT), with notices in `public/licenses/`. No Swiss binding or data enters this browser calculation path. These library licences do not relicense the entire repository or remove obligations for the preserved Python distribution. No project-wide MIT licence is selected by this change. See [BROWSER_EDITION.md](BROWSER_EDITION.md). The Swiss checklist below continues to govern the original offline implementation.

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
Private development/testing with **pyswisseph 2.10.3.2 under AGPL-3.0 terms** is explicitly approved (2026-11-24), subject to the applicable conditions. This is not an application-wide public licence selection or distribution approval. No Professional Licence was purchased; public/external testing stays off.

## Implications if AGPL is chosen
- The AGPL network clause applies: users interacting with the service over a network must be offered its corresponding source.
- If the frontend and service form one combined work, the obligations may extend to the whole project; whether separation is sufficient needs legal advice.
- When disclosure obligations are triggered, provide the required corresponding source under AGPL-compatible terms; private modification alone does not mean universal publication to everyone. Astrodienst's notice expressly describes a whole-project AGPL/compatible requirement, so separation must not be assumed sufficient.

## Implications if the Professional Licence is chosen
- Closed-source and commercial distribution become possible under the agreement's scope.
- Fee and scope are set by Astrodienst; the agreement must be in hand before public activation.

## Current permitted boundary
Ephemeris access stays behind `SwissEphemerisAdapter` and runs only in an offline local CLI. No HTTP astronomical endpoint is enabled, no ephemeris data files are committed, no external testers are invited, and no public service is activated. Binding AGPL text and the bundled Swiss notice are preserved under `calculation-service/notices/`. See [PRIVATE_TESTING.md](PRIVATE_TESTING.md) for versions, file hashes, declared dependency licences and review gates. A private repository is not a substitute for a required corresponding-source offer.
