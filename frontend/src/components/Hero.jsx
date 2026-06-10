import { useEffect, useState } from 'react'
import { useScramble } from '../hooks/useScramble'

function ScrambleStat({ value, label }) {
  const [started, setStarted] = useState(false)
  const display = useScramble(started ? value : null, 3500)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '32px', fontWeight: 800,
        color: '#f97316', fontVariantNumeric: 'tabular-nums',
        minWidth: '80px'
      }}>
        {started ? display : '--'}
      </div>
      <div style={{
        fontSize: '11px', color: '#444',
        textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px'
      }}>
        {label}
      </div>
    </div>
  )
}

export default function Hero({ setActiveTab }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 24px',
      position: 'relative',
      zIndex: 10,
    }}>

      {/* Label */}
      <div className={`label scale-in d1`} style={{ marginBottom: '20px' }}>
        Machine Learning · Explainable AI · Alliance University
      </div>

      {/* Title */}
      <h1 className="scale-in d2" style={{
        fontSize: 'clamp(40px, 6vw, 68px)',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '20px',
        opacity: 0,
      }}>
        Bangalore Accident<br />
        <span style={{ color: '#f97316' }}>Risk Predictor</span>
      </h1>

      {/* Subtitle */}
      <p className="scale-in d3" style={{
        color: '#555', fontSize: '17px',
        maxWidth: '540px', lineHeight: 1.7,
        marginBottom: '40px', opacity: 0,
      }}>
        Predicting road accident hotspots across 52 Bangalore
        police stations using Random Forest, XGBoost, and
        SHAP explainability.
      </p>

      {/* Buttons */}
      <div className="scale-in d4" style={{
        display: 'flex', gap: '16px',
        marginBottom: '72px', opacity: 0,
      }}>
        <button onClick={() => setActiveTab('predict')}
          style={{
            background: '#f97316', color: '#fff',
            border: 'none', padding: '14px 36px',
            borderRadius: '10px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 0 32px rgba(249,115,22,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.boxShadow = '0 0 48px rgba(249,115,22,0.7)'}
          onMouseLeave={e => e.target.style.boxShadow = '0 0 32px rgba(249,115,22,0.4)'}
        >
          Run Prediction →
        </button>
        <button onClick={() => setActiveTab('hotspots')}
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 36px', borderRadius: '10px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(249,115,22,0.1)'
            e.target.style.borderColor = 'rgba(249,115,22,0.3)'
          }}
          onMouseLeave={e => {
            e.target.style.background = 'rgba(255,255,255,0.04)'
            e.target.style.borderColor = 'rgba(255,255,255,0.1)'
          }}
        >
          View Hotspot Map
        </button>
      </div>

      {/* Scramble Stats */}
      <div className="scale-in d5" style={{
        display: 'flex', gap: '64px',
        opacity: 0,
      }}>
        <ScrambleStat value="52"    label="Police Stations" />
        <ScrambleStat value="8 yrs" label="Crash Data"      />
        <ScrambleStat value="0.859" label="R² Score"        />
        <ScrambleStat value="0.799" label="F1 Score"        />
      </div>

      {/* Bottom tag */}
      <p style={{
        position: 'absolute', bottom: '24px',
        fontSize: '11px', color: '#2a2a2a',
      }}>
        Guddanti Nikhil Srinivas · Alliance University Bengaluru
      </p>
    </div>
  )
}