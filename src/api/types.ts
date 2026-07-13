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

export interface TicketListFilters {
  status?: TicketStatus
  review_type?: string
  priority?: Priority
  recall_number?: string
  q?: string
  limit?: number
  offset?: number
}

export interface AuditLogEntry {
  ticket_id: string
  step_name: string
  input_json: Record<string, unknown>
  output_json: Record<string, unknown>
  timestamp: string
  duration_ms: number
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  status: 'succeeded' | 'failed' | 'skipped'
}

export type ReportVersionTag = 'draft_v1' | 'draft_v2' | 'final_v1'

export interface AffectedProduct {
  drug_name: string
  ndc: string | null
  lot: string | null
  classification: string | null
}

export interface InventoryImpactSummary {
  matched: boolean
  affected_departments: string[]
  total_quantity: number
  priority: Priority
  uncertainty: string | null
}

export interface EvidenceSummary {
  coverage_score: number
  found_sources: string[]
  missing_sources: string[]
  key_findings: string[]
}

export interface DraftCitation {
  source: string
  section: string
  score: number
  sentence: string
}

export interface DraftReport {
  title: string
  summary: string
  affected_product: AffectedProduct
  event_classification: string | null
  inventory_impact: InventoryImpactSummary
  evidence_summary: EvidenceSummary
  recommended_review_action: string
  pharmacist_checklist: string[]
  citations: DraftCitation[]
  pharmacist_notes: string[]
  safety_notes: string[]
  limitations: string[]
}

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

// answer_support_level: 'state_only' (answered from ticket state, no
// retrieval needed) | 'none' (retrieval-required but no sources found) |
// 'partial' | 'full'. Treat 'none'/'partial' as weak grounding — see
// docs/API_FLOW.md ch.7.
export type ChatAnswerSupportLevel = 'state_only' | 'none' | 'partial' | 'full' | (string & {})

export interface ChatCitation {
  source: string
  section: string
  score: number
}

// Response shape for POST /chat/{ticket_id}.
export interface ChatResponse {
  session_id: string
  answer: string
  sources: ChatCitation[]
  intent: string | null
  standalone_query: string | null
  answer_mode: string | null
  target_profile: string | null
  evidence_status: string | null
  retrieved_evidence_scope: string | null
  answer_support_level: ChatAnswerSupportLevel | null
}

// Response item shape for GET /chat/{ticket_id}/history.
export interface ChatMessage {
  ticket_id: string
  session_id: string | null
  role: 'user' | 'assistant'
  content: string
  retrieved_sources: ChatCitation[]
  created_at: string
  status: 'succeeded' | 'failed'
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

