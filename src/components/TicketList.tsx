import type { TicketListItem } from '../api/types'
import { formatEventType, formatRelativeTime, getStatusPresentation } from '../lib/ticketPresentation'
import StatusBadge from './StatusBadge'
import './TicketList.css'

interface TicketListProps {
  tickets: TicketListItem[]
  selectedTicketId: string | null
  onSelect: (ticketId: string) => void
}

function TicketList({ tickets, selectedTicketId, onSelect }: TicketListProps) {
  return (
    <ul className="ticket-list">
      {tickets.map((ticket) => {
        const status = getStatusPresentation(ticket.status)
        const isSelected = ticket.ticket_id === selectedTicketId
        return (
          <li key={ticket.ticket_id}>
            <button
              type="button"
              className={`ticket-row ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelect(ticket.ticket_id)}
              aria-current={isSelected}
            >
              <div className="ticket-row-main">
                <span className="ticket-row-drug">{ticket.drug_name}</span>
                <span className="ticket-row-meta">
                  {formatEventType(ticket.classification, ticket.review_type)} ·{' '}
                  <span className="ticket-row-mono">{ticket.ticket_id}</span> ·{' '}
                  {formatRelativeTime(ticket.updated_at ?? ticket.created_at)}
                </span>
              </div>
              <StatusBadge tone={status.tone} label={status.label} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default TicketList
