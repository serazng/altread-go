import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { TabNavigation } from './components/layout/TabNavigation'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-primary">
        <div className="max-w-[900px] mx-auto px-6 pt-12 overflow-visible md:px-12 md:pt-16 lg:px-24 lg:pt-24 lg:pb-12">
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
