import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductEntrance from './pages/ProductEntrance'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductEntrance />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App