import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { useTicketPreview } from '../hooks/useTicketPreview'
import {
  formatClassification,
  formatMatchType,
  formatReviewType,
  formatWorkflowStage,
  getEvidenceStatusPresentation,
  getInventoryMatchPresentation,
  getRecommendedNextStep,
  getStatusPresentation,
  getStepStatusPresentation,
} from '../lib/ticketPresentation'
import { isInventoryMatched } from '../api/types'
import type { EvidenceSnapshot, InventoryImpact, TicketDetail, WorkflowStepStatus } from '../api/types'
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
// drop-in replacement, not a rewrite. Copy stays user-facing-neutral —
// no endpoint paths or "TODO"-style wording in visible text.
const DUMMY_REPORT = {
  version_tag: 'draft_v1',
  summary: 'A structured report has not been generated for this case yet.',
  recommended_review_action: 'No recommended action is available yet.',
  citations_count: 0,
}

const DUMMY_HISTORY: { title: string; status: WorkflowStepStatus['status']; message: string }[] = [
  { title: 'Ticket created', status: 'succeeded', message: 'The case was created and queued for processing.' },
  { title: 'Workflow started', status: 'succeeded', message: 'Automated workflow steps began running for this case.' },
]

// ── Small reusable pieces ────────────────────────────────────────────

interface MetaItemProps {
  label: string
  value: ReactNode
  mono?: boolean
}

function MetaItem({ label, value, mono }: MetaItemProps) {
  const isEmpty = value === null || value === undefined || value === ''
  return (
    <div className="tw-meta-item">
      <dt>{label}</dt>
      <dd className={mono ? 'tw-mono' : undefined}>{isEmpty ? '—' : value}</dd>
    </div>
  )
}

function MetaGrid({ children }: { children: ReactNode }) {
  return <dl className="tw-meta-grid">{children}</dl>
}

interface StatusCardProps {
  title: string
  badge?: ReactNode
  children: ReactNode
}

function StatusCard({ title, badge, children }: StatusCardProps) {
  return (
    <div className="tw-status-card">
      <div className="tw-status-card-head">
        <span className="tw-status-card-title">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  )
}

