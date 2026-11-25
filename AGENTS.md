<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Keep separate TanStack content routes within the shared laboratory shell so each navigation view has an address and its own metadata.
- Access Dexie only after hydration or in user event handlers; local case data must not enter SSR or network requests.
- Validate saved and imported case records with the shared Zod schema; imports create new IDs instead of overwriting existing cases.
- Keep the independent Python service under `calculation-service/`, outside the frontend import graph; isolate native Swiss Ephemeris access in its adapter.
- Return explicit unavailable states for unfinished calculation engines; never seed simulated astronomical results.
- Keep the original Swiss astronomy offline and isolated; the browser edition uses a dynamically imported Astronomy Engine adapter with explicit geocentric/E/W limitations, avoiding private-data network transmission and public AGPL service activation.
- Use the ephemeris port for civil-chart and experimental-search orchestration; isolate native flags, files and mutable settings in the adapter so a binding replacement does not change consumers.
- Keep calculation imports in a session-scoped results provider and validate them against the result schema; navigation retains selections without persisting or transmitting private results.
- Keep browser results distinct from validated Swiss imports in session memory; never fabricate Swiss settings or hashes for the browser model.
- Generate research PDFs locally from result data, with a prepared-download step to preserve mobile download activation and explicit experimental/source limitations.
- Load the attributed static GeoNames city directory on user focus and search only in the browser; keep manual coordinates/timezone overrides because city centres and modern zone identifiers are not exact historical birth locations.
- Normalize typed civil times in the shared case schema and convert approximate week inputs to explicitly marked duration assumptions; this preserves local-time intent and uncertainty across saves, calculations and reports without inventing LMP/conception rules.
- Share browser-safe zodiac, house membership and timezone presentation helpers between result views and PDFs; round display values only, preserving full coordinates and explicit distinction between selected times, experimental fits and verified rectification.
