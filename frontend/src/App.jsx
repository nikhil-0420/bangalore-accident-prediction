import { useState, useEffect } from 'react'
import axios from 'axios'
import WakingUp from './components/WakingUp'
import CityGrid from './components/CityGrid'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PredictionPanel from './components/PredictionPanel'
import StatsPanel from './components/StatsPanel'
import TrendsPanel from './components/TrendsPanel'
import HotspotsPanel from './components/HotspotsPanel'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [activeTab, setActiveTab] = useState(null)
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    const checkBackend = () => {
      axios.get(`${API}/`)
        .then(() => setBackendReady(true))
        .catch(() => setTimeout(checkBackend, 2000))
    }
    checkBackend()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e' }}>
      <CityGrid />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {!backendReady && <WakingUp />}

      {backendReady && !activeTab && (
        <Hero setActiveTab={setActiveTab} />
      )}

      {backendReady && activeTab && (
        <div
          key={activeTab}
          className="page-enter"
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '88px 24px 48px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setActiveTab(null)}
            style={{
              background: 'none', border: 'none',
              color: '#444', fontSize: '13px',
              cursor: 'pointer', marginBottom: '28px',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#f97316'}
            onMouseLeave={e => e.target.style.color = '#444'}
          >
            ← Back to Home
          </button>

          {activeTab === 'predict'  && <PredictionPanel />}
          {activeTab === 'stats'    && <StatsPanel />}
          {activeTab === 'trends'   && <TrendsPanel />}
          {activeTab === 'hotspots' && <HotspotsPanel />}
        </div>
      )}
    </div>
  )
}