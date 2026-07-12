import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProductEntrance from './pages/ProductEntrance'
import SafetyInbox from './pages/SafetyInbox'
import TicketWorkspace from './pages/TicketWorkspace'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductEntrance />} />
        <Route path="/app" element={<SafetyInbox />} />
        <Route path="/app/tickets/:ticketId" element={<TicketWorkspace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
