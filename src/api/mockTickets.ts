// Isolated mock adapter for local UI development without a running backend.
// Mirrors the function signatures in ./tickets so ticketsService.ts can swap
// between them with a single env flag. Never imported directly by pages/components.
import { ApiError } from './client'
import type {
  AuditLogEntry,
  EvidenceSnapshot,
  InventoryImpact,
  TicketDetail,
  TicketListFilters,
  TicketListItem,
  TicketListResponse,
} from './types'

const NETWORK_DELAY_MS = 350

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS))
}

const MOCK_TICKETS: TicketListItem[] = [
  {
    ticket_id: 'T-2381',
    status: 'REVIEW_ROUTED',
    workflow_stage: 'PENDING_REVIEW',
    drug_name: 'Dexamethasone Injection',
    ndc: '71449-0072-41',
    lot: '2331062',
    classification: 'class_i',
    recall_number: 'D-0277-2024',
    priority: 'HIGH',
    review_type: 'final_approval',
    created_at: '2026-07-11T12:01:44.502340',
    updated_at: '2026-07-11T15:20:00.000000',
  },
  {
    ticket_id: 'T-2379',
    status: 'EVIDENCE_RETRIEVED',
    workflow_stage: 'SUFFICIENCY_CHECK',
    drug_name: 'Midazolam Injection',
    ndc: '00409-1712-01',
    lot: null,
    classification: null,
    recall_number: null,
    priority: 'MEDIUM',
    review_type: 'evidence_review',
    created_at: '2026-07-11T09:44:10.000000',
    updated_at: null,
  },
  {
    ticket_id: 'T-2374',
    status: 'CLOSED',
    workflow_stage: 'POLICY_AGGREGATION',
    drug_name: 'Sodium Chloride 0.9% Injection',
    ndc: '00338-0049-04',
    lot: '8823A',
    classification: 'class_iii',
    recall_number: 'D-0261-2024',
    priority: 'LOW',
    review_type: 'no_impact_close',
    created_at: '2026-07-10T08:15:00.000000',
    updated_at: '2026-07-10T08:40:00.000000',
  },
  {
    ticket_id: 'T-2368',
    status: 'WORKFLOW_FAILED',
    workflow_stage: 'EVIDENCE_RETRIEVAL',
    drug_name: 'Fentanyl Citrate Injection',
    ndc: '71449-0072-41',
    lot: '2331062',
    classification: 'class_i',
    recall_number: 'D-0277-2024',
    priority: 'HIGH',
    review_type: null,
    created_at: '2026-07-09T22:05:00.000000',
    updated_at: '2026-07-09T22:07:00.000000',
  },
  {
    ticket_id: 'T-2355',
    status: 'APPROVED',
    workflow_stage: 'APPROVAL_DECISION',
    drug_name: 'Insulin Glargine Injection',
    ndc: '00088-2220-33',
    lot: '4471B',
    classification: 'class_ii',
    recall_number: 'D-0248-2024',
    priority: 'MEDIUM',
    review_type: 'final_approval',
    created_at: '2026-07-08T14:30:00.000000',
    updated_at: '2026-07-09T10:12:00.000000',
  },
  {
    ticket_id: 'T-2350',
    status: 'REVIEW_ROUTED',
    workflow_stage: 'PENDING_REVIEW',
    drug_name: 'Amoxicillin Oral Suspension',
    ndc: '00093-4155-73',
    lot: null,
    classification: null,
    recall_number: null,
    priority: 'LOW',
    review_type: 'identity_review',
    created_at: '2026-07-07T11:00:00.000000',
    updated_at: null,
  },
]

const MOCK_DETAILS: Record<string, TicketDetail> = Object.fromEntries(
  MOCK_TICKETS.map((ticket) => [
    ticket.ticket_id,
    {
      ...ticket,
      updated_at: ticket.updated_at ?? ticket.created_at,
      can_rerun: ticket.status === 'WORKFLOW_FAILED',
      failure_reason:
        ticket.status === 'WORKFLOW_FAILED' ? 'Milvus connection failed during evidence retrieval.' : null,
      steps: [
        { step: 'inventory_match', status: 'succeeded', duration_ms: 120, reason: null, completed_at: ticket.created_at },
        {
          step: 'evidence_retrieval',
          status: ticket.status === 'WORKFLOW_FAILED' ? 'failed' : 'succeeded',
          duration_ms: 340,
          reason: ticket.status === 'WORKFLOW_FAILED' ? 'Milvus unavailable' : null,
          completed_at: ticket.created_at,
        },
      ],
    },
  ]),
)

const MOCK_EVIDENCE: Record<string, EvidenceSnapshot> = {
  'T-2381': {
    evidence_status: 'sufficient',
    coverage_score: 0.92,
    citations_ready: true,
    required_sources: ['recall_notice', 'policy', 'sop'],
    found_sources: ['recall_notice', 'policy', 'sop'],
    missing_sources: [],
    weak_sources: [],
    failure_reasons: [],
  },
  'T-2379': {
    evidence_status: 'insufficient',
    coverage_score: 0.4,
    citations_ready: false,
    required_sources: ['policy', 'sop'],
    found_sources: ['sop'],
    missing_sources: ['policy'],
    weak_sources: ['sop'],
    failure_reasons: ['low_coverage'],
  },
  'T-2355': {
    evidence_status: 'sufficient',
    coverage_score: 1,
    citations_ready: true,
    required_sources: ['recall_notice', 'policy'],
    found_sources: ['recall_notice', 'policy'],
    missing_sources: [],
    weak_sources: [],
    failure_reasons: [],
  },
  'T-2350': {
    evidence_status: 'sufficient',
    coverage_score: 0.75,
    citations_ready: true,
    required_sources: ['policy', 'sop'],
    found_sources: ['policy', 'sop'],
    missing_sources: [],
    weak_sources: ['sop'],
    failure_reasons: [],
  },
}

