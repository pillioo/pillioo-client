import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ChatDrawer from '../components/ChatDrawer'
import EmptyState from '../components/EmptyState'
import EvidenceCard from '../components/EvidenceCard'
import StatusBadge from '../components/StatusBadge'
import { useTicketPreview } from '../hooks/useTicketPreview'
import {
  buildSourceChecklist,
  formatAbsoluteDateTime,
  formatChecklistStatus,
  formatCitationsReadiness,
  formatClassification,
  formatFailureReason,
  formatMatchType,
  formatRelativeTime,
  formatReviewType,
  formatSourceCoverageLevel,
  formatVersionTag,
  formatWorkflowStage,
  getChecklistStatusTone,
  getEvidenceReadiness,
  getEvidenceStatusPresentation,
  getInventoryMatchPresentation,
  getRecommendedNextStep,
  getSourceCoverageLevel,
  getStatusPresentation,
  getStepStatusPresentation,
  sortChunksForDisplay,
} from '../lib/ticketPresentation'
import { isInventoryMatched } from '../api/types'
import type {
  Classification,
  DraftReport,
  EvidenceFailureReason,
  EvidenceSnapshot,
  InventoryImpact,
  ReportVersion,
  TicketDetail,
  WorkflowStepStatus,
} from '../api/types'
import './TicketWorkspace.css'

type TabId = 'overview' | 'inventory' | 'evidence' | 'report' | 'history'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'report', label: 'Report' },
  { id: 'history', label: 'History' },
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

// failure_reasons entries are normally structured objects (see
// EvidenceFailureReason), but legacy tickets can still return plain
// strings — formatFailureReason() normalizes either shape.
function renderFailureReason(reason: string | EvidenceFailureReason, index: number): ReactNode {
  const { text, context } = formatFailureReason(reason)
  return (
    <li key={index}>
      {text}
      {context && <span className="tw-muted"> — {context}</span>}
    </li>
  )
}

