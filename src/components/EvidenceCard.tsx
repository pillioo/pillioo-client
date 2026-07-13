import { useState } from 'react'
import type { EvidenceChunk, EvidenceFailureReason } from '../api/types'
import { AlertTriangleIcon, CheckCircleIcon, ChevronIcon, DocumentIcon, QuoteIcon, TargetIcon } from './EvidenceIcons'
import { parseEvidenceContent, truncateText, type EvidenceContentSection } from '../lib/evidenceContent'
import {
  formatFilterLevel,
  formatPercentScore,
  formatRankReason,
  getChunkSourceStatus,
  getEvidenceRoleLabel,
  getEvidenceTitle,
  getIdentifierMatch,
  getSourceFileName,
} from '../lib/ticketPresentation'
import './EvidenceCard.css'

// selected_chunks[].content is a retrieved evidence excerpt, not the full
// source document (the backend exposes no endpoint to fetch the original
// document — see EvidenceTab). These bounds keep the card compact: below
// the threshold there's nothing to expand; the expanded view is still
// capped per section, never the entire chunk, so one source can't dominate
// the page.
const SECTION_PREVIEW_THRESHOLD = 260
const SECTION_EXPANDED_LIMIT = 700

interface EvidenceCardProps {
  chunk: EvidenceChunk
  requiredSources: string[]
  weakSources: string[]
  failureReasons: (string | EvidenceFailureReason)[]
  primary: boolean
}

function EvidenceCard({ chunk, requiredSources, weakSources, failureReasons, primary }: EvidenceCardProps) {
  const [expanded, setExpanded] = useState(false)

  const sections = parseEvidenceContent(chunk.content ?? '')
  const metadataFields = sections
    .filter((section): section is Extract<EvidenceContentSection, { kind: 'metadata' }> => section.kind === 'metadata')
    .flatMap((section) => section.fields)
  const contentSections = sections.filter(
    (section): section is Extract<EvidenceContentSection, { kind: 'content' }> => section.kind === 'content',
  )
  const [firstSection, ...restSections] = contentSections
  const canExpand = Boolean(firstSection && firstSection.body.length > SECTION_PREVIEW_THRESHOLD) || restSections.length > 0

  const sourceStatus = getChunkSourceStatus(chunk, { requiredSources, weakSources, failureReasons })
  const identifierMatch = getIdentifierMatch(chunk)
  const title = getEvidenceTitle(chunk)
  const fileName = getSourceFileName(chunk.source_path)

  return (
    <div className={`evidence-card${primary ? ' evidence-card-primary' : ''}`}>
      {/* 1. Header: role, status, title, source attribution */}
      <div className="evidence-card-header">
        <div className="evidence-card-header-top">
          <span className="evidence-card-role">
            <DocumentIcon /> {getEvidenceRoleLabel(chunk.document_type)}
          </span>
          <span className={`evidence-card-status-badge evidence-card-tone-${sourceStatus.tone}`}>
            {sourceStatus.tone === 'warning' ? <AlertTriangleIcon /> : <CheckCircleIcon />}
            {sourceStatus.label}
          </span>
        </div>
        <h3 className="evidence-card-title">{title}</h3>
        <p className="evidence-card-meta-line">
          Source file: {fileName}
          {chunk.section ? ` · ${chunk.section}` : ''}
        </p>
      </div>

      {/* 2. Identifier match panel */}
      <div className="evidence-card-panel">
        <p className="evidence-card-panel-heading">
          <TargetIcon /> Identifier match
        </p>
        <p className={`evidence-card-panel-status evidence-card-tone-${identifierMatch.tone}`}>
          {identifierMatch.label}
        </p>
        <p className="evidence-card-panel-detail">{identifierMatch.detail}</p>
      </div>

      {/* 3. Supporting excerpt: parsed metadata grid + content sections,
          never the whole chunk rendered as one flat paragraph. */}
      {(metadataFields.length > 0 || firstSection) && (
        <div className="evidence-card-excerpt-panel">
          <p className="evidence-card-panel-heading">
            <QuoteIcon /> Supporting excerpt
          </p>

          {metadataFields.length > 0 && (
            <dl className="evidence-card-metadata-grid">
              {metadataFields.map((field, i) => (
                <div className="evidence-card-metadata-row" key={`${field.label}-${i}`}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {firstSection && (
            <div className="evidence-card-content-section">
              {firstSection.heading && <p className="evidence-card-section-heading">{firstSection.heading}</p>}
              <p className={`evidence-card-section-body${expanded ? '' : ' is-clamped'}`}>
                {expanded ? truncateText(firstSection.body, SECTION_EXPANDED_LIMIT) : firstSection.body}
              </p>
            </div>
          )}

          {expanded &&
            restSections.map((section, i) => (
              <div className="evidence-card-content-section" key={`${section.heading ?? 'section'}-${i}`}>
                {section.heading && <p className="evidence-card-section-heading">{section.heading}</p>}
                <p className="evidence-card-section-body">{truncateText(section.body, SECTION_EXPANDED_LIMIT)}</p>
              </div>
            ))}

          {canExpand && (
            <button type="button" className="evidence-card-toggle" onClick={() => setExpanded((value) => !value)}>
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* 4. Technical details */}
      <details className="evidence-card-details">
        <summary>
          <ChevronIcon className="evidence-card-details-chevron" />
          Technical details
        </summary>

        <dl className="evidence-card-details-grid">
          <dt>Similarity score</dt>
          <dd>{formatPercentScore(chunk.similarity_score)}</dd>

          <dt>Rank score</dt>
          <dd>{chunk.rank_score === null ? '—' : chunk.rank_score.toFixed(3)}</dd>

          <dt>Filter level</dt>
          <dd>{formatFilterLevel(chunk.filter_level)}</dd>

          <dt>Lexical overlap score</dt>
          <dd>{formatPercentScore(chunk.lexical_overlap_score)}</dd>
        </dl>

        <div className="evidence-card-details-block">
          <p className="evidence-card-details-block-label">Source path</p>
          <p className="evidence-card-details-block-value evidence-card-mono">{chunk.source_path || '—'}</p>
        </div>
        <div className="evidence-card-details-block">
          <p className="evidence-card-details-block-label">Rank reasons</p>
          <p className="evidence-card-details-block-value">
            {chunk.rank_reasons.length > 0 ? chunk.rank_reasons.map(formatRankReason).join(' · ') : 'None'}
          </p>
        </div>
        <div className="evidence-card-details-block">
          <p className="evidence-card-details-block-label">Lexical overlap terms</p>
          <p className="evidence-card-details-block-value">
            {chunk.lexical_overlap_terms.length > 0 ? chunk.lexical_overlap_terms.join(', ') : 'None'}
          </p>
        </div>

        <details className="evidence-card-raw">
          <summary>Raw chunk JSON</summary>
          <pre>{JSON.stringify(chunk, null, 2)}</pre>
        </details>
      </details>
    </div>
  )
}

export default EvidenceCard
