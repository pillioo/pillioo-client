import { apiGet } from './client'
import type {
  AuditLogEntry,
  EvidenceSnapshot,
  InventoryImpact,
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