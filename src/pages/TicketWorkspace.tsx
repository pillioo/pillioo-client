import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { useTicketPreview } from '../hooks/useTicketPreview'
import { formatWorkflowStage, getStatusPresentation } from '../lib/ticketPresentation'
import type { EvidenceSnapshot, InventoryImpact, TicketDetail } from '../api/types'
import './TicketWorkspace.css'

type TabId = 'overview' | 'inventory' | 'evidence' | 'report' | 'history'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'report', label: 'Report' },
  { id: 'history', label: 'History' },
]

// ── Dummy data placeholders ──────────────────────────────────────────
// report/history are not wired to the backend yet (that's the next PR).
// Shape mirrors docs/api.md so swapping in real fetches later is a
// drop-in replacement, not a rewrite.
const DUMMY_REPORT = {
  version_tag: 'draft_v1',
  summary: 'Structured report preview will appear here once /reports/{ticket_id} is connected.',
  recommended_review_action: 'Pending API integration.',
  citations_count: 0,
}

const DUMMY_HISTORY = [
  { title: 'Ticket created', severity: 'info', status: 'succeeded', message: 'Placeholder audit entry.' },
  { title: 'Workflow step', severity: 'info', status: 'succeeded', message: 'Real audit trail pending /audit/{ticket_id} integration.' },
]

// ── Tab content components ───────────────────────────────────────────

function OverviewTab({ detail, evidence, inventory }: {
  detail: TicketDetail
  evidence: ReturnType<typeof useTicketPreview>['evidence']
  inventory: ReturnType<typeof useTicketPreview>['inventory']
}) {
  return (
    <div className="tw-panel">
      <div className="tw-card">
        <h2 className="tw-card-title">Event Summary</h2>
        <dl className="tw-kv">
          <dt>Drug</dt>
          <dd>{detail.drug_name}</dd>
          <dt>NDC</dt>
          <dd>{detail.ndc || '—'}</dd>
          <dt>Lot</dt>
          <dd>{detail.lot || '—'}</dd>
          <dt>Recall number</dt>
          <dd>{detail.recall_number || '—'}</dd>
          <dt>Classification</dt>
          <dd>{detail.classification || '—'}</dd>
        </dl>
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Inventory Impact</h2>
        {inventory.kind === 'ready' && inventory.data.matched ? (
          <p className="tw-summary-text">
            Impacted — {inventory.data.impact_result.total_quantity} units across{' '}
            {inventory.data.impact_result.affected_departments.join(', ') || 'no departments'}.
          </p>
        ) : inventory.kind === 'ready' ? (
          <p className="tw-summary-text tw-muted">No inventory match found.</p>
        ) : (
          <p className="tw-summary-text tw-muted">Loading inventory summary…</p>
        )}
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Evidence Readiness</h2>
        {evidence.kind === 'ready' ? (
          <p className="tw-summary-text">
            Status: <strong>{evidence.data.evidence_status}</strong>
            {evidence.data.weak_sources.length > 0 && ` · ${evidence.data.weak_sources.length} weak source(s)`}
          </p>
        ) : (
          <p className="tw-summary-text tw-muted">Loading evidence summary…</p>
        )}
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Recommended Next Step</h2>
        <p className="tw-summary-text">{DUMMY_REPORT.recommended_review_action}</p>
      </div>
    </div>
  )
}

