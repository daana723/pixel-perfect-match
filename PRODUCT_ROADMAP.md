# Commercial product roadmap (planning only — nothing implemented or activated)

Direction (owner, 2026-11-24): monetised professional subscription SaaS for practising astrologers.
Preferred: proprietary + Swiss Ephemeris Professional Licence, subject to written Astrodienst confirmation.
Alternative: AGPL. **No licence selected or applied.** No LICENSE file added. Prices are hypotheses to validate with users.

## Tiers (hypotheses)
| Feature | Free | Professional | Research |
|---|---|---|---|
| Local private cases (device only) | ✓ (limited count) | ✓ unlimited | ✓ unlimited |
| JSON/CSV import/export | ✓ | ✓ | ✓ |
| Rectification runs | small monthly quota | generous quota | high quota |
| Methods | one classical variant | all classical variants | all + experimental topocentric |
| Orientations | all four (never hidden) | all four | all four |
| Candidate traces & residuals | summary | full | full + raw export |
| Chart comparison | — | ✓ | ✓ |
| Cloud sync (opt-in) | — | ✓ | ✓ |
| Source-comparison mode (Centiloquium / Ibn Ezra / Sepharial side by side) | — | — | ✓ |
| Batch / parameter sweeps | — | — | ✓ |
| Premium PDF reports | — | ✓ | ✓ |
| Support | community | email | priority |

Integrity rule applies to all tiers: no tier gets "confidence" claims or simulated results.

## Future architecture (planned, not built)
- **Auth:** Lovable Cloud accounts; local-only mode remains available without an account.
- **Entitlements:** server-side table (user → tier, limits); checked in app server functions, never in the browser.
- **Usage limits:** server-side counters per billing period.
- **Calculation access:** browser → app server function (checks entitlement) → private token → calculation service. Token never reaches the browser.
- **Payments:** provider chosen after engine validation (built-in Paddle or Stripe). Not enabled.
- **Cancellation / deletion:** self-serve cancel; account deletion removes cloud data; local data stays under user control.

## Licence consequences
- **Professional (preferred):** closed source possible; own ctypes adapter avoids AGPL wrapper; no API resale to third parties; 6-year term. See COMMERCIAL_PLAN.md.
- **AGPL (fallback):** subscriptions still allowed, but full source must be offered to users; competitors may self-host.
- Architecture is identical for both; only the ephemeris adapter and licence notices change.

## Order
1. Engine (ephemeris-independent) + historical research → 2. licence decision → 3. ephemeris + validation → 4. auth/sync → 5. entitlements → 6. payments.
