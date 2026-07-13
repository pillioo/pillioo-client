import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { listTickets } from '../api/ticketsService'
import type { TicketListFilters, TicketListItem } from '../api/types'
import AppShell from '../components/AppShell'
import TicketList from '../components/TicketList'
import TicketPreview from '../components/TicketPreview'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useIsMobile } from '../hooks/useIsMobile'
import './SafetyInbox.css'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

interface FilterChip {
  key: string
  label: string
  params: TicketListFilters
}

const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'All', params: {} },
  { key: 'needs-review', label: 'Needs review', params: { status: 'REVIEW_ROUTED' } },
  {
    key: 'final-approval',
    label: 'Final approval',
    params: { status: 'REVIEW_ROUTED', review_type: 'final_approval' },
  },
  { key: 'high-priority', label: 'High priority', params: { priority: 'HIGH' } },
  { key: 'failed', label: 'Failed', params: { status: 'WORKFLOW_FAILED' } },
  { key: 'approved', label: 'Approved', params: { status: 'APPROVED' } },
]

type ListState =
  | { kind: 'loading' }
  | { kind: 'ready'; tickets: TicketListItem[]; total: number }
  | { kind: 'error'; message: string }

function SafetyInbox() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const initialFilterKey = searchParams.get('filter') ?? 'all'
  const [activeFilterKey, setActiveFilterKey] = useState(
    FILTER_CHIPS.some((chip) => chip.key === initialFilterKey) ? initialFilterKey : 'all',
  )
  const [searchInput, setSearchInput] = useState('')
  const debouncedQuery = useDebouncedValue(searchInput, 300)

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const activeChip = FILTER_CHIPS.find((chip) => chip.key === activeFilterKey) ?? FILTER_CHIPS[0]

  // listResult remembers which (filterKey, query, reloadToken) combination it
  // was fetched for. State is only ever written inside the async .then/.catch
  // callbacks; a stale result (one whose combination no longer matches the
  // current inputs) is treated as loading below instead of being shown.
  interface ListResult {
    filterKey: string
    query: string
    reloadToken: number
    state: ListState
  }
  const [listResult, setListResult] = useState<ListResult>({
    filterKey: activeFilterKey,
    query: debouncedQuery,
    reloadToken,
    state: { kind: 'loading' },
  })

  useEffect(() => {
    let cancelled = false

    listTickets({ ...activeChip.params, q: debouncedQuery || undefined })
      .then((response) => {
        if (cancelled) return
        setListResult({
          filterKey: activeFilterKey,
          query: debouncedQuery,
          reloadToken,
          state: { kind: 'ready', tickets: response.items, total: response.total },
        })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message =
          error instanceof ApiError
            ? `Server responded with ${error.status}.`
            : 'Could not reach the Pillioo backend.'
        setListResult({ filterKey: activeFilterKey, query: debouncedQuery, reloadToken, state: { kind: 'error', message } })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilterKey, debouncedQuery, reloadToken])

  const listState: ListState =
    listResult.filterKey === activeFilterKey &&
    listResult.query === debouncedQuery &&
    listResult.reloadToken === reloadToken
      ? listResult.state
      : { kind: 'loading' }

  const effectiveSelectedTicketId =
    listState.kind === 'ready' && listState.tickets.length > 0
      ? listState.tickets.some((ticket) => ticket.ticket_id === selectedTicketId)
        ? selectedTicketId
        : listState.tickets[0].ticket_id
      : null

  function handleSelect(ticketId: string) {
    if (isMobile) {
      navigate(`/app/tickets/${ticketId}`)
    } else {
      setSelectedTicketId(ticketId)
    }
  }

  const isSearchOrFilterActive = activeFilterKey !== 'all' || debouncedQuery.length > 0

  // "Needs review" is a filter chip within the Inbox, not a separate nav
  // destination — only the empty-state copy is tailored to it.
  const isReviewQueue = activeFilterKey === 'needs-review'

    return (
    <AppShell title="Safety Inbox">
      <div className="safety-inbox">
        <div className="safety-inbox-list-pane">
          <h1 className="safety-inbox-title">Safety Inbox</h1>
          <div className="safety-inbox-controls">
            <input
              type="search"
              className="safety-inbox-search"
              placeholder="Search cases…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search cases"
            />
            <Link to="/app/events/upload" className="safety-inbox-upload-btn">
              Upload Event
            </Link>
            <div className="safety-inbox-chips" role="group" aria-label="Status filters">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={`safety-inbox-chip ${chip.key === activeFilterKey ? 'is-active' : ''}`}
                  onClick={() => setActiveFilterKey(chip.key)}
                  aria-pressed={chip.key === activeFilterKey}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {listState.kind === 'loading' && (
            <p className="safety-inbox-status-text">Loading cases…</p>
          )}

          {listState.kind === 'error' && (
            <div className="safety-inbox-status-text safety-inbox-error">
              <p>Couldn't load the Safety Inbox. {listState.message}</p>
              <button type="button" className="safety-inbox-retry" onClick={() => setReloadToken((n) => n + 1)}>
                Retry
              </button>
            </div>
          )}

          {listState.kind === 'ready' && listState.tickets.length === 0 && isReviewQueue && !debouncedQuery && (
            <p className="safety-inbox-status-text">
              No cases need review right now. New cases will appear here as they're routed for review.
            </p>
          )}

          {listState.kind === 'ready' &&
            listState.tickets.length === 0 &&
            !isSearchOrFilterActive && (
              <p className="safety-inbox-status-text">
                No cases yet. New drug safety events will appear here as they're detected.
              </p>
            )}

          {listState.kind === 'ready' &&
            listState.tickets.length === 0 &&
            isSearchOrFilterActive &&
            !(isReviewQueue && !debouncedQuery) && (
              <p className="safety-inbox-status-text">No cases match this search or filter.</p>
            )}

          {listState.kind === 'ready' && listState.tickets.length > 0 && (
            <TicketList
              tickets={listState.tickets}
              selectedTicketId={effectiveSelectedTicketId}
              onSelect={handleSelect}
            />
          )}
        </div>

        {!isMobile && effectiveSelectedTicketId && (
          <div className="safety-inbox-preview-pane">
            <TicketPreview key={effectiveSelectedTicketId} ticketId={effectiveSelectedTicketId} />
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default SafetyInbox