function TagList({ items, tone }: { items: string[]; tone: 'neutral' | 'warning' | 'danger' }) {
  return (
    <ul className="tw-tag-list">
      {items.map((item) => (
        <li key={item} className={`tw-tag tw-tag-${tone}`}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function StepTracker({ steps }: { steps: WorkflowStepStatus[] }) {
  if (steps.length === 0) {
    return <EmptyState title="No workflow steps yet" description="This case hasn't started processing." />
  }
  return (
    <ul className="tw-steps">
      {steps.map((step) => {
        const presentation = getStepStatusPresentation(step.status)
        return (
          <li key={step.step} className="tw-step-row">
            <div className="tw-step-main">
              <span className="tw-step-name">{formatWorkflowStage(step.step)}</span>
              {step.reason && <span className="tw-step-reason">{step.reason}</span>}
            </div>
            <StatusBadge tone={presentation.tone} label={presentation.label} />
          </li>
        )
      })}
    </ul>
  )
}

// ── Tab content components ───────────────────────────────────────────

function OverviewTab({
  detail,
  evidence,
  inventory,
}: {
  detail: TicketDetail
  evidence: ReturnType<typeof useTicketPreview>['evidence']
  inventory: ReturnType<typeof useTicketPreview>['inventory']
}) {
  return (
    <div className="tw-overview-grid">
      <div className="tw-card tw-card-primary">
        <h2 className="tw-card-title">Event Summary</h2>
        <MetaGrid>
          <MetaItem label="Drug" value={detail.drug_name} />
          <MetaItem label="NDC" value={detail.ndc} mono />
          <MetaItem label="Lot" value={detail.lot} mono />
          <MetaItem label="Recall number" value={detail.recall_number} mono />
          <MetaItem label="Classification" value={formatClassification(detail.classification)} />
          <MetaItem label="Priority" value={detail.priority} />
          <MetaItem label="Review type" value={formatReviewType(detail.review_type)} />
        </MetaGrid>

        <h2 className="tw-card-title tw-card-title-spaced">Workflow Progress</h2>
        <StepTracker steps={detail.steps} />
      </div>

      <div className="tw-status-stack">
        <StatusCard
          title="Inventory Impact"
          badge={inventory.kind === 'ready' && <StatusBadge {...getInventoryMatchPresentation(inventory.data)} />}
        >
          {inventory.kind === 'loading' && <p className="tw-status-card-text tw-muted">Checking inventory…</p>}
          {inventory.kind === 'unavailable' && (
            <p className="tw-status-card-text tw-muted">Not yet available.</p>
          )}
          {inventory.kind === 'error' && <p className="tw-status-card-text tw-danger-text">Couldn't load.</p>}
          {inventory.kind === 'ready' && isInventoryMatched(inventory.data) && (
            <p className="tw-status-card-text">
              {inventory.data.impact_result.total_quantity} units across{' '}
              {inventory.data.impact_result.affected_departments.length} department(s)
            </p>
          )}
          {inventory.kind === 'ready' && !isInventoryMatched(inventory.data) && (
            <p className="tw-status-card-text tw-muted">No matching NDC or lot in inventory.</p>
          )}
        </StatusCard>

        <StatusCard
          title="Evidence Readiness"
          badge={evidence.kind === 'ready' && <StatusBadge {...getEvidenceStatusPresentation(evidence.data.evidence_status)} />}
        >
          {evidence.kind === 'loading' && <p className="tw-status-card-text tw-muted">Checking evidence…</p>}
          {evidence.kind === 'unavailable' && (
            <p className="tw-status-card-text tw-muted">Not yet available.</p>
          )}
          {evidence.kind === 'error' && <p className="tw-status-card-text tw-danger-text">Couldn't load.</p>}
          {evidence.kind === 'ready' && (
            <p className="tw-status-card-text">
              {evidence.data.coverage_score !== null
                ? `${Math.round(evidence.data.coverage_score * 100)}% coverage`
                : 'Coverage unavailable'}
              {evidence.data.weak_sources.length > 0 && ` · ${evidence.data.weak_sources.length} weak source(s)`}
            </p>
          )}
        </StatusCard>

        <StatusCard title="Next Step">
          <p className="tw-status-card-text">{getRecommendedNextStep(detail, evidence, inventory)}</p>
        </StatusCard>
      </div>
    </div>
  )
}

function InventoryTab({ inventory }: { inventory: ReturnType<typeof useTicketPreview>['inventory'] }) {
  if (inventory.kind === 'loading') return <p className="tw-status-text">Loading inventory impact…</p>
  if (inventory.kind === 'unavailable') {
    return <EmptyState title="No inventory data" description="This case has no inventory data yet." />
  }
  if (inventory.kind === 'error') {
    return <EmptyState title="Couldn't load inventory" description={inventory.message} />
  }

  const data: InventoryImpact = inventory.data
  if (!isInventoryMatched(data)) {
    return (
      <EmptyState
        title="No inventory match"
        description={data.message || 'No matching NDC or lot was found in the current inventory snapshot.'}
      />
    )
  }

  const departmentEntries = Object.entries(data.impact_result.department_breakdown)

  return (
    <div className="tw-tab-grid">
      <div className="tw-card">
        <h2 className="tw-card-title">Match Result</h2>
        <MetaGrid>
          <MetaItem label="Match type" value={formatMatchType(data.match_result.match_type)} />
          <MetaItem label="Confidence" value={`${Math.round(data.match_result.match_confidence * 100)}%`} />
          <MetaItem label="Identity review needed" value={data.match_result.needs_identity_review ? 'Yes' : 'No'} />
        </MetaGrid>
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Impact</h2>
        <MetaGrid>
          <MetaItem label="Total quantity" value={data.impact_result.total_quantity} />
          <MetaItem label="Priority" value={data.impact_result.priority} />
          <MetaItem label="Urgent" value={data.impact_result.urgent ? data.impact_result.urgent_reason : 'No'} />
        </MetaGrid>
        {departmentEntries.length > 0 && (
          <ul className="tw-tag-list tw-tag-list-spaced">
            {departmentEntries.map(([department, quantity]) => (
              <li key={department} className="tw-tag tw-tag-neutral">
                {department} · {quantity}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Quality Check</h2>
        <MetaGrid>
          <MetaItem label="Confidence" value={`${Math.round(data.quality_result.confidence * 100)}%`} />
          <MetaItem label="Review required" value={data.quality_result.review_required ? 'Yes' : 'No'} />
        </MetaGrid>
        {data.quality_result.flags.length > 0 && (
          <ul className="tw-tag-list tw-tag-list-spaced">
            {data.quality_result.flags.map((flag) => (
              <li key={flag} className="tw-tag tw-tag-warning">
                {flag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function EvidenceTab({ evidence }: { evidence: ReturnType<typeof useTicketPreview>['evidence'] }) {
  if (evidence.kind === 'loading') return <p className="tw-status-text">Loading evidence…</p>
  if (evidence.kind === 'unavailable') {
    return <EmptyState title="No evidence snapshot" description="This case has no evidence data yet." />
  }
  if (evidence.kind === 'error') {
    return <EmptyState title="Couldn't load evidence" description={evidence.message} />
  }

  const data: EvidenceSnapshot = evidence.data
  const presentation = getEvidenceStatusPresentation(data.evidence_status)

  return (
    <div className="tw-tab-grid">
      <div className="tw-card">
        <div className="tw-card-head">
          <h2 className="tw-card-title">Sufficiency</h2>
          <StatusBadge {...presentation} />
        </div>
        <MetaGrid>
          <MetaItem
            label="Coverage"
            value={data.coverage_score !== null ? `${Math.round(data.coverage_score * 100)}%` : '—'}
          />
          <MetaItem
            label="Citations ready"
            value={data.citations_ready === null ? '—' : data.citations_ready ? 'Yes' : 'No'}
          />
        </MetaGrid>
        {data.required_sources.length > 0 && (
          <>
            <p className="tw-tag-list-label">Required sources</p>
            <TagList items={data.required_sources} tone="neutral" />
          </>
        )}
        {data.found_sources.length > 0 && (
          <>
            <p className="tw-tag-list-label">Found sources</p>
            <TagList items={data.found_sources} tone="neutral" />
          </>
        )}
      </div>

      {data.weak_sources.length > 0 && (
        <div className="tw-card tw-card-warning">
          <h2 className="tw-card-title">Weak Sources</h2>
          <TagList items={data.weak_sources} tone="warning" />
        </div>
      )}

      {data.missing_sources.length > 0 && (
        <div className="tw-card tw-card-danger">
          <h2 className="tw-card-title">Missing Sources</h2>
          <TagList items={data.missing_sources} tone="danger" />
        </div>
      )}

      {data.failure_reasons.length > 0 && (
        <div className="tw-card">
          <h2 className="tw-card-title">Failure Reasons</h2>
          <ul className="tw-plain-list">
            {data.failure_reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ReportTab() {
  // Dummy until /reports/{ticket_id} is wired up.
  return (
    <div className="tw-tab-grid">
      <div className="tw-card">
        <div className="tw-card-head">
          <h2 className="tw-card-title">Latest Version</h2>
          <span className="tw-tag tw-tag-neutral tw-mono">{DUMMY_REPORT.version_tag}</span>
        </div>
        <p className="tw-status-card-text">{DUMMY_REPORT.summary}</p>
      </div>
      <div className="tw-card">
        <h2 className="tw-card-title">Recommended Action</h2>
        <p className="tw-status-card-text tw-muted">{DUMMY_REPORT.recommended_review_action}</p>
      </div>
    </div>
  )
}

function HistoryTab() {
  // Dummy until /audit/{ticket_id} is wired up.
  return (
    <ul className="tw-timeline">
      {DUMMY_HISTORY.map((entry) => {
        const presentation = getStepStatusPresentation(entry.status)
        return (
          <li key={entry.title} className="tw-timeline-item">
            <div className="tw-timeline-head">
              <span className="tw-timeline-title">{entry.title}</span>
              <StatusBadge {...presentation} />
            </div>
            <p className="tw-timeline-message">{entry.message}</p>
          </li>
        )
      })}
    </ul>
  )
}

// ── Header + tabs ─────────────────────────────────────────────────────

function WorkspaceHeader({ detail }: { detail: TicketDetail }) {
  const status = getStatusPresentation(detail.status)
  return (
    <div className="ticket-workspace-header">
      <h1 className="ticket-workspace-name">{detail.drug_name}</h1>
      <div className="ticket-workspace-meta-row">
        <span className="ticket-workspace-id" title={detail.ticket_id}>
          {detail.ticket_id}
        </span>
        <StatusBadge tone={status.tone} label={status.label} />
        <span className="tw-tag tw-tag-neutral">{formatWorkflowStage(detail.workflow_stage)}</span>
      </div>
    </div>
  )
}

function WorkspaceTabs({ activeTab, onSelect }: { activeTab: TabId; onSelect: (tab: TabId) => void }) {
  return (
    <div className="tw-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tw-tab ${activeTab === tab.id ? 'tw-tab-selected' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
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

      {detail.kind === 'loading' && <p className="tw-status-text">Loading case…</p>}

      {detail.kind === 'unavailable' && (
        <EmptyState title="Case not found" description={`Case ${ticketId} was not found.`} />
      )}

      {detail.kind === 'error' && (
        <EmptyState title="Couldn't load this case" description={detail.message} />
      )}

      {detail.kind === 'ready' && (
        <>
          <WorkspaceHeader detail={detail.data} />
          <WorkspaceTabs activeTab={activeTab} onSelect={setActiveTab} />

          <div className="tw-tab-panel">
            {activeTab === 'overview' && (
              <OverviewTab detail={detail.data} evidence={evidence} inventory={inventory} />
            )}
            {activeTab === 'inventory' && <InventoryTab inventory={inventory} />}
            {activeTab === 'evidence' && <EvidenceTab evidence={evidence} />}
            {activeTab === 'report' && <ReportTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>
        </>
      )}
    </div>
  )
}

// Full Ticket Workspace tabs render from real data (useTicketPreview) except
// Report/History, which still use local dummy data until /reports/{ticket_id}
// and /audit/{ticket_id} are wired up — see docs/PAGES.md.
function TicketWorkspace() {
  const { ticketId } = useParams<{ ticketId: string }>()

  return (
    <AppShell title="Ticket Workspace">
      {ticketId ? <TicketWorkspaceContent key={ticketId} ticketId={ticketId} /> : null}
    </AppShell>
  )
}

export default TicketWorkspace
