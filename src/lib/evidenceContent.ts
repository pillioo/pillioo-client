// Evidence chunk `content` (see EvidenceChunk in api/types.ts) is
// markdown-flavored, assembled by the backend by concatenating structured
// fields under headers like "## source_summary" / "## affected_product"
// (see docs/rag-datasets.md source documents). Rendered as one flattened
// string it reads like "## source_summary Recall number... ## affected_
// product...". This module parses it into structured sections for the
// Evidence tab source cards instead:
//   - key:value-style sections (e.g. source_summary) become a compact
//     metadata grid
//   - long-form sections (e.g. affected_product, reason_for_recall) become
//     separate labeled content sections
// Output is plain text only — never fed through a markdown renderer or
// dangerouslySetInnerHTML — and this never mutates the original chunk (see
// EvidenceCard, which keeps chunk.content untouched for the raw JSON debug
// view).

export interface EvidenceContentField {
  label: string
  value: string
}

export type EvidenceContentSection =
  | { kind: 'metadata'; heading: string | null; fields: EvidenceContentField[] }
  | { kind: 'content'; heading: string | null; body: string }

// "Label: value" — label starts with a letter, stays short (metadata labels
// aren't full sentences), value is whatever follows.
const METADATA_LINE = /^([A-Za-z][A-Za-z0-9 /_-]{1,40}):\s+(.+)$/

function humanizeMarkdownLabel(token: string): string {
  const words = token.split(/[-_]+/).filter(Boolean)
  if (words.length === 0) return token
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function stripInlineMarkers(text: string): string {
  let out = text
  out = out.replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
  out = out.replace(/\*\*([^*]+)\*\*/g, '$1')
  return out
}

// Splits normalized text into (heading token, body) pairs. Headings are
// recognized as "#{1,6} single_snake_case_token" — only the token itself is
// captured (not trailing prose), so this stays safe even when the source has
// no newline between a heading and the paragraph that follows it. Text
// before the first recognized heading becomes an untitled leading block.
function splitIntoRawBlocks(text: string): { heading: string | null; body: string }[] {
  const HEADING = /#{1,6}\s*([a-zA-Z0-9_]+)\s*/g
  const blocks: { heading: string | null; body: string }[] = []
  let lastIndex = 0
  let lastHeading: string | null = null
  let match: RegExpExecArray | null

  while ((match = HEADING.exec(text)) !== null) {
    const body = text.slice(lastIndex, match.index)
    if (lastHeading !== null || body.trim()) blocks.push({ heading: lastHeading, body })
    lastHeading = match[1]
    lastIndex = HEADING.lastIndex
  }
  blocks.push({ heading: lastHeading, body: text.slice(lastIndex) })

  return blocks.filter((block) => block.heading !== null || block.body.trim())
}

// A block is treated as metadata when most of its non-empty lines match the
// "Label: value" pattern — this is a content heuristic (works for whichever
// heading happens to hold key:value fields), not a fixed heading allowlist.
function classifyAsMetadata(body: string): EvidenceContentField[] | null {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return null

  const fields: EvidenceContentField[] = []
  let matched = 0
  for (const line of lines) {
    const m = line.match(METADATA_LINE)
    if (m) {
      matched += 1
      fields.push({ label: m[1].trim(), value: stripInlineMarkers(m[2].trim()) })
    }
  }
  if (matched === 0 || matched / lines.length < 0.6) return null
  return fields
}

function normalizeProse(body: string): string {
  return body
    .split('\n')
    .map((line) => stripInlineMarkers(line.replace(/[ \t]+/g, ' ').trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function parseEvidenceContent(raw: string): EvidenceContentSection[] {
  if (!raw) return []

  // Some backend paths round-trip content through a JSON layer that leaves
  // literal backslash-escaped breaks ("\\n") instead of real newline bytes.
  let text = raw.replace(/\\r\\n|\\n|\\r/g, '\n')
  text = text.replace(/\r\n?/g, '\n')
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '') // horizontal rules

  const sections: EvidenceContentSection[] = []
  for (const block of splitIntoRawBlocks(text)) {
    const heading = block.heading ? humanizeMarkdownLabel(block.heading) : null
    const fields = classifyAsMetadata(block.body)
    if (fields) {
      sections.push({ kind: 'metadata', heading, fields })
      continue
    }
    const prose = normalizeProse(block.body)
    if (prose) sections.push({ kind: 'content', heading, body: prose })
  }

  return sections
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}…`
}
