// Pure presentation helpers: label/tone mapping and derived copy for ticket
// data. Nothing here calls the network — see src/api for that.
import { isInventoryMatched } from '../api/types'
import type {
  Classification,
  EvidenceChunk,
  EvidenceFailureReason,
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

const VERSION_TAG_LABEL: Record<string, string> = {
  draft_v1: 'Draft v1',
  draft_v2: 'Draft v2',
  final_v1: 'Final',
}

export function formatVersionTag(versionTag: string): string {
  return VERSION_TAG_LABEL[versionTag] ?? titleCaseFromSnakeOrUpper(versionTag)
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

export function formatAbsoluteDateTime(iso: string | null): string {
  if (!iso) return 'Unknown time'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString()
}

// ── Evidence: pharmacist-facing translation layer ──────────────────────
//
// The backend evidence response (GET /tickets/{ticket_id}/evidence) is a
// retrieval/RAG diagnostics payload — evidence_status, coverage_score,
// filter_level, rank_reasons, etc. Everything below translates that payload
// into pharmacist-facing language (readiness, a source checklist, plain-
// English relevance notes). Raw retrieval terminology is only ever surfaced
// inside the Evidence tab's collapsed technical-details sections — see
// EvidenceCard.tsx and the EvidenceTab component in TicketWorkspace.tsx.

export function formatPercentScore(score: number | null): string {
  return score === null ? '—' : `${Math.round(score * 100)}%`
}

export function formatYesNo(value: boolean | null): string {
  if (value === null) return 'Unknown'
  return value ? 'Yes' : 'No'
}

export function formatDocumentType(documentType: string): string {
  return titleCaseFromSnakeOrUpper(documentType)
}

// The specific, human name for a source type — used in the source checklist,
// card headers, and failure-reason context, so the same source type always
// reads the same way across the Evidence tab.
const SOURCE_TYPE_LABEL: Record<string, string> = {
  recall_notice: 'Recall notice',
  policy: 'Hospital policy',
  sop: 'SOP / procedure',
  label: 'Product label',
}

export function formatSourceTypeLabel(documentType: string): string {
  return SOURCE_TYPE_LABEL[documentType] ?? formatDocumentType(documentType)
}

export function formatFilterLevel(filterLevel: string | null): string {
  const FILTER_LEVEL_LABEL: Record<string, string> = {
    strong_identifier_section: 'Strong identifier + section match',
    strong_identifier: 'Strong identifier match',
    section: 'Section match only',
    document_type: 'Document type match only',
  }
  if (!filterLevel) return 'Unknown match level'
  return FILTER_LEVEL_LABEL[filterLevel] ?? titleCaseFromSnakeOrUpper(filterLevel)
}

export function formatRankReason(reason: string): string {
  return titleCaseFromSnakeOrUpper(reason)
}

export function hasFallbackPenalty(rankReasons: string[]): boolean {
  return rankReasons.includes('fallback_penalty')
}

// Derives a readable title from a source_path when no better label exists,
// e.g. "data/rag/documents/recall_notice/recall-d_0277_2024.md" -> "Recall D
// 0277 2024". Internal paths themselves stay out of the primary card.
export function getSourceTitle(sourcePath: string): string {
  if (!sourcePath) return ''
  const fileName = sourcePath.split('/').pop() || sourcePath
  const withoutExtension = fileName.replace(/\.[a-zA-Z0-9]+$/, '')
  const words = withoutExtension.split(/[-_]+/).filter(Boolean)
  if (words.length === 0) return fileName
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Just the file name (with extension) — shown as secondary source
// attribution in the card. The full internal source_path stays confined to
// Technical retrieval details and is never turned into a link (the backend
// exposes no public URL/document endpoint for it).
export function getSourceFileName(sourcePath: string): string {
  if (!sourcePath) return ''
  return sourcePath.split('/').pop() || sourcePath
}

// A readable document title built from available identity metadata —
// product name, source type, and a matched recall number when present —
// rather than from the file name, which is only ever secondary attribution.
export function getEvidenceTitle(chunk: EvidenceChunk): string {
  const typeLabel = formatSourceTypeLabel(chunk.document_type)
  const recallNumber = chunk.matched_identifiers?.recall_number
  const parts = [chunk.drug_name, typeLabel, recallNumber].filter(
    (part): part is string => Boolean(part && part.trim()),
  )
  if (parts.length > 0) return parts.join(' ')
  return getSourceTitle(chunk.source_path) || typeLabel
}

const EVIDENCE_ROLE_LABEL: Record<string, string> = {
  recall_notice: 'Event evidence',
  label: 'Event evidence',
  policy: 'Policy guidance',
  sop: 'SOP guidance',
}

export function getEvidenceRoleLabel(documentType: string): string {
  return EVIDENCE_ROLE_LABEL[documentType] ?? 'Supporting evidence'
}

const EVIDENCE_ROLE_PRIORITY: Record<string, number> = {
  recall_notice: 0,
  label: 0,
  policy: 1,
  sop: 2,
}

function rolePriority(documentType: string): number {
  return EVIDENCE_ROLE_PRIORITY[documentType] ?? 3
}

// Exact identifier-matched evidence and event-level sources (recall notices,
// labels) surface first, so pharmacists see the strongest support before
// generic policy/SOP guidance — see docs/PAGES.md Evidence Tab display rules.
export function sortChunksForDisplay(chunks: EvidenceChunk[]): EvidenceChunk[] {
  return [...chunks].sort((a, b) => {
    const aHasIdentifiers = Object.keys(a.matched_identifiers ?? {}).length > 0
    const bHasIdentifiers = Object.keys(b.matched_identifiers ?? {}).length > 0
    if (aHasIdentifiers !== bHasIdentifiers) return aHasIdentifiers ? -1 : 1

    const roleDiff = rolePriority(a.document_type) - rolePriority(b.document_type)
    if (roleDiff !== 0) return roleDiff

    const aRank = a.rank_score ?? Number.NEGATIVE_INFINITY
    const bRank = b.rank_score ?? Number.NEGATIVE_INFINITY
    return bRank - aRank
  })
}

// ── Evidence readiness (top summary) ────────────────────────────────────

export function getEvidenceReadiness(status: EvidenceStatus | null): StatusPresentation {
  if (status === 'sufficient') return { label: 'Ready for pharmacist review', tone: 'success' }
  if (status === 'insufficient') return { label: 'Needs additional evidence', tone: 'warning' }
  return { label: 'Evidence status unknown', tone: 'info' }
}

// Kept distinct from getEvidenceReadiness (Evidence tab wording) because
// this same tone/label pair also backs the Overview tab's compact "Evidence
// Readiness" status card, which uses shorter copy.
export function getEvidenceStatusPresentation(status: EvidenceStatus | null): StatusPresentation {
  if (status === 'sufficient') return { label: 'Sufficient evidence', tone: 'success' }
  if (status === 'insufficient') return { label: 'Insufficient evidence', tone: 'warning' }
  return { label: 'Evidence status unknown', tone: 'info' }
}

export type SourceCoverageLevel = 'complete' | 'partial' | 'missing' | 'unknown'

export function getSourceCoverageLevel(data: EvidenceSnapshot): SourceCoverageLevel {
  if (data.required_sources.length === 0) return 'unknown'
  if (data.found_sources.length === 0) return 'missing'
  if (data.missing_sources.length === 0 && data.weak_sources.length === 0) return 'complete'
  return 'partial'
}

const COVERAGE_LEVEL_LABEL: Record<SourceCoverageLevel, string> = {
  complete: 'Complete',
  partial: 'Partial',
  missing: 'Missing',
  unknown: 'Unknown',
}

export function formatSourceCoverageLevel(level: SourceCoverageLevel): string {
  return COVERAGE_LEVEL_LABEL[level]
}

export function formatCitationsReadiness(citationsReady: boolean | null): string {
  if (citationsReady === null) return 'Unknown'
  return citationsReady ? 'Ready' : 'Not ready'
}

// ── Source checklist ─────────────────────────────────────────────────────

export type SourceChecklistStatus = 'found' | 'needs_attention' | 'not_found'

export interface SourceChecklistEntry {
  documentType: string
  label: string
  status: SourceChecklistStatus
}

const CHECKLIST_STATUS_LABEL: Record<SourceChecklistStatus, string> = {
  found: 'Found',
  needs_attention: 'Needs attention',
  not_found: 'Not found',
}

export function formatChecklistStatus(status: SourceChecklistStatus): string {
  return CHECKLIST_STATUS_LABEL[status]
}

export function getChecklistStatusTone(status: SourceChecklistStatus): BadgeTone {
  if (status === 'found') return 'success'
  if (status === 'needs_attention') return 'warning'
  return 'danger'
}

// Builds the pharmacist-facing checklist (Recall notice / Hospital policy /
// SOP.../...) from the union of required/found/missing/weak source types —
// this is the primary translation of those backend lists, replacing raw
// "weak_sources"/"missing_sources" terminology in the default view.
export function buildSourceChecklist(data: EvidenceSnapshot): SourceChecklistEntry[] {
  const types = new Set<string>([
    ...data.required_sources,
    ...data.found_sources,
    ...data.missing_sources,
    ...data.weak_sources,
  ])

  return Array.from(types)
    .map((documentType): SourceChecklistEntry => {
      let status: SourceChecklistStatus = 'not_found'
      if (data.weak_sources.includes(documentType)) status = 'needs_attention'
      else if (data.found_sources.includes(documentType)) status = 'found'
      return { documentType, label: formatSourceTypeLabel(documentType), status }
    })
    .sort((a, b) => rolePriority(a.documentType) - rolePriority(b.documentType))
}

// ── Evidence limitations (failure_reasons) ──────────────────────────────

const FAILURE_REASON_LABEL: Record<string, string> = {
  missing_required_document_type: 'A required type of evidence was not found.',
  only_loose_filter_matched: 'Only a broad, non-specific match was found for this evidence type.',
  recall_notice_identifier_mismatch: 'The recall notice did not match this ticket’s recall number or lot.',
  identifier_section_mismatch: 'This evidence did not match the expected identifiers or section.',
  missing_required_section: 'A required section of evidence was not found.',
  only_weak_evidence_matched: 'Only weak evidence was found for this requirement.',
  citation_not_ready: 'Some evidence is missing details needed for citation.',
  low_coverage: 'Overall evidence coverage is below the required threshold.',
}

export function formatFailureReasonCode(reason: string): string {
  return FAILURE_REASON_LABEL[reason] ?? titleCaseFromSnakeOrUpper(reason)
}

// Normalizes a failure_reasons entry (plain string or structured object, see
// EvidenceFailureReason) into one plain-language line plus optional context.
export function formatFailureReason(reason: string | EvidenceFailureReason): { text: string; context?: string } {
  if (typeof reason === 'string') return { text: formatFailureReasonCode(reason) }
  const text = formatFailureReasonCode(reason.reason)
  const context = reason.document_type ? formatSourceTypeLabel(reason.document_type) : undefined
  return { text, context }
}

// ── Per-source status + identifier match (pharmacist-facing card copy) ──
//
// Two distinct signals, shown as two distinct card elements rather than one
// combined sentence: the header status badge reflects required/found/weak
// state (doc-type-level, same signal as the source checklist); the
// identifier match panel reflects retrieval-quality signals tied to this
// specific chunk (matched_identifiers, fallback_penalty, filter_level).

export interface ChunkQualityContext {
  requiredSources: string[]
  weakSources: string[]
  failureReasons: (string | EvidenceFailureReason)[]
}

export interface ChunkSourceStatus {
  label: string
  tone: BadgeTone
}

const IDENTIFIER_MISMATCH_REASONS = new Set(['recall_notice_identifier_mismatch', 'identifier_section_mismatch'])

function hasRelatedIdentifierMismatch(
  chunk: EvidenceChunk,
  failureReasons: (string | EvidenceFailureReason)[],
): boolean {
  return failureReasons.some(
    (reason): reason is EvidenceFailureReason =>
      typeof reason !== 'string' &&
      reason.document_type === chunk.document_type &&
      IDENTIFIER_MISMATCH_REASONS.has(reason.reason),
  )
}

// "Status" badge for the card header — required/found/weak, same signal as
// the source checklist (see buildSourceChecklist), applied per chunk.
export function getChunkSourceStatus(chunk: EvidenceChunk, context: ChunkQualityContext): ChunkSourceStatus {
  const isRequired = context.requiredSources.includes(chunk.document_type)
  const needsAttention =
    context.weakSources.includes(chunk.document_type) || hasRelatedIdentifierMismatch(chunk, context.failureReasons)

  if (needsAttention) {
    return { label: isRequired ? 'Required evidence needs attention' : 'Evidence needs attention', tone: 'warning' }
  }
  return { label: isRequired ? 'Required evidence found' : 'Supporting evidence found', tone: 'success' }
}

export interface IdentifierMatch {
  label: string
  detail: string
  tone: 'warning' | 'positive' | 'neutral'
}

const IDENTIFIER_KEY_LABEL: Record<string, string> = {
  recall_number: 'Recall number',
  lot: 'Lot',
  ndc: 'NDC',
  rxnorm_rxcui: 'RxNorm code',
}

function formatIdentifierBadgeList(identifiers: Record<string, string>): string {
  return Object.entries(identifiers)
    .map(([key, value]) => `${IDENTIFIER_KEY_LABEL[key] ?? formatDocumentType(key)} ${value}`)
    .join(' · ')
}

const SOURCE_ROLE_RELEVANCE: Record<string, string> = {
  recall_notice: 'Describes the recall event affecting this product.',
  label: 'Contains product labeling information relevant to this event.',
  policy: 'Supports quarantine and pharmacist review.',
  sop: 'Describes the operational procedure for handling this event.',
}

// Translates matched_identifiers / fallback_penalty / filter_level into the
// Identifier Match panel's status + one-line explanation. Precedence, most
// concerning first: a confirmed identifier match wins outright; otherwise a
// fallback match is flagged low-confidence; otherwise a section-only match
// or a generic description of the source's role.
export function getIdentifierMatch(chunk: EvidenceChunk): IdentifierMatch {
  const identifierEntries = Object.entries(chunk.matched_identifiers ?? {})
  if (identifierEntries.length > 0) {
    return {
      label: 'Identifier matched',
      detail: formatIdentifierBadgeList(chunk.matched_identifiers),
      tone: 'positive',
    }
  }

  if (hasFallbackPenalty(chunk.rank_reasons)) {
    return {
      label: 'Low-confidence match',
      detail: 'Included as a fallback — may not strongly match this ticket.',
      tone: 'warning',
    }
  }

  if (chunk.filter_level === 'section') {
    return {
      label: 'No identifier match',
      detail: 'Matched by topic and section only — no recall number, NDC, or lot confirmed.',
      tone: 'neutral',
    }
  }

  return {
    label: 'No identifier match',
    detail: SOURCE_ROLE_RELEVANCE[chunk.document_type] ?? 'Provides supporting context for this case.',
    tone: 'neutral',
  }
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
