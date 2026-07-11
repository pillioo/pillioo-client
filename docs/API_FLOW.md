# Pillioo Frontend API Flow

This document describes the practical API call order for the frontend. It is
not a backend test plan. Use it to decide which data each screen should load,
which calls can run in parallel, and what empty states are normal.

For exact request and response contracts, check the backend API reference:

```text
../pillioo/backend/docs/api.md
```

If the live API differs from this document, follow the live API and update this
file later.

## 1. App Entry

Route:

```text
/app
```

Primary calls:

```text
GET /dashboard/summary
GET /tickets
```

Optional call:

```text
GET /events/latest
```

Recommended behavior:

- Load dashboard summary and ticket list together.
- Treat empty queues as normal, not as an error.
- Use `/tickets` for the actual case inbox.
- Use `/dashboard/summary` for compact operational indicators only.
- Do not make `/events/collect` part of the normal user flow.

Useful ticket list filters:

```text
GET /tickets?status=REVIEW_ROUTED
GET /tickets?review_type=final_approval
GET /tickets?priority=HIGH
GET /tickets?q=midazolam
GET /tickets?recall_number=D-0277-2024
```

## 2. Open A Ticket

Route:

```text
/app/tickets/:ticketId
```

Primary call:

```text
GET /tickets/{ticket_id}
```

After the ticket detail loads, fetch secondary panels:

```text
GET /tickets/{ticket_id}/evidence
GET /inventory/impact/{ticket_id}
GET /reports/{ticket_id}
GET /audit/{ticket_id}
```

Recommended behavior:

- Load secondary panels independently so one failing panel does not blank the
  entire workspace.
- Show partial data when possible.
- Keep raw evidence trace and audit JSON behind collapsible details.
- Use public `ticket_id` values such as `T-...` in routes.

## 3. Run Or Resume Workflow

Action:

```text
POST /tickets/{ticket_id}/run
```

After success, refresh:

```text
GET /tickets/{ticket_id}
GET /tickets/{ticket_id}/evidence
GET /inventory/impact/{ticket_id}
GET /reports/{ticket_id}
GET /audit/{ticket_id}
GET /dashboard/summary
GET /tickets
```

Recommended behavior:

- Show this action only when the ticket state supports workflow execution.
- Treat workflow failures as ticket states that need inspection, not as frontend
  crashes.
- If the backend returns a Milvus/OpenAI configuration error, show a clear
  integration error state.

## 4. Evidence Panel

Call:

```text
GET /tickets/{ticket_id}/evidence
```

Display priority:

1. `evidence_status`
2. `coverage_score`
3. `citations_ready`
4. `required_sources`
5. `found_sources`
6. `missing_sources`
7. `weak_sources`
8. `failure_reasons`
9. `selected_chunks`
10. `retrieval_trace`

Chunk fields worth showing:

```text
document_type
section
source_path
similarity_score
rank_score
rank_reasons
filter_level
matched_identifiers
lexical_overlap_score
lexical_overlap_terms
```

Recommended behavior:

- Make insufficient evidence visible and specific.
- Show identifier matches before raw scores.
- Treat `fallback_penalty` as a warning.
- A section-level match with no identifiers should look weaker than a strong
  identifier match.

## 5. Report Panel

Call:

```text
GET /reports/{ticket_id}
```

Optional call:

```text
GET /reports/{ticket_id}/versions
```

Recommended behavior:

- Prefer structured report fields when present.
- Fall back to legacy `report_text` or flattened draft text only when needed.
- Show version state clearly: `draft_v1`, `draft_v2`, or `final_v1`.
- Do not imply `final_v1` was newly generated; it is the approved frozen draft.

## 6. Pharmacist Review

Route:

```text
/app/tickets/:ticketId/review
```

Initial calls:

```text
GET /tickets/{ticket_id}/review
GET /reports/{ticket_id}
GET /tickets/{ticket_id}/evidence
```

Decision actions:

```text
POST /approval/{ticket_id}/approve
POST /approval/{ticket_id}/reject
POST /approval/{ticket_id}/revise
POST /approval/{ticket_id}/revise-with-llm
```

After any decision action, refresh:

```text
GET /tickets/{ticket_id}
GET /reports/{ticket_id}
GET /reports/{ticket_id}/versions
GET /audit/{ticket_id}
GET /dashboard/summary
GET /tickets
```

Recommended behavior:

- Keep report and evidence visible together on desktop.
- Require visible reviewer intent for approve/reject/revise actions.
- Make already approved or rejected reviews read-only.
- Do not treat chat output as an approval decision.

## 7. Ticket Chat

Initial message:

```text
POST /chat/{ticket_id}
```

Follow-up messages:

```text
POST /chat/{ticket_id}
```

Use the returned `session_id` in follow-up requests.

Recommended behavior:

- Keep chat scoped to one ticket.
- Preserve citations and retrieved sources.
- Show retrieval failures differently from normal no-answer responses.
- Use chat as a review aid, not as a final decision surface.

## 8. Admin Event Flows

Manual event creation:

```text
POST /events/upload
```

Manual source collection:

```text
POST /events/collect
```

Event feed:

```text
GET /events/latest
```

Recommended behavior:

- These are secondary/admin flows for the MVP.
- The main user journey should start from `/app` and `/tickets`.
- `tickets_created=0` from `/events/collect` can be normal when collected
  events are duplicates or do not create new tickets.
- After upload or collection, refresh `/tickets` and `/dashboard/summary`.

## 9. Error And Empty State Rules

Normal empty states:

- no pending approvals
- no evidence queue items
- no inventory impact
- no recent failures
- no event feed entries
- no report yet for a newly created ticket

Error states:

- API request failed
- ticket not found
- workflow run failed
- evidence snapshot unavailable for a processed ticket
- backend dependency unavailable, such as Milvus or LLM gateway

Partial states:

- ticket detail loads but report fails
- evidence loads but audit fails
- dashboard loads but ticket list fails
- report exists but version history fails

The UI should keep useful data visible in partial states.

## 10. Suggested Development Order

1. Build a small API client layer.
2. Build `/app` with dashboard summary and ticket list.
3. Build ticket detail loading with tabs.
4. Add evidence and inventory panels.
5. Add report panel.
6. Add review actions.
7. Add chat drawer.
8. Add audit timeline.
9. Add reports archive.
10. Add admin event helpers only if needed.
