import { apiPost } from './client'

export interface EventUploadPayload {
  recall_number: string
  classification: string
  product_ndc: string
  lot_number: string
  product_description: string
  reason_for_recall: string
  recall_initiation_date: string
  status: string
}

export interface EventUploadResponse {
  event_id: string
  duplicated: boolean
  ticket_id: string
}

export function uploadEvent(payload: EventUploadPayload): Promise<EventUploadResponse> {
  return apiPost<EventUploadResponse>('/events/upload', payload)
}
