import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface TicketSummary {
  ticket_id: string
  drug_name: string
  status: string | null
  review_type: string | null
  priority?: string | null
  created_at: string | null
}

export interface DashboardSummary {
  total_tickets: number
  by_status: Record<string, number>
  by_review_type: Record<string, number>
  pending_approvals: number
  workflow_failed: number
  high_priority: number
  today_created: number
  evidence_review_pending: number
  urgent_tickets: TicketSummary[]
  recent_failures: TicketSummary[]
  recent_tickets: TicketSummary[]
  evidence_queue: {
    tickets: unknown[]
    weak_sources_count: number
    citation_not_ready_count: number
  }
  review_approval_queue: {
    pending_approvals: unknown[]
    revision_requested: unknown[]
    safety_check_failed: unknown[]
  }
  inventory_impact: {
    impacted_count: number
    exact_match_count: number
    possible_match_count: number
    high_impact_tickets: unknown[]
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary')
  return data
}