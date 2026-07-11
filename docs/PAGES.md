# Pillioo Pages

This document defines the recommended page structure for the Pillioo frontend.
It is written as an implementation guide for Claude Code or another coding
agent. Treat the layouts as information architecture, not pixel-perfect
wireframes.

Pillioo should feel like a focused healthcare operations workspace. The main
job is to help a pharmacist or operations user scan drug safety cases, inspect
evidence, review generated reports, and make approval decisions with clear
source context.

## Route Summary

```text
/                                  Product Entrance
/app                               Safety Inbox
/app/tickets/:ticketId             Ticket Workspace
/app/tickets/:ticketId/review      Pharmacist Review
/app/reports                       Reports Archive
```

Chat should open inside the Ticket Workspace as a contextual drawer or split
panel. It should not be a primary top-level route in the MVP.

## Global Application Shell

Use one application shell for all `/app/*` routes.

Desktop layout:

```text
+------------------------------------------------------------------+
| Sidebar        | Main content                                    |
|                |                                                |
| pillioo        | Page header / controls                         |
| Inbox          |                                                |
| Reviews        | Route content                                  |
| Reports        |                                                |
|                |                                                |
+------------------------------------------------------------------+
```

Mobile layout:

```text
+--------------------------------------------------+
| Top bar: pillioo / menu / current page           |
+--------------------------------------------------+
| Route content                                    |
+--------------------------------------------------+
```

Global shell rules:

- Use public `ticket_id` values in routes and visible UI.
- Do not expose internal numeric IDs unless explicitly needed for debugging.
- Keep navigation quiet and work-focused.
- Do not add unsupported export, upload, scheduling, or bulk action features.
- Use `docs/DESIGN.md` for color, typography, spacing, and component rules.

## 1. Product Entrance

Route:

```text
/
```

Purpose:

Introduce Pillioo and provide a calm entrance into the app. This page should be
short and product-focused, not a long marketing site.

Recommended structure:

```text
+------------------------------------------------------------------+
| pillioo                                      How it works Enter   |
+------------------------------------------------------------------+
|                                                                  |
| From drug safety signals                                         |
| to pharmacist-ready decisions.                                   |
|                                                                  |
| Pillioo connects recall events, inventory impact, evidence,      |
| and review workflows into a clear decision workspace.            |
|                                                                  |
| [ Enter Pillioo ]   [ Explore workflow ]                         |
|                                                                  |
| +------------------------------------------------------------+   |
| | Safety Inbox Preview                                      |   |
| | Dexamethasone Recall       Review required                |   |
| | Midazolam Shortage         Processing                     |   |
| | Sodium Chloride Update     Complete                       |   |
| +------------------------------------------------------------+   |
|                                                                  |
+------------------------------------------------------------------+
```

Sections:

1. Navigation
2. Hero
3. Safety Inbox preview
4. Three-step workflow: Detect -> Analyze -> Review
5. Final CTA

Rules:

- Primary CTA `Enter Pillioo` navigates to `/app`.
- Secondary CTA scrolls to the workflow section.
- Do not show dashboard metrics on the landing page.
- Do not add charts, pricing, testimonials, or long marketing sections.
- The Safety Inbox preview should visually resemble the real `/app` screen.

## 2. Safety Inbox

Route:

```text
/app
```

Purpose:

Provide the main working entry point after the user enters Pillioo. This page is
a case inbox, not a chart-heavy dashboard.

Primary APIs:

- `GET /dashboard/summary`
- `GET /tickets`
- `GET /events/latest` if an event-feed strip is useful

Desktop layout:

```text
+--------------------------------------------------------------------------+
| Sidebar | Safety Inbox                                  | Selected Case  |
|         |                                                |                |
| Inbox   | [ Search cases... ]   [All] [Needs review]    | Drug name      |
| Reviews |                         [Processing] [Done]   | Ticket ID      |
| Reports |                                                | Status badges  |
|         | +------------------------------------------+   |                |
|         | | Dexamethasone Recall                     |   | Evidence       |
|         | | T-...  Review required  High             |   | Inventory      |
|         | +------------------------------------------+   | Next step      |
|         | | Midazolam Recall                         |   |                |
|         | | T-...  Final approval  High              |   | [Open case]    |
|         | +------------------------------------------+   |                |
+--------------------------------------------------------------------------+
```

Recommended content:

- Small operational summary strip from `/dashboard/summary`
- Search field using `GET /tickets?q=...`
- Filters mapped to supported backend query params
- Ticket list with status, review type, priority, and created/updated time
- Selected case preview with evidence, inventory, approval, and next action

Case row priority:

1. Drug name
2. Event/review type
3. Workflow or review state
4. Public ticket ID
5. Priority
6. Last created/updated time

Suggested filters:

```text
All
Needs review
Final approval
High priority
Failed
Approved
```

Map filters to actual API fields where possible:

- `status`
- `review_type`
- `priority`
- `q`
- `recall_number`

