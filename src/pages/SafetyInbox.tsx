import { useEffect, useState } from 'react'
import { getDashboardSummary, type DashboardSummary, type TicketSummary } from '../lib/api'
import './SafetyInbox.css'

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null

  const normalized = status.toUpperCase()
  let className = 'badge badge-info'
  if (normalized.includes('FAIL') || normalized.includes('REJECT')) {
    className = 'badge badge-danger'
  } else if (normalized.includes('REVIEW') || normalized.includes('PENDING')) {
    className = 'badge badge-warning'
  } else if (normalized.includes('APPROVE') || normalized.includes('COMPLETE') || normalized.includes('CLOSED')) {
    className = 'badge badge-success'
  }

  return <span className={className}>{status}</span>
}

function TicketRow({ ticket }: { ticket: TicketSummary }) {
  return (
    <div className="ticket-row">
      <div>
        <div className="ticket-drug-name">{ticket.drug_name || 'Unknown drug'}</div>
        <div className="ticket-meta">
          {ticket.review_type || 'unclassified'} · {ticket.ticket_id}
        </div>
      </div>
      <StatusBadge status={ticket.status} />
    </div>
  )
}

export default function SafetyInbox() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getDashboardSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dashboard summary. Is the backend running?')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="safety-inbox">
        <p className="state-text">Loading safety inbox...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="safety-inbox">
        <p className="state-text state-error">{error}</p>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const tickets = summary.recent_tickets ?? []

  return (
    <div className="safety-inbox">
      <header className="inbox-header">
        <h1>Safety Inbox</h1>
        <div className="summary-strip">
          <div className="summary-tile">
            <span className="summary-value">{summary.total_tickets}</span>
            <span className="summary-label">Total tickets</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{summary.pending_approvals}</span>
            <span className="summary-label">Pending approvals</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{summary.high_priority}</span>
            <span className="summary-label">High priority</span>
          </div>
          <div className="summary-tile">
            <span className="summary-value">{summary.evidence_review_pending}</span>
            <span className="summary-label">Evidence review</span>
          </div>
        </div>
      </header>

      <section className="ticket-list">
        {tickets.length === 0 ? (
          <p className="state-text">No recent tickets yet. New cases will appear here.</p>
        ) : (
          tickets.map((ticket) => <TicketRow key={ticket.ticket_id} ticket={ticket} />)
        )}
      </section>
    </div>
  )
}