const MOCK_INVENTORY: Record<string, InventoryImpact> = {
  'T-2381': {
    ticket_id: 'T-2381',
    matched: true,
    match_result: { matched: true, match_type: 'exact_ndc_match', match_confidence: 0.98, needs_identity_review: false },
    impact_result: {
      affected_departments: ['ICU', 'ER'],
      department_breakdown: { ICU: 40, ER: 12 },
      total_quantity: 52,
      priority: 'HIGH',
      urgent: true,
      urgent_reason: 'High-priority recall with ICU stock on hand.',
    },
    quality_result: { confidence: 0.95, flags: [], review_required: false },
  },
  'T-2355': {
    ticket_id: 'T-2355',
    matched: true,
    match_result: { matched: true, match_type: 'fuzzy_name_match', match_confidence: 0.81, needs_identity_review: true },
    impact_result: {
      affected_departments: ['GW'],
      department_breakdown: { GW: 6 },
      total_quantity: 6,
      priority: 'MEDIUM',
      urgent: false,
      urgent_reason: '',
    },
    quality_result: { confidence: 0.7, flags: ['fuzzy_match'], review_required: true },
  },
  'T-2350': {
    ticket_id: 'T-2350',
    matched: false,
    message: 'No matching NDC or lot found in current inventory snapshot.',
  },
}

const MOCK_AUDIT: Record<string, AuditLogEntry[]> = {
  'T-2381': [
    {
      ticket_id: 'T-2381',
      step_name: 'inventory_match',
      input_json: {},
      output_json: {},
      timestamp: '2026-07-11T12:02:00.000000',
      duration_ms: 120,
      title: 'Inventory Match',
      message: 'Inventory Match completed successfully.',
      severity: 'info',
      status: 'succeeded',
    },
    {
      ticket_id: 'T-2381',
      step_name: 'evidence_retrieval',
      input_json: {},
      output_json: {},
      timestamp: '2026-07-11T12:02:02.000000',
      duration_ms: 340,
      title: 'Evidence Retrieval',
      message: 'Evidence Retrieval completed successfully.',
      severity: 'info',
      status: 'succeeded',
    },
    {
      ticket_id: 'T-2381',
      step_name: 'policy_aggregation',
      input_json: {},
      output_json: {},
      timestamp: '2026-07-11T12:02:05.000000',
      duration_ms: 15,
      title: 'Policy Aggregation',
      message: 'Routed to final_approval.',
      severity: 'info',
      status: 'succeeded',
    },
  ],
  'T-2368': [
    {
      ticket_id: 'T-2368',
      step_name: 'inventory_match',
      input_json: {},
      output_json: {},
      timestamp: '2026-07-09T22:05:30.000000',
      duration_ms: 100,
      title: 'Inventory Match',
      message: 'Inventory Match completed successfully.',
      severity: 'info',
      status: 'succeeded',
    },
    {
      ticket_id: 'T-2368',
      step_name: 'evidence_retrieval',
      input_json: {},
      output_json: {},
      timestamp: '2026-07-09T22:06:00.000000',
      duration_ms: 500,
      title: 'Evidence Retrieval',
      message: 'Evidence Retrieval failed: Milvus unavailable.',
      severity: 'error',
      status: 'failed',
    },
  ],
}

function matchesFilters(ticket: TicketListItem, filters: TicketListFilters): boolean {
  if (filters.status && ticket.status !== filters.status) return false
  if (filters.review_type && ticket.review_type !== filters.review_type) return false
  if (filters.priority && ticket.priority !== filters.priority) return false
  if (filters.recall_number && ticket.recall_number !== filters.recall_number) return false
  if (filters.q) {
    const q = filters.q.toLowerCase()
    const haystack = `${ticket.drug_name} ${ticket.ticket_id} ${ticket.recall_number ?? ''}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}

export function listTickets(filters: TicketListFilters = {}): Promise<TicketListResponse> {
  const filtered = MOCK_TICKETS.filter((ticket) => matchesFilters(ticket, filters))
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0
  return delay({
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset,
  })
}

export function getTicketDetail(ticketId: string): Promise<TicketDetail> {
  const detail = MOCK_DETAILS[ticketId]
  if (!detail) return Promise.reject(new ApiError(404, `Mock ticket ${ticketId} not found`))
  return delay(detail)
}

export function getTicketEvidence(ticketId: string): Promise<EvidenceSnapshot> {
  const evidence = MOCK_EVIDENCE[ticketId]
  if (!evidence) return Promise.reject(new ApiError(404, `No evidence snapshot for ${ticketId}`))
  return delay(evidence)
}

export function getInventoryImpact(ticketId: string): Promise<InventoryImpact> {
  const inventory = MOCK_INVENTORY[ticketId]
  if (!inventory) return Promise.reject(new ApiError(404, `No inventory impact for ${ticketId}`))
  return delay(inventory)
}

export function getTicketAudit(ticketId: string): Promise<AuditLogEntry[]> {
  const audit = MOCK_AUDIT[ticketId]
  if (!audit) return Promise.reject(new ApiError(404, `No audit trail for ${ticketId}`))
  return delay(audit)
}