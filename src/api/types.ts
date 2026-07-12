// Types mirror the backend Pydantic schemas in pillioo/backend/app/schemas.
// Kept intentionally close to the wire shape rather than remodeled, so the
// frontend stays easy to reconcile against docs/API_FLOW.md and the backend
// source when the contract changes.

export type TicketStatus =
  | 'CREATED'
  | 'INVENTORY_CHECKED'
  | 'EVIDENCE_RETRIEVED'
  | 'DRAFT_GENERATED'
  | 'SAFETY_CHECKED'
  | 'REVIEW_ROUTED'
  | 'WORKFLOW_FAILED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED'

export type Classification = 'class_i' | 'class_ii' | 'class_iii'

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

// review_type is typed as a plain string on the backend response models
// (not the ReviewType enum), so unrecognized values should degrade gracefully.
export type ReviewType =
  | 'identity_review'
  | 'evidence_review'
  | 'action_review'
  | 'final_approval'
  | 'no_impact_close'
  | (string & {})

export interface TicketListItem {
  ticket_id: string
  status: TicketStatus
  workflow_stage: string
  drug_name: string
  ndc: string
  lot: string | null
  classification: Classification | null
  recall_number: string | null
  priority: Priority | null
  review_type: ReviewType | null
  created_at: string
  // Nullable here only: the DB column has no insert-time default and is set
  // on first UPDATE. GET /tickets/{id} coalesces this to created_at instead.
  updated_at: string | null
}

export interface TicketListResponse {
  items: TicketListItem[]
  total: number
  limit: number
  offset: number
}

export interface WorkflowStepStatus {
  step: string
  status: 'pending' | 'succeeded' | 'failed' | 'skipped'
  duration_ms: number | null
  reason: string | null
  completed_at: string | null
}

export interface TicketDetail {
  ticket_id: string
  status: TicketStatus
  workflow_stage: string
  drug_name: string
  ndc: string
  lot: string | null
  classification: Classification | null
  recall_number: string | null
  priority: Priority | null
  review_type: ReviewType | null
  created_at: string
  updated_at: string
  can_rerun: boolean
  failure_reason: string | null
  steps: WorkflowStepStatus[]
}

export type EvidenceStatus = 'sufficient' | 'insufficient'

export interface EvidenceSnapshot {
  evidence_status: EvidenceStatus
  coverage_score: number | null
  citations_ready: boolean | null
  required_sources: string[]
  found_sources: string[]
  missing_sources: string[]
  weak_sources: string[]
  failure_reasons: string[]
}

export interface InventoryImpactUnmatched {
  ticket_id: string
  matched: false
  message: string
}

// Note: the matched-case response has no root-level `matched` field at all —
// only `match_result.matched` — unlike the unmatched case, which does. Use
// isInventoryMatched() below to narrow instead of reading `.matched` directly.
export interface InventoryImpactMatched {
  ticket_id: string
  match_result: {
    matched: boolean
    match_type: 'exact_ndc_match' | 'fuzzy_name_match' | 'no_match'
    match_confidence: number
    needs_identity_review: boolean
  }
  impact_result: {
    affected_departments: string[]
    department_breakdown: Record<string, number>
    total_quantity: number
    priority: Priority
    urgent: boolean
    urgent_reason: string
  }
  quality_result: {
    confidence: number
    flags: string[]
    review_required: boolean
  }
}

export type InventoryImpact = InventoryImpactMatched | InventoryImpactUnmatched

export function isInventoryMatched(inventory: InventoryImpact): inventory is InventoryImpactMatched {
  return 'match_result' in inventory
}

export type ReportVersionTag = 'draft_v1' | 'draft_v2' | 'final_v1'

export interface DraftCitation {
  source: string
  section: string
  score: number
  sentence: string
}

export interface DraftAffectedProduct {
  drug_name: string
  ndc: string | null
  lot: string | null
  // Plain string on the backend (DraftReport.AffectedProduct), not the
  // strict Classification union used elsewhere — values usually overlap.
  classification: string | null
}

export interface DraftInventoryImpact {
  matched: boolean
  affected_departments: string[]
  total_quantity: number
  priority: string | null
  uncertainty: string | null
}

export interface DraftEvidenceSummary {
  coverage_score: number
  found_sources: string[]
  missing_sources: string[]
  key_findings: string[]
}

// Structured report body (DraftReport on the backend). Present on `.report`
// when the version was generated with structured output; legacy rows may
// have this as null with only `report_text` populated.
export interface DraftReport {
  title: string
  summary: string
  affected_product: DraftAffectedProduct
  event_classification: string | null
  inventory_impact: DraftInventoryImpact
  evidence_summary: DraftEvidenceSummary
  recommended_review_action: string
  pharmacist_checklist: string[]
  citations: DraftCitation[]
  pharmacist_notes: string[]
  safety_notes: string[]
  limitations: string[]
}

// Response shape for GET /reports/{ticket_id} and /reports/{ticket_id}/versions.
// Note: `ticket_id` here is the internal numeric FK, not the public "T-..."
// id used in routes — use the ticketId you already have instead.
export interface ReportVersion {
  id: number
  ticket_id: number
  version_tag: ReportVersionTag
  report_text: string
  report: DraftReport | null
  created_by: string | null
  change_summary: string | null
  change_reason: string | null
  reviewer_comment: string | null
  approved_by: string | null
  approved_at: string | null
  approval_comment: string | null
  source_version: string | null
  created_at: string
  updated_at: string | null
}

export interface TicketListFilters {
  status?: TicketStatus
  review_type?: string
  priority?: Priority
  recall_number?: string
  q?: string
  limit?: number
  offset?: number
}
