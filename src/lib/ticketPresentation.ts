// Pure presentation helpers: label/tone mapping and derived copy for ticket
// data. Nothing here calls the network — see src/api for that.
import { isInventoryMatched } from '../api/types'
import type {
  Classification,
  EvidenceSnapshot,
  EvidenceStatus,
  InventoryImpact,
  TicketDetail,
  WorkflowStepStatus,
  TicketStatus,
} from '../api/types'

export type BadgeTone = 'warning' | 'info' | 'success' | 'danger'

interface StatusPresentation {
  label: string
  tone: BadgeTone
}

const STATUS_PRESENTATION: Record<TicketStatus, StatusPresentation> = {
  CREATED: { label: 'New', tone: 'info' },
  INVENTORY_CHECKED: { label: 'Processing', tone: 'info' },
  EVIDENCE_RETRIEVED: { label: 'Processing', tone: 'info' },
  DRAFT_GENERATED: { label: 'Processing', tone: 'info' },
  SAFETY_CHECKED: { label: 'Processing', tone: 'info' },
  REVIEW_ROUTED: { label: 'Review required', tone: 'warning' },
  WORKFLOW_FAILED: { label: 'Workflow failed', tone: 'danger' },
  APPROVED: { label: 'Approved', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  CLOSED: { label: 'Closed', tone: 'success' },
}

export function getStatusPresentation(status: TicketStatus): StatusPresentation {
  return STATUS_PRESENTATION[status] ?? { label: status, tone: 'info' }
}

const CLASSIFICATION_LABEL: Record<Classification, string> = {
  class_i: 'Class I recall',
  class_ii: 'Class II recall',
  class_iii: 'Class III recall',
}

const CLASSIFICATION_SHORT_LABEL: Record<Classification, string> = {
  class_i: 'Class I',
  class_ii: 'Class II',
  class_iii: 'Class III',
}

// Short form for metadata grids, distinct from formatEventType's "Class I
// recall" phrasing used in case-list contexts.
export function formatClassification(classification: Classification | null): string | null {
  return classification ? CLASSIFICATION_SHORT_LABEL[classification] : null
}

const MATCH_TYPE_LABEL: Record<string, string> = {
  exact_ndc_match: 'Exact NDC match',
  fuzzy_name_match: 'Fuzzy name match',
  no_match: 'No match',
}

export function formatMatchType(matchType: string): string {
  return MATCH_TYPE_LABEL[matchType] ?? titleCaseFromSnakeOrUpper(matchType)
}

function titleCaseFromSnakeOrUpper(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// The backend has no single "event type" field on ticket list/detail rows
// (see docs/API_FLOW.md vs. actual TicketListItem schema). This derives the
// closest available label from classification, falling back to review_type.
export function formatEventType(
  classification: Classification | null,
  reviewType: string | null,
): string {
  if (classification) return CLASSIFICATION_LABEL[classification]
  if (reviewType) return titleCaseFromSnakeOrUpper(reviewType)
  return 'Uncategorized event'
}

export function formatReviewType(reviewType: string | null): string | null {
  return reviewType ? titleCaseFromSnakeOrUpper(reviewType) : null
}

export function formatWorkflowStage(workflowStage: string): string {
  return titleCaseFromSnakeOrUpper(workflowStage)
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Unknown time'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

export function getEvidenceStatusPresentation(status: EvidenceStatus): StatusPresentation {
  return status === 'sufficient'
    ? { label: 'Sufficient evidence', tone: 'success' }
    : { label: 'Insufficient evidence', tone: 'warning' }
}

export function getInventoryMatchPresentation(inventory: InventoryImpact): StatusPresentation {
  return isInventoryMatched(inventory)
    ? { label: 'Inventory matched', tone: 'success' }
    : { label: 'No inventory match', tone: 'info' }
}

export function getStepStatusPresentation(status: WorkflowStepStatus['status']): StatusPresentation {
  switch (status) {
    case 'succeeded':
      return { label: 'Succeeded', tone: 'success' }
    case 'failed':
      return { label: 'Failed', tone: 'danger' }
    case 'skipped':
      return { label: 'Skipped', tone: 'info' }
    default:
      return { label: 'Pending', tone: 'info' }
  }
}

export type PanelState<T> =
  | { kind: 'loading' }
  | { kind: 'ready'; data: T }
  // Real 404s: e.g. no evidence snapshot yet for a ticket that hasn't reached that step.
  | { kind: 'unavailable' }
  | { kind: 'error'; message: string }

// Derived guidance only — not a model output, so it is labeled "Next step"
// in the UI rather than framed as an AI recommendation.
export function getRecommendedNextStep(
  ticket: TicketDetail,
  evidence: PanelState<EvidenceSnapshot>,
  inventory: PanelState<InventoryImpact>,
): string {
  if (ticket.status === 'WORKFLOW_FAILED') {
    return ticket.failure_reason
      ? `Investigate workflow failure: ${ticket.failure_reason}`
      : 'Investigate workflow failure before rerunning.'
  }
  if (ticket.status === 'REJECTED') return 'Case closed as rejected. No further action needed.'
  if (ticket.status === 'APPROVED' || ticket.status === 'CLOSED') return 'Case complete. No further action needed.'

  if (evidence.kind === 'ready' && evidence.data.evidence_status === 'insufficient') {
    return 'Resolve insufficient evidence before this case can be reviewed.'
  }

  if (inventory.kind === 'ready' && isInventoryMatched(inventory.data) && inventory.data.impact_result.urgent) {
    return 'Urgent inventory impact detected — prioritize pharmacist review.'
  }

  if (ticket.status === 'REVIEW_ROUTED') {
    return ticket.review_type === 'final_approval'
      ? 'Ready for pharmacist final approval.'
      : 'Needs pharmacist review.'
  }

  return 'Workflow is still processing this case.'
}
