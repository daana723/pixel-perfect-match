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
