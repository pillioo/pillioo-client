import { useSyncExternalStore } from 'react'

// Matches DESIGN.md's "Mobile Large" breakpoint, where the Safety Inbox
// collapses from list+preview into a single column.
const MOBILE_QUERY = '(max-width: 768px)'

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
