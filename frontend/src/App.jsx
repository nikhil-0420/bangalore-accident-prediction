import { useState } from 'react'
import CityGrid from './components/CityGrid'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PredictionPanel from './components/PredictionPanel'
import StatsPanel from './components/StatsPanel'
import TrendsPanel from './components/TrendsPanel'
import HotspotsPanel from './components/HotspotsPanel'

export default function App() {
  const [activeTab, setActiveTab] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e' }}>
      <CityGrid />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {!activeTab && (
        <Hero setActiveTab={setActiveTab} />
      )}

      {activeTab && (
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