# Privacy and user control

## Current delivery
Case data is stored in IndexedDB in the current browser under a dedicated local database. It is not sent to a calculation service, cloud storage, third-party astrology API, or AI service. No account, analytics for birth inputs, or synchronization is implemented.

A local browser profile is not a security boundary between people sharing an unlocked device. IndexedDB records are not application-encrypted. Protect the device and browser profile; do not describe local storage as end-to-end encrypted.

External Google Fonts requests may occur to load typography; they carry ordinary network metadata, not case records. The only astronomical illustration is a local schematic with no planetary positions.

## Controls
- Create and edit records without signing in.
- Duplicate a case; delete after confirmation.
- Export a versioned JSON archive and import it using new IDs. CSV exports contain user input and are protected against spreadsheet formula interpretation.
- Invalid archives are rejected before storage. An import is atomic for its batch.
- Exported files contain sensitive birth records in plain text. Store and share them responsibly.

Clearing browser/site data, using private browsing, losing a device, or changing browser profiles can lose the archive. Export backups. Deleting a case does not delete downloaded backups. No application server currently retains these records.

## Future explicit opt-in cloud synchronization
Requires an activation action, account identity, private per-user grants/policies, conflict resolution, deletion propagation, export/retention controls and a documented data-flow review. Ask whether profile data is required before implementing authentication. Never store private birth information in public-readable tables. No cloud infrastructure is enabled in this stage.

## Future calculation service
Only transmit case data with explicit user action to a configured authenticated service over HTTPS. Disable request-body logging, establish retention/deletion, own job authorization, rate limits, and secret management before production. None of these unimplemented service controls are claimed as current features.
