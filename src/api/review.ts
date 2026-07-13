import { apiGet, apiPost } from './client'
import type {
  ApprovalActionResult,
  ApprovalRequest,
  ReviewPayload,
  ReviseRequest,
  ReviseWithLlmRequest,
} from './types'

export function getReviewPayload(ticketId: string): Promise<ReviewPayload> {
  return apiGet<ReviewPayload>(`/tickets/${encodeURIComponent(ticketId)}/review`)
}

export function approveTicket(ticketId: string, body: ApprovalRequest): Promise<ApprovalActionResult> {
  return apiPost<ApprovalActionResult>(`/approval/${encodeURIComponent(ticketId)}/approve`, body)
}

// comment is required by the backend for rejection — enforce it at the
// call site (component), not by weakening the type here.
export function rejectTicket(ticketId: string, body: Required<ApprovalRequest>): Promise<ApprovalActionResult> {
  return apiPost<ApprovalActionResult>(`/approval/${encodeURIComponent(ticketId)}/reject`, body)
}

export function reviseTicket(ticketId: string, body: ReviseRequest): Promise<ApprovalActionResult> {
  return apiPost<ApprovalActionResult>(`/approval/${encodeURIComponent(ticketId)}/revise`, body)
}

export function reviseTicketWithLlm(ticketId: string, body: ReviseWithLlmRequest): Promise<ApprovalActionResult> {
  return apiPost<ApprovalActionResult>(`/approval/${encodeURIComponent(ticketId)}/revise-with-llm`, body)
}
