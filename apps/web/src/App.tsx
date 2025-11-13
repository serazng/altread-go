import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { TabNavigation } from './components/layout/TabNavigation'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="page-container">
          <TabNavigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
