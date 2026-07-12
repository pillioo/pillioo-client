import type { BadgeTone } from '../lib/ticketPresentation'
import './StatusBadge.css'

interface StatusBadgeProps {
  tone: BadgeTone
  label: string
}

function StatusBadge({ tone, label }: StatusBadgeProps) {
  return <span className={`status-badge status-badge-${tone}`}>{label}</span>
}

export default StatusBadge
