// The only module pages/components should import ticket data functions from.
// Swaps between the real API client and the isolated mock adapter based on a
// single explicit env flag. Real API stays the default so backend failures
// surface as real error states instead of being silently masked by mock data
// (see docs/PRODUCT.md: "Workflow failures should be visible and understandable").
//
// To develop against mock data without a running backend:
//   VITE_USE_MOCK_TICKETS=true npm run dev
import * as mockTickets from './mockTickets'
import * as realTickets from './tickets'

const useMock = import.meta.env.VITE_USE_MOCK_TICKETS === 'true'

const impl = useMock ? mockTickets : realTickets

export const listTickets = impl.listTickets
export const getTicketDetail = impl.getTicketDetail
export const getTicketEvidence = impl.getTicketEvidence
export const getInventoryImpact = impl.getInventoryImpact