function InventoryTab({ inventory }: { inventory: ReturnType<typeof useTicketPreview>['inventory'] }) {
  if (inventory.kind === 'loading') return <p className="tw-status-text">Loading inventory impact…</p>
  if (inventory.kind === 'unavailable') return <p className="tw-status-text">No inventory data for this ticket.</p>
  if (inventory.kind === 'error') return <p className="tw-status-text">Couldn't load inventory. {inventory.message}</p>

  const data: InventoryImpact = inventory.data
  if (!data.matched) {
    return (
      <div className="tw-panel">
        <div className="tw-card">
          <p className="tw-summary-text tw-muted">{data.message || 'No inventory match found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tw-panel">
      <div className="tw-card">
        <h2 className="tw-card-title">Match Result</h2>
        <dl className="tw-kv">
          <dt>Match type</dt>
          <dd>{data.match_result.match_type}</dd>
          <dt>Confidence</dt>
          <dd>{Math.round(data.match_result.match_confidence * 100)}%</dd>
          <dt>Identity review needed</dt>
          <dd>{data.match_result.needs_identity_review ? 'Yes' : 'No'}</dd>
        </dl>
      </div>
      <div className="tw-card">
        <h2 className="tw-card-title">Impact</h2>
        <dl className="tw-kv">
          <dt>Affected departments</dt>
          <dd>{data.impact_result.affected_departments.join(', ') || '—'}</dd>
          <dt>Total quantity</dt>
          <dd>{data.impact_result.total_quantity}</dd>
          <dt>Priority</dt>
          <dd>{data.impact_result.priority}</dd>
          <dt>Urgent</dt>
          <dd>{data.impact_result.urgent ? data.impact_result.urgent_reason : 'No'}</dd>
        </dl>
      </div>
      <div className="tw-card">
        <h2 className="tw-card-title">Quality Check</h2>
        <dl className="tw-kv">
          <dt>Confidence</dt>
          <dd>{Math.round(data.quality_result.confidence * 100)}%</dd>
          <dt>Review required</dt>
          <dd>{data.quality_result.review_required ? 'Yes' : 'No'}</dd>
          <dt>Flags</dt>
          <dd>{data.quality_result.flags.join(', ') || 'None'}</dd>
        </dl>
      </div>
    </div>
  )
}

function EvidenceTab({ evidence }: { evidence: ReturnType<typeof useTicketPreview>['evidence'] }) {
  if (evidence.kind === 'loading') return <p className="tw-status-text">Loading evidence…</p>
  if (evidence.kind === 'unavailable') return <p className="tw-status-text">No evidence snapshot for this ticket.</p>
  if (evidence.kind === 'error') return <p className="tw-status-text">Couldn't load evidence. {evidence.message}</p>

  const data: EvidenceSnapshot = evidence.data

  return (
    <div className="tw-panel">
      <div className="tw-card">
        <h2 className="tw-card-title">Sufficiency</h2>
        <dl className="tw-kv">
          <dt>Status</dt>
          <dd>{data.evidence_status}</dd>
          <dt>Coverage</dt>
          <dd>{data.coverage_score !== null ? `${Math.round(data.coverage_score * 100)}%` : '—'}</dd>
          <dt>Citations ready</dt>
          <dd>{data.citations_ready === null ? '—' : data.citations_ready ? 'Yes' : 'No'}</dd>
        </dl>
      </div>

      {data.weak_sources.length > 0 && (
        <div className="tw-card tw-card-warning">
          <h2 className="tw-card-title">Weak Sources</h2>
          <ul className="tw-tag-list">
            {data.weak_sources.map((s) => (
              <li key={s} className="tw-tag tw-tag-warning">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {data.missing_sources.length > 0 && (
        <div className="tw-card tw-card-danger">
          <h2 className="tw-card-title">Missing Sources</h2>
          <ul className="tw-tag-list">
            {data.missing_sources.map((s) => (
              <li key={s} className="tw-tag tw-tag-danger">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {data.failure_reasons.length > 0 && (
        <div className="tw-card">
          <h2 className="tw-card-title">Failure Reasons</h2>
          <ul className="tw-plain-list">
            {data.failure_reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function ReportTab() {
  // Dummy until /reports/{ticket_id} is wired up.
  return (
    <div className="tw-panel">
      <div className="tw-card">
        <h2 className="tw-card-title">Latest Version — {DUMMY_REPORT.version_tag}</h2>
        <p className="tw-summary-text">{DUMMY_REPORT.summary}</p>
      </div>
      <div className="tw-card">
        <h2 className="tw-card-title">Recommended Action</h2>
        <p className="tw-summary-text">{DUMMY_REPORT.recommended_review_action}</p>
      </div>
      <div className="tw-card tw-card-placeholder">
        <p className="tw-summary-text tw-muted">Report data will load from the backend once connected.</p>
      </div>
    </div>
  )
}

function HistoryTab() {
  // Dummy until /audit/{ticket_id} is wired up.
  return (
    <div className="tw-panel">
      <ul className="tw-timeline">
        {DUMMY_HISTORY.map((entry, i) => (
          <li key={i} className={`tw-timeline-item tw-timeline-${entry.severity}`}>
            <div className="tw-timeline-title">{entry.title}</div>
            <div className="tw-timeline-message">{entry.message}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Main workspace ────────────────────────────────────────────────────

interface TicketWorkspaceContentProps {
  ticketId: string
}

function TicketWorkspaceContent({ ticketId }: TicketWorkspaceContentProps) {
  const { detail, evidence, inventory } = useTicketPreview(ticketId)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

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

          <div className="tw-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tw-tab ${activeTab === tab.id ? 'tw-tab-selected' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <OverviewTab detail={detail.data} evidence={evidence} inventory={inventory} />
          )}
          {activeTab === 'inventory' && <InventoryTab inventory={inventory} />}
          {activeTab === 'evidence' && <EvidenceTab evidence={evidence} />}
          {activeTab === 'report' && <ReportTab />}
          {activeTab === 'history' && <HistoryTab />}
        </>
      )}
    </div>
  )
}

function TicketWorkspace() {
  const { ticketId } = useParams<{ ticketId: string }>()

  return (
    <AppShell title="Ticket Workspace">
      {ticketId ? <TicketWorkspaceContent key={ticketId} ticketId={ticketId} /> : null}
    </AppShell>
  )
}

export default TicketWorkspace