function SourceChecklist({ data }: { data: EvidenceSnapshot }) {
  const entries = buildSourceChecklist(data)
  if (entries.length === 0) return null

  return (
    <div className="tw-card">
      <h2 className="tw-card-title">Source Checklist</h2>
      <ul className="tw-evidence-checklist">
        {entries.map((entry) => (
          <li key={entry.documentType} className="tw-evidence-checklist-row">
            <span className="tw-evidence-checklist-label">{entry.label}</span>
            <StatusBadge tone={getChecklistStatusTone(entry.status)} label={formatChecklistStatus(entry.status)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function EvidenceTab({ evidence }: { evidence: ReturnType<typeof useTicketPreview>['evidence'] }) {
  if (evidence.kind === 'loading') return <p className="tw-status-text">Loading evidence…</p>

  // A 404 from GET /tickets/{ticket_id}/evidence means no evidence snapshot
  // has ever been produced for this ticket — distinct from a snapshot that
  // exists but selected zero chunks (handled below as a normal ready state).
  if (evidence.kind === 'unavailable') {
    return (
      <EmptyState
        title="No evidence snapshot yet"
        description="This case hasn't produced an evidence snapshot yet. Run or resume the workflow to retrieve evidence."
      />
    )
  }

  if (evidence.kind === 'error') {
    return <EmptyState title="Couldn't load evidence" description={evidence.message} />
  }

  const data: EvidenceSnapshot = evidence.data
  const readiness = getEvidenceReadiness(data.evidence_status)
  const coverageLevel = getSourceCoverageLevel(data)
  const hasChunks = data.selected_chunks.length > 0
  const hasRetrievalTrace =
    Object.keys(data.retrieval_trace ?? {}).length > 0 ||
    Object.keys(data.retrieval_plan ?? {}).length > 0 ||
    Object.keys(data.retrieval_context ?? {}).length > 0

  return (
    <div className="tw-stack">
      {/* 1. Evidence readiness: translated evidence_status / coverage_score / citations_ready */}
      <div className={`tw-evidence-summary tw-evidence-summary-${readiness.tone}`}>
        <div className="tw-evidence-summary-head">
          <span className="tw-evidence-summary-label">Evidence readiness</span>
          <StatusBadge {...readiness} />
        </div>
        <div className="tw-evidence-summary-stats">
          <div className="tw-evidence-stat">
            <span className="tw-evidence-stat-label">Source coverage</span>
            <span className="tw-evidence-stat-value">{formatSourceCoverageLevel(coverageLevel)}</span>
          </div>
          <div className="tw-evidence-stat">
            <span className="tw-evidence-stat-label">Citations</span>
            <span className="tw-evidence-stat-value">{formatCitationsReadiness(data.citations_ready)}</span>
          </div>
        </div>
        {data.evidence_status === 'insufficient' && (
          <p className="tw-evidence-summary-note">
            This case needs additional evidence before it's ready for pharmacist review. This is a normal
            workflow state — review the source checklist and evidence limitations below.
          </p>
        )}
      </div>

      {/* 2. Source checklist: required/found/missing/weak sources, translated */}
      <SourceChecklist data={data} />

      {/* Evidence limitations: failure_reasons, in plain language */}
      {data.failure_reasons.length > 0 && (
        <div className="tw-card">
          <h2 className="tw-card-title">Evidence Limitations</h2>
          <ul className="tw-plain-list">
            {data.failure_reasons.map((r, i) => renderFailureReason(r, i))}
          </ul>
        </div>
      )}

      {/* 3. Supporting evidence: selected_chunks as pharmacist-facing source cards */}
      <div className="tw-evidence-sources">
        <h2 className="tw-card-title">Supporting Evidence{hasChunks ? ` (${data.selected_chunks.length})` : ''}</h2>
        {hasChunks ? (
          <div className="tw-evidence-source-grid">
            {sortChunksForDisplay(data.selected_chunks).map((chunk, i) => (
              <EvidenceCard
                key={`${chunk.source_path}-${chunk.chunk_index ?? i}`}
                chunk={chunk}
                requiredSources={data.required_sources}
                weakSources={data.weak_sources}
                failureReasons={data.failure_reasons}
                primary={Object.keys(chunk.matched_identifiers ?? {}).length > 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sources selected"
            description="An evidence snapshot exists for this case, but no source chunks were selected."
          />
        )}
      </div>

      {/* Snapshot-level retrieval diagnostics — kept out of the primary view.
          Per-source technical details live inside each EvidenceCard instead,
          so this only covers trace/plan/context, not chunk data again. */}
      {hasRetrievalTrace && (
        <details className="tw-details tw-evidence-debug">
          <summary>Technical retrieval trace</summary>
          <div className="tw-evidence-debug-body">
            <details className="tw-evidence-debug-raw">
              <summary>Retrieval trace (raw)</summary>
              <pre className="tw-evidence-debug-pre">{JSON.stringify(data.retrieval_trace, null, 2)}</pre>
            </details>
            <details className="tw-evidence-debug-raw">
              <summary>Retrieval plan (raw)</summary>
              <pre className="tw-evidence-debug-pre">{JSON.stringify(data.retrieval_plan, null, 2)}</pre>
            </details>
            <details className="tw-evidence-debug-raw">
              <summary>Retrieval context (raw)</summary>
              <pre className="tw-evidence-debug-pre">{JSON.stringify(data.retrieval_context, null, 2)}</pre>
            </details>
          </div>
        </details>
      )}
    </div>
  )
}

function VersionSelector({
  versions,
  selectedId,
  onSelect,
}: {
  versions: ReportVersion[]
  selectedId: number
  onSelect: (id: number) => void
}) {
  if (versions.length <= 1) return null
  return (
    <div className="tw-version-tabs" role="tablist" aria-label="Report version">
      {versions.map((version) => (
        <button
          key={version.id}
          type="button"
          role="tab"
          aria-selected={version.id === selectedId}
          className={`tw-version-tab ${version.id === selectedId ? 'is-selected' : ''}`}
          onClick={() => onSelect(version.id)}
        >
          {formatVersionTag(version.version_tag)}
        </button>
      ))}
    </div>
  )
}

function DraftReportView({ report }: { report: DraftReport }) {
  const rawClassification = report.event_classification ?? report.affected_product.classification
  const classificationLabel = rawClassification
    ? formatClassification(rawClassification as Classification) ?? rawClassification
    : null

  return (
    <div className="tw-stack">
      <div className="tw-card">
        <h2 className="tw-card-title">{report.title}</h2>
        <p className="tw-status-card-text">{report.summary}</p>
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Affected Product</h2>
        <MetaGrid>
          <MetaItem label="Drug" value={report.affected_product.drug_name} />
          <MetaItem label="NDC" value={report.affected_product.ndc} mono />
          <MetaItem label="Lot" value={report.affected_product.lot} mono />
          <MetaItem label="Classification" value={classificationLabel} />
        </MetaGrid>
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Inventory Impact</h2>
        <MetaGrid>
          <MetaItem label="Matched" value={report.inventory_impact.matched ? 'Yes' : 'No'} />
          <MetaItem label="Total quantity" value={report.inventory_impact.total_quantity} />
          <MetaItem label="Priority" value={report.inventory_impact.priority} />
        </MetaGrid>
        {report.inventory_impact.affected_departments.length > 0 && (
          <ul className="tw-tag-list tw-tag-list-spaced">
            {report.inventory_impact.affected_departments.map((department) => (
              <li key={department} className="tw-tag tw-tag-neutral">
                {department}
              </li>
            ))}
          </ul>
        )}
        {report.inventory_impact.uncertainty && (
          <p className="tw-status-card-text tw-muted">{report.inventory_impact.uncertainty}</p>
        )}
      </div>

      <div className="tw-card">
        <h2 className="tw-card-title">Evidence Summary</h2>
        <MetaGrid>
          <MetaItem label="Coverage" value={`${Math.round(report.evidence_summary.coverage_score * 100)}%`} />
        </MetaGrid>
        {report.evidence_summary.missing_sources.length > 0 && (
          <>
            <p className="tw-tag-list-label">Missing sources</p>
            <TagList items={report.evidence_summary.missing_sources} tone="danger" />
          </>
        )}
        {report.evidence_summary.key_findings.length > 0 && (
          <ul className="tw-plain-list">
            {report.evidence_summary.key_findings.map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        )}
      </div>

      <StatusCard title="Recommended Action">
        <p className="tw-status-card-text">{report.recommended_review_action}</p>
      </StatusCard>

      {report.pharmacist_checklist.length > 0 && (
        <div className="tw-card">
          <h2 className="tw-card-title">Pharmacist Checklist</h2>
          <ul className="tw-plain-list">
            {report.pharmacist_checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {report.citations.length > 0 && (
        <div className="tw-card">
          <h2 className="tw-card-title">Citations</h2>
          <ul className="tw-citation-list">
            {report.citations.map((citation, index) => (
              <li key={`${citation.source}-${index}`} className="tw-citation">
                <p className="tw-citation-sentence">&ldquo;{citation.sentence}&rdquo;</p>
                <p className="tw-citation-source">
                  {citation.source} · {citation.section} · {Math.round(citation.score * 100)}% match
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(report.safety_notes.length > 0 || report.pharmacist_notes.length > 0 || report.limitations.length > 0) && (
        <div className="tw-card">
          {report.safety_notes.length > 0 && (
            <details className="tw-details">
              <summary>Safety Notes</summary>
              <ul className="tw-plain-list">
                {report.safety_notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          )}
          {report.pharmacist_notes.length > 0 && (
            <details className="tw-details">
              <summary>Pharmacist Notes</summary>
              <ul className="tw-plain-list">
                {report.pharmacist_notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          )}
          {report.limitations.length > 0 && (
            <details className="tw-details">
              <summary>Limitations</summary>
              <ul className="tw-plain-list">
                {report.limitations.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

function ReportTab({ reportVersions }: { reportVersions: ReturnType<typeof useTicketPreview>['reportVersions'] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  if (reportVersions.kind === 'loading') return <p className="tw-status-text">Loading report…</p>
  if (reportVersions.kind === 'unavailable' || (reportVersions.kind === 'ready' && reportVersions.data.length === 0)) {
    return <EmptyState title="No report yet" description="This case hasn't produced a report yet." />
  }
  if (reportVersions.kind === 'error') {
    return <EmptyState title="Couldn't load report" description={reportVersions.message} />
  }

  // Versions are ordered oldest -> newest; the last one is the latest.
  const versions = reportVersions.data
  const latest = versions[versions.length - 1]
  const selected = versions.find((version) => version.id === selectedId) ?? latest

  return (
    <div className="tw-stack">
      <div className="tw-report-head">
        <VersionSelector versions={versions} selectedId={selected.id} onSelect={setSelectedId} />
        <div className="tw-report-meta">
          <span className="tw-tag tw-tag-neutral tw-mono">{formatVersionTag(selected.version_tag)}</span>
          <span className="tw-status-text" title={formatAbsoluteDateTime(selected.created_at)}>
            Generated {formatRelativeTime(selected.created_at)}
          </span>
          {selected.created_by && <span className="tw-status-text tw-muted">by {selected.created_by}</span>}
        </div>
      </div>

      {selected.approved_by && (
        <div className="tw-card tw-card-success">
          <p className="tw-status-card-text">
            Approved by {selected.approved_by}
            {selected.approved_at && ` on ${formatAbsoluteDateTime(selected.approved_at)}`}
            {selected.approval_comment && ` — "${selected.approval_comment}"`}
          </p>
        </div>
      )}

      {selected.report ? (
        <DraftReportView report={selected.report} />
      ) : (
        <div className="tw-card">
          <h2 className="tw-card-title">Report</h2>
          <p className="tw-status-card-text tw-report-text">{selected.report_text}</p>
        </div>
      )}
    </div>
  )
}

function HistoryTab({ audit }: { audit: ReturnType<typeof useTicketPreview>['audit'] }) {
  if (audit.kind === 'loading') return <p className="tw-status-text">Loading history…</p>
  if (audit.kind === 'unavailable') {
    return <EmptyState title="No audit trail" description="This case has no audit history yet." />
  }
  if (audit.kind === 'error') {
    return <EmptyState title="Couldn't load history" description={audit.message} />
  }

  const entries = audit.data
  if (entries.length === 0) {
    return <EmptyState title="No audit trail" description="This case hasn't started processing yet." />
  }

  return (
    <ul className="tw-timeline">
      {entries.map((entry, i) => {
        const presentation = getStepStatusPresentation(entry.status)
        return (
          <li key={`${entry.step_name}-${i}`} className="tw-timeline-item">
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
      <div className="ticket-workspace-header-row">
        <h1 className="ticket-workspace-name">{detail.drug_name}</h1>
        <ChatDrawer ticketId={detail.ticket_id} />
      </div>
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
  const { detail, evidence, inventory, audit, reportVersions } = useTicketPreview(ticketId)
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
            {activeTab === 'report' && <ReportTab reportVersions={reportVersions} />}
            {activeTab === 'history' && <HistoryTab audit={audit} />}
          </div>
        </>
      )}
    </div>
  )
}

// Full Ticket Workspace tabs render from real data (useTicketPreview):
// Overview, Inventory, Evidence, Report (GET /reports/{ticket_id}/versions),
// and History (GET /audit/{ticket_id}) — see docs/PAGES.md.
function TicketWorkspace() {
  const { ticketId } = useParams<{ ticketId: string }>()

  return (
    <AppShell title="Ticket Workspace">
      {ticketId ? <TicketWorkspaceContent key={ticketId} ticketId={ticketId} /> : null}
    </AppShell>
  )
}

export default TicketWorkspace