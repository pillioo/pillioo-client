import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getTicketDetail, getTicketEvidence, getReportVersions } from '../api/ticketsService'
import { approveTicket, getReviewPayload, rejectTicket, reviseTicket, reviseTicketWithLlm } from '../api/review'
import type { EvidenceSnapshot, ReportVersion, TicketDetail } from '../api/types'
import StatusBadge from '../components/StatusBadge'
import EvidenceCard from '../components/EvidenceCard'
import { getStatusPresentation } from '../lib/ticketPresentation'
import './PharmacistReview.css'

type LoadState<T> =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: T }

type ActionMode = 'approve' | 'reject' | 'revise' | 'revise-llm' | null

const REVIEWER_NAME = 'pharmacist'

function PharmacistReview() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState<LoadState<TicketDetail>>({ kind: 'loading' })
  const [reviewReady, setReviewReady] = useState<LoadState<true>>({ kind: 'loading' })
  const [reportVersions, setReportVersions] = useState<LoadState<ReportVersion[]>>({ kind: 'loading' })
  const [evidence, setEvidence] = useState<LoadState<EvidenceSnapshot>>({ kind: 'loading' })

  const [mode, setMode] = useState<ActionMode>(null)
  const [comment, setComment] = useState('')
  const [revisedDraft, setRevisedDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [decided, setDecided] = useState(false)

  useEffect(() => {
    if (!ticketId) return

    getTicketDetail(ticketId)
      .then((data) => setTicket({ kind: 'ready', data }))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setTicket({ kind: 'unavailable' })
        else setTicket({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
      })

    getReviewPayload(ticketId)
      .then(() => setReviewReady({ kind: 'ready', data: true }))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setReviewReady({ kind: 'unavailable' })
        else setReviewReady({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
      })

    getReportVersions(ticketId)
      .then((data) => setReportVersions({ kind: 'ready', data }))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setReportVersions({ kind: 'unavailable' })
        else setReportVersions({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
      })

    getTicketEvidence(ticketId)
      .then((data) => setEvidence({ kind: 'ready', data }))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setEvidence({ kind: 'unavailable' })
        else setEvidence({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
      })
  }, [ticketId])

  const latestReport = useMemo(() => {
    if (reportVersions.kind !== 'ready' || reportVersions.data.length === 0) return null
    return reportVersions.data[reportVersions.data.length - 1]
  }, [reportVersions])

  const alreadyDecided =
    decided ||
    (ticket.kind === 'ready' && (ticket.data.status === 'APPROVED' || ticket.data.status === 'REJECTED'))

  if (!ticketId) return null

  async function handleSubmit() {
    if (!ticketId) return
    setSubmitError(null)

    if (mode === 'reject' && comment.trim() === '') {
      setSubmitError('A comment is required for all rejections.')
      return
    }
    if (mode === 'revise' && revisedDraft.trim() === '') {
      setSubmitError('Please enter the revised draft.')
      return
    }
    if (mode === 'revise-llm' && comment.trim() === '') {
      setSubmitError('Please enter the comments for the LLM.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'approve') {
        await approveTicket(ticketId, { reviewer: REVIEWER_NAME, comment: comment || undefined })
      } else if (mode === 'reject') {
        await rejectTicket(ticketId, { reviewer: REVIEWER_NAME, comment })
      } else if (mode === 'revise') {
        await reviseTicket(ticketId, { reviewer: REVIEWER_NAME, revised_draft: revisedDraft, comment: comment || undefined })
      } else if (mode === 'revise-llm') {
        await reviseTicketWithLlm(ticketId, { reviewer: REVIEWER_NAME, reviewer_comment: comment })
      }
      setDecided(true)
      setMode(null)
      setComment('')
      setRevisedDraft('')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred while processing your request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (ticket.kind === 'loading' || reviewReady.kind === 'loading') {
    return (
      <div className="pr-workspace">
        <p className="pr-status-text">Loading review…</p>
      </div>
    )
  }

  if (ticket.kind === 'unavailable' || reviewReady.kind === 'unavailable') {
    return (
      <div className="pr-workspace">
        <Link className="pr-back" to={`/app/tickets/${ticketId}`}>
          ← Back to Workspace
        </Link>
        <p className="pr-status-text">
          This case is not ready for review yet.
        </p>
      </div>
    )
  }

  if (ticket.kind === 'error') {
    return (
      <div className="pr-workspace">
        <p className="pr-status-text pr-error">Failed to load the case.  {ticket.message}</p>
      </div>
    )
  }

  const t = ticket.data
  const status = getStatusPresentation(t.status)

  return (
    <div className="pr-workspace">
      <Link className="pr-back" to={`/app/tickets/${ticketId}`}>
        ← Back to Workspace
      </Link>

      <header className="pr-header">
        <div className="pr-header-row">
          <h1 className="pr-title">{t.drug_name}</h1>
          <StatusBadge tone={status.tone} label={status.label} />
        </div>
        <span className="pr-id">{t.ticket_id}</span>
      </header>

      <div className="pr-grid">
        <div className="pr-column">
          <section className="pr-card">
            <h2 className="pr-card-title">Draft / Report</h2>
            {reportVersions.kind === 'loading' && <p className="pr-muted">Loading report…</p>}
            {reportVersions.kind === 'unavailable' && <p className="pr-muted">No report has been generated yet. </p>}
            {reportVersions.kind === 'error' && <p className="pr-error">Failed to load the report. </p>}
            {latestReport && (
              <div className="pr-report-body">
                <span className="pr-version-tag">{latestReport.version_tag}</span>
                {latestReport.report ? (
                  <>
                    <p className="pr-report-summary">{latestReport.report.summary}</p>
                    <h3 className="pr-subheading">Recommended Review Action</h3>
                    <p>{latestReport.report.recommended_review_action}</p>
                    {latestReport.report.pharmacist_checklist.length > 0 && (
                      <>
                        <h3 className="pr-subheading">Pharmacist Checklist</h3>
                        <ul className="pr-list">
                          {latestReport.report.pharmacist_checklist.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {latestReport.report.safety_notes.length > 0 && (
                      <>
                        <h3 className="pr-subheading">Safety Notes</h3>
                        <ul className="pr-list">
                          {latestReport.report.safety_notes.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {latestReport.report.limitations.length > 0 && (
                      <>
                        <h3 className="pr-subheading">Limitations</h3>
                        <ul className="pr-list">
                          {latestReport.report.limitations.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <p className="pr-report-text">{latestReport.report_text}</p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="pr-column">
          <section className="pr-card">
            <h2 className="pr-card-title">Supporting Evidence</h2>
            {evidence.kind === 'loading' && <p className="pr-muted">Loading evidence…</p>}
            {evidence.kind === 'unavailable' && <p className="pr-muted">No supporting information is available yet. </p>}
            {evidence.kind === 'error' && <p className="pr-error">Failed to load the supporting information. </p>}
            {evidence.kind === 'ready' && evidence.data.selected_chunks.length === 0 && (
              <p className="pr-muted">No supporting chunk is selected. </p>
            )}
            {evidence.kind === 'ready' &&
              evidence.data.selected_chunks.map((chunk, i) => (
                <EvidenceCard
                  key={i}
                  chunk={chunk}
                  requiredSources={evidence.data.required_sources}
                  weakSources={evidence.data.weak_sources}
                  failureReasons={evidence.data.failure_reasons}
                  primary={i === 0}
                />
              ))}
          </section>
        </div>
      </div>

      <section className="pr-card pr-action-card">
        <h2 className="pr-card-title">Reviewer Decision</h2>

        {alreadyDecided ? (
          <p className="pr-status-text">This case has already been decided (read-only)</p>
        ) : (
          <>
            <div className="pr-mode-tabs">
              <button className={`pr-mode-tab${mode === 'approve' ? ' is-selected' : ''}`} onClick={() => setMode('approve')}>
                Approve
              </button>
              <button className={`pr-mode-tab${mode === 'reject' ? ' is-selected' : ''}`} onClick={() => setMode('reject')}>
                Reject
              </button>
              <button className={`pr-mode-tab${mode === 'revise' ? ' is-selected' : ''}`} onClick={() => setMode('revise')}>
                Revise
              </button>
              <button className={`pr-mode-tab${mode === 'revise-llm' ? ' is-selected' : ''}`} onClick={() => setMode('revise-llm')}>
                Revise with LLM
              </button>
            </div>

            {mode && (
              <div className="pr-action-form">
                {mode === 'revise' && (
                  <textarea
                    className="pr-textarea"
                    placeholder="Enter the full revised draft"
                    value={revisedDraft}
                    onChange={(e) => setRevisedDraft(e.target.value)}
                    rows={8}
                  />
                )}
                <textarea
                  className="pr-textarea"
                  placeholder={
                    mode === 'reject'
                      ? 'Enter the reason for rejection (required)'
                      : mode === 'revise-llm'
                        ? 'Enter instructions for the LLM (required)'
                        : 'Comment (optional)'
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                {submitError && <p className="pr-error">{submitError}</p>}
                <div className="pr-action-buttons">
                  <button className="pr-btn-secondary" onClick={() => setMode(null)} disabled={submitting}>
                    Cancel
                  </button>
                  <button className="pr-btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {decided && (
          <div className="pr-decided-note">
            <p>Submitted successfully</p>
            <button className="pr-btn-secondary" onClick={() => navigate(`/app/tickets/${ticketId}`)}>
              Back to Workspace
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default PharmacistReview