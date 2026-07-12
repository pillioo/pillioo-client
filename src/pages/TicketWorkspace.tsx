import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { useTicketPreview } from '../hooks/useTicketPreview'
import { formatWorkflowStage, getStatusPresentation } from '../lib/ticketPresentation'
import './TicketWorkspace.css'

interface TicketWorkspaceContentProps {
  ticketId: string
}

function TicketWorkspaceContent({ ticketId }: TicketWorkspaceContentProps) {
  const { detail } = useTicketPreview(ticketId)

  return (
    <div className="ticket-workspace">
      <Link to="/app" className="ticket-workspace-back">
        ← Back to Safety Inbox
      </Link>

      {detail.kind === 'loading' && <p className="ticket-workspace-status-text">Loading case…</p>}

      {detail.kind === 'unavailable' && (
        <p className="ticket-workspace-status-text">Case {ticketId} was not found.</p>
      )}

      {detail.kind === 'error' && (
        <p className="ticket-workspace-status-text">Couldn't load case {ticketId}. {detail.message}</p>
      )}

      {detail.kind === 'ready' && (
        <>
          <div className="ticket-workspace-header">
            <h1>{detail.data.drug_name}</h1>
            <span className="ticket-workspace-id">{detail.data.ticket_id}</span>
            <StatusBadge {...getStatusPresentation(detail.data.status)} />
          </div>
          <p className="ticket-workspace-stage">
            Workflow stage: {formatWorkflowStage(detail.data.workflow_stage)}
          </p>
        </>
      )}

      <div className="ticket-workspace-placeholder">
        <p>The full Ticket Workspace — evidence, report, inventory, review, and history — is under construction.</p>
      </div>
    </div>
  )
}

// Minimal placeholder: the full Ticket Workspace (evidence, report, review,
// chat, history tabs per docs/PAGES.md) is a separate build. This exists so
// "Open Workspace" and the mobile case-selection flow have a real
// destination instead of a dead link.
function TicketWorkspace() {
  const { ticketId } = useParams<{ ticketId: string }>()

  return (
    <AppShell title="Ticket Workspace">
      {ticketId ? <TicketWorkspaceContent key={ticketId} ticketId={ticketId} /> : null}
    </AppShell>
  )
}

export default TicketWorkspace
