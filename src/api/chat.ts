import { apiGet, apiPost } from './client'
import type { ChatMessage, ChatResponse } from './types'

// top_k is intentionally fixed rather than exposed in the UI (product
// decision — see docs/API_FLOW.md ch.7).
const DEFAULT_TOP_K = 5

export function getChatHistory(ticketId: string): Promise<ChatMessage[]> {
  return apiGet<ChatMessage[]>(`/chat/${encodeURIComponent(ticketId)}/history`)
}

export function submitChatQuery(
  ticketId: string,
  body: { user_query: string; session_id: string | null },
): Promise<ChatResponse> {
  return apiPost<ChatResponse>(`/chat/${encodeURIComponent(ticketId)}`, {
    user_query: body.user_query,
    session_id: body.session_id,
    top_k: DEFAULT_TOP_K,
  })
}