Required states:

- loading
- empty inbox
- no search results
- partial API failure
- complete API failure
- selected case unavailable

Do not add:

- unsupported create-ticket actions
- file upload
- unsupported event collection controls
- fake severity scores
- decorative charts that do not map to API data

## 3. Ticket Workspace

Route:

```text
/app/tickets/:ticketId
```

Purpose:

Provide the central working space for one drug safety case. The user should not
need to jump between many separate pages to understand a ticket.

Primary APIs:

- `GET /tickets/{ticket_id}`
- `GET /tickets/{ticket_id}/evidence`
- `GET /inventory/impact/{ticket_id}`
- `GET /reports/{ticket_id}`
- `GET /audit/{ticket_id}`
- `POST /chat/{ticket_id}`

Desktop layout:

```text
+--------------------------------------------------------------------------------+
| Sidebar | Ticket Workspace                                      | Case Context  |
|         |                                                       |               |
| Inbox   | Dexamethasone Injection Recall                         | Workflow      |
| Reviews | T-...                                                  | Review ready  |
| Reports | [Recall] [High] [Review required]                      |               |
|         |                                                       | Evidence      |
|         | [Overview] [Inventory] [Evidence] [Report] [History]   | Sufficient    |
|         |                                                       |               |
|         | +---------------------------------------------------+ | Inventory     |
|         | | Active tab content                                | | No match      |
|         | +---------------------------------------------------+ |               |
|         |                                                       | Approval      |
|         |                                                       | Pending       |
|         |                                                       |               |
|         |                                                       | [Start Review]|
|         |                                                       | [Ask Pillioo] |
+--------------------------------------------------------------------------------+
```

Header should show:

- drug name
- public ticket ID
- event type or classification
- most important current state
- short recall/source context

Do not overload the header with many equal-weight badges.

Recommended tabs:

```text
Overview
Inventory
Evidence
Report
History
```

Right context rail:

- workflow stage
- evidence sufficiency
- inventory impact summary
- approval/review state
- primary next action
- Ask Pillioo action

On smaller screens, move the context rail above the tabs.

### Overview Tab

Show a compact case summary:

- event summary
- affected product
- inventory impact summary
- evidence readiness summary
- latest report/draft preview
- recommended next step

Avoid duplicating every detail from other tabs.

### Inventory Tab

Use `GET /inventory/impact/{ticket_id}`.

Show:

- match state
- product/NDC/lot
- match type when available
- affected departments or rows when available
- quality result
- clear empty state when no inventory match exists

### Evidence Tab

Use `GET /tickets/{ticket_id}/evidence`.

Evidence should appear as inspectable source cards:

```text
+--------------------------------------------------------------+
| Recall Notice                                      Matched    |
| source path / section                                        |
| matched identifiers: recall_number, lot                      |
| rank reasons: recall_number_match, lot_match                 |
|                                                              |
| Short supporting excerpt                                     |
| [View details]                                               |
+--------------------------------------------------------------+
```

Show:

- evidence status
- required/found/missing/weak sources
- source type
- source path
- section
- filter level
- matched identifiers
- rank reasons
- excerpt
- citation score

Important display rules:

- Missing evidence should be explicit, not hidden as an empty list.
- `fallback_penalty` should appear as a warning.
- `filter_level=section` with empty `matched_identifiers` should look weaker
  than `strong_identifier_section`.
- Put raw retrieval trace in a collapsible debug section.

### Report Tab

Use `GET /reports/{ticket_id}`.

Show:

- latest draft or final report
- report version tag
- approval state
- structured report sections when available
- report text fallback for legacy rows
- citations

This tab is for reading. The focused decision action should open the Pharmacist
Review page.

### History Tab

Use `GET /audit/{ticket_id}`.

Show a chronological activity stream:

- ticket created
- workflow started
- inventory result saved
- evidence retrieved
- evidence marked insufficient
- draft generated
- review started
- approved or rejected
- report version created

Use audit `title`, `message`, `severity`, and `status` for the timeline. Put raw
JSON in an expandable details area.

### Ask Pillioo

Chat should open from the Ticket Workspace.

Recommended desktop behavior:

```text
+-------------------------------------+------------------------------+
| Ticket Workspace                     | Ask Pillioo                  |
| Current ticket content remains       | Conversation scoped to T-... |
| visible while chat is open.          | Sources remain inspectable.  |
|                                     | [ Ask about this case... ]   |
+-------------------------------------+------------------------------+
```

Chat may open as:

- side panel
- drawer
- split view

On mobile, it may become a full-screen view.

Chat rules:

- Keep chat scoped to the selected ticket.
- Preserve `session_id` for multi-turn follow-up questions.
- Keep citations inspectable.
- Retrieval failure should not look like a normal no-answer response.
- Chat supports review work; it does not replace pharmacist approval.

Required workspace states:

- loading
- ticket not found
- partial data
- workflow failed
- evidence unavailable
- report unavailable
- review unavailable
- success

