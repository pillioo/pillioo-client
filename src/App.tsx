import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductEntrance from './pages/ProductEntrance'
import SafetyInbox from './pages/SafetyInbox'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductEntrance />} />
        <Route path="/app" element={<SafetyInbox />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App