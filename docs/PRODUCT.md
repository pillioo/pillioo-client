# Pillioo Product Overview

Pillioo is a pharmacist-centered workspace for reviewing drug safety events.
It helps users understand recalls, shortages, inventory impact, supporting
evidence, AI-generated reports, and approval decisions in one workflow.

The product is not a consumer health app and not a generic analytics dashboard.
It should feel like a focused clinical operations tool for pharmacists and
pharmacy operations teams.

## Primary User

The primary user is a pharmacist reviewing drug recalls, shortages, inventory
impact, evidence quality, and AI-generated report drafts.

The pharmacist needs to decide whether the available information is sufficient,
whether the AI-generated report is safe to approve, and whether the ticket
requires revision or rejection.

## Secondary Users

Pharmacy operations users may use Pillioo to monitor cases, inspect workflow
status, and identify tickets that need pharmacist attention.

Developers or debugging users may inspect evidence traces, audit logs, and API
responses during local testing. Debugging needs should be supported, but they
should not dominate the main pharmacist experience.

## Main Goals

The frontend should help users quickly understand:

- what event occurred
- which drug or product is affected
- which NDC, lot, or recall number is relevant
- whether inventory may be impacted
- whether sufficient evidence was found
- which sources support the workflow decision
- what action the AI report recommends
- whether pharmacist review is required
- whether the report was approved, rejected, revised, or finalized

## Core Workflow

The main product flow is:

```text
Event
-> Ticket
-> Inventory impact
-> Evidence retrieval
-> Evidence sufficiency check
-> AI-generated draft report
-> Pharmacist review
-> Approval, rejection, or revision
-> Final report version
```

The UI should keep this workflow visible enough that users can tell where a
ticket is, what happened, and what action is still available.

## Core Screens

### Product Entrance

Introduce Pillioo briefly and route users into the working app.

This page should be short and product-focused. It should not become a long
marketing site.

### Safety Inbox

Show the user's main queue of cases.

The inbox should make it easy to scan:

- recent tickets
- pending reviews
- workflow status
- high-priority cases
- evidence insufficiency
- approved or completed tickets

The inbox is a case workspace, not a chart-heavy dashboard.

### Ticket Detail

Show one ticket in context.

The ticket detail should include:

- recall or event information
- drug and product information
- NDC, lot, classification, and recall number when available
- inventory impact
- evidence status and sources
- workflow state
- report draft or final report
- approval and audit history

### Pharmacist Review

Help the pharmacist compare the AI-generated report with supporting evidence
before making a decision.

The review screen should support:

- reading the AI report or draft
- inspecting supporting evidence
- checking citations and source context
- reviewing recommended actions
- approving the report
- rejecting the report
- submitting or requesting revision

### Chat

Allow ticket-scoped questions about:

- recall details
- affected inventory
- supporting evidence
- recommended action
- workflow state
- report content

Chat is a helper inside the ticket workflow. It should not replace pharmacist
review or approval.

### Reports Archive

Provide a secondary place to find generated reports and their version state.

The archive should help users distinguish draft reports from approved final
reports.

## Product Principles

### AI Is Assistance, Not Authority

AI output must be presented as assistance, not as a final medical or operational
decision.

The pharmacist's approval, rejection, or revision is the decision.

### Evidence Must Be Inspectable

Evidence sources should be easy to inspect. Users should be able to see why a
source was selected, whether identifiers matched, and whether evidence was weak
or missing.

Important evidence problems should not be hidden behind raw JSON or collapsed
debug panels only.

### Workflow Failures Should Be Understandable

If a workflow step fails, the UI should show what failed and where the user can
inspect more detail.

Failures should not look like empty data.

### Empty States Are Normal

During local testing or early use, many queues may be empty:

- no pending approvals
- no evidence review tickets
- no inventory impact
- no recent failures
- no reports yet

The UI should explain empty states without treating them as errors.

### Show Supported Actions Only

Do not add actions that the backend does not support.

Avoid unsupported:

- bulk approval
- manual quarantine
- export or download
- scheduler controls
- medication substitution actions
- final medical instructions generated only by the frontend

### Keep Important Information Visible

Important medical and operational information should not be hidden behind
decorative UI.

The interface should prioritize clarity, source context, and decision state over
visual decoration.

## Product Tone

Pillioo should feel:

- calm
- clinical
- precise
- trustworthy
- operational
- evidence-aware

It should not feel:

- playful
- consumer-health oriented
- overly decorative
- chart-first
- AI-magical
- like a generic admin template

## MVP Boundary

The MVP should focus on:

- case inbox
- ticket detail
- evidence inspection
- inventory impact summary
- report reading
- pharmacist approval workflow
- ticket-scoped chat
- audit visibility

Advanced analytics, user management, notifications, export/download, and bulk
operations can come later.
