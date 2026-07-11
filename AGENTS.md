# Pillioo Frontend Agent Guide

This repository contains the Pillioo frontend. Pillioo is a healthcare
operations workspace for reviewing drug safety cases, evidence, inventory
impact, AI-assisted report drafts, and pharmacist approval decisions.

The goal is not to build a generic dashboard or a decorative landing page. Build
a useful product workspace that can connect to the real backend API.

## Read These First

Frontend product docs in this repository:

1. `docs/PRODUCT.md`
   - Product purpose, user roles, workflow, MVP boundaries, and API priorities.
2. `docs/PAGES.md`
   - Recommended routes, screen structure, layout intent, and required states.
3. `docs/DESIGN.md`
   - Visual system, colors, typography, spacing, component principles, and responsive behavior.
4. `docs/API_FLOW.md`
   - Frontend-oriented API call order, refresh behavior, and normal empty states.

Backend reference docs are optional and should be used only when they are
directly relevant to the task:

1. `../pillioo/backend/docs/api.md`
   - Main frontend API reference and frontend implementation notes.

Do not read every backend document by default. Start from the frontend docs and
the actual frontend code. Use backend docs only to clarify API contracts,
request/response shapes, or endpoint behavior. If something still conflicts,
inspect the live backend response or Swagger output and adapt the frontend to
that contract.

## Product Flow

The main workflow is:

```text
Event detection
-> Ticket creation
-> Inventory impact analysis
-> Evidence retrieval
-> Sufficiency check
-> Structured report draft
-> Pharmacist review
-> Approval, rejection, or revision
-> Final report version
```

Recommended frontend surfaces:

```text
/                                  Product Entrance
/app                               Safety Inbox
/app/tickets/:ticketId             Ticket Workspace
/app/tickets/:ticketId/review      Pharmacist Review
/app/reports                       Reports Archive
```

Chat should usually be contextual inside the Ticket Workspace, not a permanent
top-level navigation item.

## Design Direction

Build a calm, professional healthcare B2B workspace.

The interface should feel:

- trustworthy
- clinical
- modern
- clean
- information-rich but readable
- suitable for pharmacists reviewing operational and medical information

Use a light off-white canvas with navy as the main visual anchor and muted teal
for evidence/retrieval contexts.

Avoid:

- overly dark developer-tool aesthetics
- overly saturated colors
- playful consumer-app styling
- decorative gradients
- excessive card shadows
- fake analytics that do not map to backend data
- unsupported upload, export, download, or bulk actions

## Flexibility And Judgment

The docs are guidance, not a prison.

Use judgment when implementation details differ from the documents:

- Existing working code and actual API contracts take priority over examples in docs.
- If the backend shape differs from the docs, adapt the frontend to the backend and leave a clear note.
- If a documented layout does not work responsively, adjust it while preserving the product intent.
- If a design token is missing, derive a nearby value that keeps the same visual tone.
- If an endpoint is unavailable during local development, use a small, clearly isolated mock fallback.
- Do not block implementation on perfect data coverage. Build useful loading, empty, partial, and error states.

Keep the product useful and coherent rather than mechanically copying every
wireframe line.

## API Implementation Guidance

Prioritize these backend APIs:

```text
GET  /dashboard/summary
GET  /tickets
GET  /tickets/{ticket_id}
POST /tickets/{ticket_id}/run
GET  /tickets/{ticket_id}/evidence
GET  /inventory/impact/{ticket_id}
GET  /reports/{ticket_id}
GET  /tickets/{ticket_id}/review
POST /chat/{ticket_id}
GET  /audit/{ticket_id}
POST /approval/{ticket_id}/approve
POST /approval/{ticket_id}/reject
POST /approval/{ticket_id}/revise
POST /approval/{ticket_id}/revise-with-llm
```

Secondary/admin-oriented APIs:

```text
POST /events/upload
POST /events/collect
GET  /events/latest
GET  /reports/{ticket_id}/versions
GET  /tickets/{ticket_id}/evidence-trace
```

Use public `ticket_id` values such as `T-...` in routes and visible UI.
Internal numeric IDs should only appear in debug contexts when needed.

## Important UI Semantics

Evidence:

- Show `evidence_status`, `weak_sources`, and `failure_reasons` before raw chunks.
- Show matched identifiers and rank reasons when available.
- Treat `fallback_penalty` as a warning.
- Distinguish missing evidence from an empty list.

Reports:

- Prefer structured `report` when present.
- Fall back to `report_text` for legacy rows.
- Treat `draft_v1`, `draft_v2`, and `final_v1` as separate version states.
- Make it clear that `final_v1` is a frozen approved draft, not a new LLM generation.

Approval:

- `/approval/pending` may be empty even when final-approval tickets exist.
- Consider using ticket filters for approval queues if needed.
- Already approved or rejected reviews should become read-only.

Chat:

- Keep chat scoped to one ticket.
- Reuse `session_id` for follow-up turns.
- Keep citations inspectable.
- Do not present chat as a replacement for pharmacist review.

Dashboard:

- Empty queues are normal.
- `inventory_impact.impacted_count=0` can be a valid state.
- `today_created` uses the server date.
- Do not infer unsupported operational states on the frontend.

## Implementation Standards

Before major implementation:

1. Inspect existing routes, components, CSS, and package dependencies.
2. Add or update a small API client layer before scattering fetch calls.
3. Keep reusable UI components small and domain-named.
4. Model loading, empty, partial, and error states for every page.
5. Keep raw backend/debug data behind details drawers when possible.
6. Prefer real API integration over static screens, but isolate mock fallback data if needed.
7. Run the available checks before finishing.

Recommended reusable components:

- `AppShell`
- `Sidebar`
- `TopBar`
- `TicketList`
- `TicketPreview`
- `StatusBadge`
- `MetricTile`
- `EvidenceCard`
- `ReportViewer`
- `ChatDrawer`
- `Timeline`
- `ReviewActionBar`

## Local Development Notes

This is a Vite/React app. Use the scripts from `package.json`.

Common commands:

```powershell
npm run dev
npm run build
npm run lint
```

The backend may require Postgres, Milvus, OpenAI-compatible settings, and loaded
RAG chunks for full workflow testing. If workflow or chat calls fail locally,
first check the API response and server logs. Use backend docs only when they
help explain the failing endpoint.

## Final Product Expectations

The MVP should be usable as a working prototype against the real backend.

It should provide:

- a clear product entrance
- a scannable case inbox
- a useful ticket workspace
- evidence inspection
- report reading
- pharmacist review actions
- contextual chat
- audit visibility

Do not add unsupported features only to make the UI look complete.
