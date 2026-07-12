import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { getInventoryImpact, getTicketAudit, getTicketDetail, getTicketEvidence } from '../api/ticketsService'
import type { AuditLogEntry, EvidenceSnapshot, InventoryImpact, TicketDetail } from '../api/types'
import type { PanelState } from '../lib/ticketPresentation'

interface TicketPreviewState {
  detail: PanelState<TicketDetail>
  evidence: PanelState<EvidenceSnapshot>
  inventory: PanelState<InventoryImpact>
  audit: PanelState<AuditLogEntry[]>
}

const INITIAL_PANELS: TicketPreviewState = {
  detail: { kind: 'loading' },
  evidence: { kind: 'loading' },
  inventory: { kind: 'loading' },
  audit: { kind: 'loading' },
}

function toPanelState<T>(error: unknown): PanelState<T> {
  if (error instanceof ApiError && error.status === 404) return { kind: 'unavailable' }
  const message = error instanceof Error ? error.message : 'Request failed.'
  return { kind: 'error', message }
}

// Loads ticket detail, evidence, inventory impact, and audit trail independently
// so one failing panel doesn't blank the rest of the preview (see docs/API_FLOW.md).
// Callers should remount this hook's owner with `key={ticketId}` when
// switching between tickets (see TicketPreview/TicketWorkspace usage) so
// panel state always starts fresh instead of needing manual request tracking.
export function useTicketPreview(ticketId: string): TicketPreviewState {
  const [state, setState] = useState<TicketPreviewState>(INITIAL_PANELS)

  useEffect(() => {
    let cancelled = false

    getTicketDetail(ticketId)
      .then((data) => {
        if (!cancelled) setState((prev) => ({ ...prev, detail: { kind: 'ready', data } }))
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((prev) => ({ ...prev, detail: toPanelState(error) }))
      })

    getTicketEvidence(ticketId)
      .then((data) => {
        if (!cancelled) setState((prev) => ({ ...prev, evidence: { kind: 'ready', data } }))
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((prev) => ({ ...prev, evidence: toPanelState(error) }))
      })

    getInventoryImpact(ticketId)
      .then((data) => {
        if (!cancelled) setState((prev) => ({ ...prev, inventory: { kind: 'ready', data } }))
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((prev) => ({ ...prev, inventory: toPanelState(error) }))
      })

    getTicketAudit(ticketId)
      .then((data) => {
        if (!cancelled) setState((prev) => ({ ...prev, audit: { kind: 'ready', data } }))
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((prev) => ({ ...prev, audit: toPanelState(error) }))
      })

    return () => {
      cancelled = true
    }
  }, [ticketId])

  return state
}