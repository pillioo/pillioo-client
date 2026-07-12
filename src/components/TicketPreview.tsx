import { Link } from 'react-router-dom'
import { isInventoryMatched } from '../api/types'
import { useTicketPreview } from '../hooks/useTicketPreview'
import {
  formatReviewType,
  formatWorkflowStage,
  getRecommendedNextStep,
  getStatusPresentation,
} from '../lib/ticketPresentation'
import StatusBadge from './StatusBadge'
import './TicketPreview.css'

interface TicketPreviewProps {
  ticketId: string
}

function TicketPreview({ ticketId }: TicketPreviewProps) {
  const { detail, evidence, inventory } = useTicketPreview(ticketId)

  if (detail.kind === 'loading') {
    return (
      <div className="ticket-preview" aria-busy="true">
        <p className="ticket-preview-status-text">Loading case…</p>
      </div>
    )
  }

  if (detail.kind === 'unavailable') {
    return (
      <div className="ticket-preview">
        <p className="ticket-preview-status-text">This case is no longer available.</p>
      </div>
    )
  }

  if (detail.kind === 'error') {
    return (
      <div className="ticket-preview">
        <p className="ticket-preview-status-text ticket-preview-error">
          Couldn't load this case. {detail.message}
        </p>
      </div>
    )
  }

  const ticket = detail.data
  const status = getStatusPresentation(ticket.status)
  const reviewTypeLabel = formatReviewType(ticket.review_type)
  // Emphasize the actionable case: a case actually routed for review should
  // read as "Start Review", not the same generic label as a closed case.
  const primaryActionLabel = ticket.status === 'REVIEW_ROUTED' ? 'Start Review' : 'Open Workspace'

  return (
    <div className="ticket-preview">
      <div className="ticket-preview-header">
        <h2>{ticket.drug_name}</h2>
        <span className="ticket-preview-id">{ticket.ticket_id}</span>
      </div>

      <div className="ticket-preview-badges">
        <StatusBadge tone={status.tone} label={status.label} />
        {reviewTypeLabel && <span className="ticket-preview-tag">{reviewTypeLabel}</span>}
      </div>

      <dl className="ticket-preview-facts">
        <div className="ticket-preview-fact">
          <dt>Current state</dt>
          <dd>{formatWorkflowStage(ticket.workflow_stage)}</dd>
        </div>
        <div className="ticket-preview-fact">
          <dt>Evidence sufficiency</dt>
          <dd>
            {evidence.kind === 'loading' && 'Checking…'}
            {evidence.kind === 'unavailable' && 'Not yet available'}
            {evidence.kind === 'error' && <span className="ticket-preview-error">Couldn't load</span>}
            {evidence.kind === 'ready' &&
              (evidence.data.evidence_status === 'sufficient' ? 'Sufficient' : 'Insufficient')}
            {evidence.kind === 'ready' && evidence.data.coverage_score !== null && (
              <span className="ticket-preview-subvalue">
                {' '}
                · {Math.round(evidence.data.coverage_score * 100)}% coverage
              </span>
            )}
          </dd>
        </div>
        <div className="ticket-preview-fact">
          <dt>Inventory impact</dt>
          <dd>
            {inventory.kind === 'loading' && 'Checking…'}
            {inventory.kind === 'unavailable' && 'Not yet available'}
            {inventory.kind === 'error' && <span className="ticket-preview-error">Couldn't load</span>}
            {inventory.kind === 'ready' &&
              (isInventoryMatched(inventory.data)
                ? `${inventory.data.impact_result.total_quantity} units across ${inventory.data.impact_result.affected_departments.length || 0} dept(s)`
                : 'No inventory match')}
          </dd>
        </div>
        {ticket.status === 'WORKFLOW_FAILED' && ticket.failure_reason && (
          <div className="ticket-preview-fact">
            <dt>Failure reason</dt>
            <dd className="ticket-preview-error">{ticket.failure_reason}</dd>
          </div>
        )}
      </dl>

      <div className="ticket-preview-next-step">
        <span className="ticket-preview-next-step-label">Next step</span>
        <p>{getRecommendedNextStep(ticket, evidence, inventory)}</p>
      </div>

      <Link className="ticket-preview-open" to={`/app/tickets/${ticket.ticket_id}`}>
        {primaryActionLabel}
      </Link>
    </div>
  )
}

export default TicketPreview
