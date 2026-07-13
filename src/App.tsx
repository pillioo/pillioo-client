import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProductEntrance from './pages/ProductEntrance'
import SafetyInbox from './pages/SafetyInbox'
import TicketWorkspace from './pages/TicketWorkspace'
import PharmacistReview from './pages/PharmacistReview'
import EventUpload from './pages/EventUpload'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductEntrance />} />
        <Route path="/app" element={<SafetyInbox />} />
        <Route path="/app/tickets/:ticketId" element={<TicketWorkspace />} />
        <Route path="/app/tickets/:ticketId/review" element={<PharmacistReview />} />
        <Route path="/app/events/upload" element={<EventUpload />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