## 4. Pharmacist Review

Route:

```text
/app/tickets/:ticketId/review
```

Purpose:

Provide a focused decision workspace where the pharmacist compares the generated
draft/report with supporting evidence before approving, rejecting, or revising.

Primary APIs:

- `GET /tickets/{ticket_id}/review`
- `GET /reports/{ticket_id}`
- `GET /tickets/{ticket_id}/evidence`
- `POST /approval/{ticket_id}/approve`
- `POST /approval/{ticket_id}/reject`
- `POST /approval/{ticket_id}/revise`
- `POST /approval/{ticket_id}/revise-with-llm`

Desktop layout:

```text
+--------------------------------------------------------------------------+
| Back to Workspace                                      Pharmacist Review  |
| Dexamethasone Injection Recall - T-...                                    |
+----------------------------------------+---------------------------------+
| Draft / Report                         | Supporting Evidence             |
|                                        |                                 |
| Summary                                | Recall Notice                   |
| Recommended Review Action              | source / section / identifiers  |
| Pharmacist Checklist                   |                                 |
| Safety Notes                           | Internal Policy                 |
| Limitations                            | missing or matched state        |
+----------------------------------------+---------------------------------+
| Reviewer Notes                                                           |
| [ textarea ]                                                             |
|                                                        [Reject] [Approve] |
+--------------------------------------------------------------------------+
```

Required information:

- public ticket ID
- drug name
- event or recall information
- report/draft summary
- recommended action
- safety notes
- evidence sufficiency
- supporting evidence
- citation source and section
- reviewer notes
- current approval state

Review principles:

- Draft/report and evidence should remain visible together on desktop.
- Minimize unrelated navigation.
- Label AI content as a draft, recommendation, or generated assistance.
- Approval and rejection must be visually explicit.
- Already decided reviews should become read-only.
- Do not imply that AI made the final decision.

Required states:

- loading
- review not ready
- evidence insufficient
- already approved
- already rejected
- submit in progress
- submit failed
- success

## 5. Reports Archive

Route:

```text
/app/reports
```

Purpose:

Provide a searchable archive of generated reports and their decision state. This
is a secondary destination, not the main working screen.

Primary APIs:

- `GET /tickets`
- `GET /reports/{ticket_id}`
- `GET /reports/{ticket_id}/versions`

Recommended layout:

```text
+------------------------------------------------------------------+
| Sidebar | Reports                                                |
|         | [ Search by drug or ticket... ]                        |
|         | [All] [Draft] [Approved] [Rejected]                    |
|         |                                                        |
|         | +--------------------------------------------------+   |
|         | | Dexamethasone Injection                         |   |
|         | | T-...  final_v1  Approved                       |   |
|         | +--------------------------------------------------+   |
|         | | Midazolam Injection                             |   |
|         | | T-...  draft_v1  Awaiting review                |   |
|         | +--------------------------------------------------+   |
+------------------------------------------------------------------+
```

Required information:

- public ticket ID
- drug name
- report state
- approval state
- latest version
- created or updated time
- reviewer when supported

Report detail may open as:

- a full page
- a panel
- the Report tab inside the Ticket Workspace

Only show fields supported by the backend.

Required states:

- loading
- empty archive
- no search results
- report not found
- partial data
- success

Rules:

- Do not add export or download unless supported.
- Report state and approval state are separate concepts.
- Version history should remain understandable.
- Avoid duplicating the entire Ticket Workspace.

## Navigation Rules

Public navigation:

```text
pillioo
How it works
Enter App
```

Application navigation:

```text
Inbox
Reviews
Reports
```

The `Reviews` item may open the Safety Inbox with a review-oriented filter:

```text
/app?filter=needs-review
```

This avoids creating another list page that duplicates the same case
information. Use a separate review list only if the implementation genuinely
requires it.

Do not make Chat a permanent top-level navigation item in the MVP. Prefer:

```text
Ticket Workspace -> Ask Pillioo
```

## Final Page Count

Recommended main surfaces:

```text
1. Product Entrance
2. Safety Inbox
3. Ticket Workspace
4. Pharmacist Review
5. Reports Archive
```

Chat is a contextual Ticket Workspace panel. Reviews may reuse the Safety Inbox
with a review filter.

## Implementation Guidance

Before implementation:

1. Inspect the existing frontend router.
2. Inspect existing pages and reusable components.
3. Inspect the frontend API client and hooks.
4. Inspect the backend OpenAPI schema.
5. Identify which fields and actions actually exist.
6. Preserve working routes where possible.

Existing routes and API contracts take priority over example names in this
document.

Follow `docs/DESIGN.md` as the visual starting point.

The final interface should remain:

- light
- calm
- low-saturation
- navy-led
- information-rich but readable
- suitable for pharmacist review work

Additional colors, component variants, and layout adjustments may be introduced
when they improve accessibility, hierarchy, or usability.

Do not add unsupported features only to complete the wireframes.
