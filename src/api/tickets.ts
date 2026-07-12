import { apiGet } from './client'
import type {
  AuditLogEntry,
  EvidenceSnapshot,
  InventoryImpact,
  ReportVersion,
  TicketDetail,
  TicketListFilters,
  TicketListResponse,
} from './types'

export function listTickets(filters: TicketListFilters = {}): Promise<TicketListResponse> {
  return apiGet<TicketListResponse>('/tickets', { ...filters })
}

export function getTicketDetail(ticketId: string): Promise<TicketDetail> {
  return apiGet<TicketDetail>(`/tickets/${encodeURIComponent(ticketId)}`)
}

export function getTicketEvidence(ticketId: string): Promise<EvidenceSnapshot> {
  return apiGet<EvidenceSnapshot>(`/tickets/${encodeURIComponent(ticketId)}/evidence`)
}

export function getInventoryImpact(ticketId: string): Promise<InventoryImpact> {
  return apiGet<InventoryImpact>(`/inventory/impact/${encodeURIComponent(ticketId)}`)
}

export function getTicketAudit(ticketId: string): Promise<AuditLogEntry[]> {
  return apiGet<AuditLogEntry[]>(`/audit/${encodeURIComponent(ticketId)}`)
}

// Ascending by created_at (draft_v1 -> draft_v2 -> final_v1), so the latest
// version is always the last element — no need for a separate call to
// GET /reports/{ticket_id} to also get "the latest one".
export function getReportVersions(ticketId: string): Promise<ReportVersion[]> {
  return apiGet<ReportVersion[]>(`/reports/${encodeURIComponent(ticketId)}/versions`)
}