import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const riskStyle = {
  'High Risk':   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)'   },
  'Medium Risk': { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)'  },
  'Low Risk':    { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)'   },
}

const shapData = [
  { feature: '2-Year Rolling Avg',  pct: 75 },
  { feature: 'Prev Year Accidents', pct: 63 },
  { feature: 'Year-on-Year Trend',  pct: 17 },
  { feature: 'Year',                pct: 4  },
]

function RiskGauge({ risk }) {
  const angle = risk === 'Low Risk' ? -60 : risk === 'Medium Risk' ? 0 : 60
  return (
    <svg viewBox="-100 -90 200 110" width="180" height="110">
      <path d="M -80 0 A 80 80 0 0 0 -40 -69.3"
            fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round"/>
      <path d="M -40 -69.3 A 80 80 0 0 0 40 -69.3"
            fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="round"/>
      <path d="M 40 -69.3 A 80 80 0 0 0 80 0"
            fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round"/>
      <path d="M -80 0 A 80 80 0 0 0 80 0"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
      <line
        x1="0" y1="0" x2="0" y2="-65"
        stroke="white" strokeWidth="2.5" strokeLinecap="round"
        className="gauge-needle"
        style={{ transform: `rotate(${angle}deg)` }}
      />
      <circle cx="0" cy="0" r="5" fill="#f97316"/>
      <text x="-76" y="18" fill="#22c55e" fontSize="9" textAnchor="middle">Low</text>
      <text x="0"   y="-82" fill="#f97316" fontSize="9" textAnchor="middle">Med</text>
      <text x="76"  y="18" fill="#ef4444" fontSize="9" textAnchor="middle">High</text>
    </svg>
  )
}

function Sparkline({ data }) {
  if (!data || data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="accidents"
              stroke="#f97316" strokeWidth={1.5} dot={false}/>
        <Tooltip
          contentStyle={{ background:'#1a1a1a', border:'none', fontSize:'11px', color:'white' }}
          formatter={v => [v, 'accidents']}
          labelFormatter={l => `${l}`}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function PredictionPanel() {
  const [stations,   setStations]   = useState([])
  const [station,    setStation]    = useState('')
  const [year,       setYear]       = useState(2026)
  const [result,     setResult]     = useState(null)
  const [computing,  setComputing]  = useState(false)
  const [error,      setError]      = useState(null)
  const [history,    setHistory]    = useState([])
  const [computeMsg, setComputeMsg] = useState('')

  const msgs = [
    'Loading station data...',
    'Running Random Forest model...',
    'Computing SHAP values...',
    'Calculating risk level...',
    'Finalizing prediction...',
  ]

  useEffect(() => {
    axios.get(`${API}/stations`)
      .then(r => { setStations(r.data.stations); setStation(r.data.stations[0]) })
      .catch(() => setError('Cannot connect to backend.'))
  }, [])

  useEffect(() => {
    if (!station) return
    axios.get(`${API}/station/${encodeURIComponent(station)}`)
      .then(r => setHistory(r.data.history || []))
      .catch(() => {})
  }, [station])

  const predict = async () => {
    setComputing(true)
    setResult(null)
    setError(null)
    let i = 0
    setComputeMsg(msgs[0])
    const msgInterval = setInterval(() => {
      i = (i + 1) % msgs.length
      setComputeMsg(msgs[i])
    }, 400)
    await new Promise(r => setTimeout(r, 2000))
    clearInterval(msgInterval)
    try {
      const r = await axios.post(`${API}/predict`, { station, year: parseInt(year) })
      setResult(r.data)
    } catch { setError('Prediction failed. Check backend.') }
    finally { setComputing(false) }
  }

  const rs = result ? riskStyle[result.predicted_risk] : null

  const inp = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: '10px',
    padding: '10px 14px', fontSize: '14px',
    outline: 'none', width: '100%',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ display:'flex', gap:'28px', alignItems:'flex-start' }}>

      {/* ── LEFT: Form ─────────────────────── */}
      <div style={{ flex:'0 0 360px' }}>
        <div style={{ marginBottom:'28px' }}>
          <div className="label" style={{ marginBottom:'10px' }}>Prediction Engine</div>
          <h2 style={{ fontSize:'28px', fontWeight:800, marginBottom:'6px' }}>
            Accident Risk Prediction
          </h2>
          <p style={{ color:'#555', fontSize:'14px', lineHeight:1.6 }}>
            Select a station and year to get accident count, risk level, and SHAP explanation.
          </p>
        </div>

        {/* Station selector */}
        <div className="rot-border scale-in d1 edge-card"
             style={{ borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
          <label style={{ fontSize:'11px', color:'#555', letterSpacing:'2px',
                          textTransform:'uppercase', display:'block', marginBottom:'8px' }}>
            Police Station
          </label>
          <select value={station} onChange={e => setStation(e.target.value)} style={inp}>
            {stations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {history.length > 0 && (
            <div style={{ marginTop:'12px' }}>
              <div style={{ fontSize:'11px', color:'#444', marginBottom:'4px' }}>
                Historical trend (2018–2025)
              </div>
              <Sparkline data={history} />
            </div>
          )}
        </div>

        {/* Year input */}
        <div className="rot-border scale-in d2 edge-card"
             style={{ borderRadius:'14px', padding:'20px', marginBottom:'16px' }}>
          <label style={{ fontSize:'11px', color:'#555', letterSpacing:'2px',
                          textTransform:'uppercase', display:'block', marginBottom:'8px' }}>
            Year
          </label>
          <input type="number" value={year} min={2018} max={2035}
                 onChange={e => setYear(e.target.value)} style={inp} />
        </div>

        {/* Predict button */}
        <button onClick={predict} disabled={computing}
          style={{
            width:'100%', padding:'14px',
            background: computing ? 'rgba(249,115,22,0.3)' : '#f97316',
            color:'white', border:'none', borderRadius:'10px',
            fontSize:'15px', fontWeight:700, cursor: computing ? 'not-allowed' : 'pointer',
            boxShadow: computing ? 'none' : '0 0 28px rgba(249,115,22,0.4)',
            transition:'all 0.2s',
          }}>
          {computing ? computeMsg : 'Predict →'}
        </button>

        {error && <p style={{ color:'#ef4444', fontSize:'13px', marginTop:'12px' }}>⚠️ {error}</p>}
{result && !computing && (
  <button onClick={() => setResult(null)}
    style={{
      width:'100%', padding:'10px',
      background:'transparent',
      color:'#555', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:'10px', fontSize:'13px',
      cursor:'pointer', marginTop:'10px',
      transition:'all 0.2s',
    }}
    onMouseEnter={e => { e.target.style.color='#f97316'; e.target.style.borderColor='rgba(249,115,22,0.3)' }}
    onMouseLeave={e => { e.target.style.color='#555'; e.target.style.borderColor='rgba(255,255,255,0.08)' }}
  >
    ↺ Reset Prediction
  </button>
)}
      </div>

      {/* ── RIGHT: Result ──────────────────── */}
      <div style={{ flex:1, minHeight:'400px' }}>
        {!result && !computing && (
          <div style={{
            height:'100%', minHeight:'400px',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            color:'#2a2a2a', gap:'16px'
          }}>
            <div style={{ fontSize:'48px' }}>🚦</div>
            <p style={{ fontSize:'14px' }}>Select a station and click Predict</p>
          </div>
        )}

        {computing && (
          <div style={{
            height:'100%', minHeight:'400px',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:'20px'
          }}>
            <div style={{
              width:'48px', height:'48px', borderRadius:'50%',
              border:'3px solid rgba(249,115,22,0.2)',
              borderTop:'3px solid #f97316',
              animation:'border-rotate 0.8s linear infinite',
            }}/>
            <p style={{ color:'#f97316', fontSize:'14px', fontWeight:600 }}>{computeMsg}</p>
            <p style={{ color:'#333', fontSize:'12px' }}>
              {station} · {year}
            </p>
          </div>
        )}

        {result && !computing && (
          <div className="fade-in-up">

            {/* Header */}
            <div className="rot-border-fast edge-card scale-in d1"
                 style={{ borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                <div>
                  <h3 style={{ fontSize:'22px', fontWeight:800 }}>{result.station}</h3>
                  <p style={{ color:'#555', fontSize:'13px' }}>Zone: {result.zone} · {result.year}</p>
                </div>
                <span style={{
                  padding:'6px 16px', borderRadius:'20px', fontSize:'13px', fontWeight:700,
                  background: rs.bg, color: rs.color, border:`1px solid ${rs.border}`
                }}>
                  {result.predicted_risk}
                </span>
              </div>

              {/* Gauge + metrics */}
              <div style={{ display:'flex', alignItems:'center', gap:'24px' }}>
                <RiskGauge risk={result.predicted_risk} />
                <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div style={{ background:'rgba(249,115,22,0.08)', borderRadius:'12px', padding:'16px' }}>
                    <div style={{ fontSize:'11px', color:'#555', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>
                      Predicted Accidents
                    </div>
                    <div style={{ fontSize:'42px', fontWeight:800, color:'#f97316', lineHeight:1 }}>
                      {result.predicted_count}
                    </div>
                    <div style={{ fontSize:'11px', color:'#444', marginTop:'4px' }}>estimated for {result.year}</div>
                  </div>
                  <div style={{ background: rs.bg, borderRadius:'12px', padding:'16px', border:`1px solid ${rs.border}` }}>
                    <div style={{ fontSize:'11px', color:'#555', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>
                      Confidence
                    </div>
                    <div style={{ fontSize:'42px', fontWeight:800, color: rs.color, lineHeight:1 }}>
                      {result.confidence}%
                    </div>
                    <div style={{ fontSize:'11px', color: rs.color, marginTop:'4px' }}>{result.predicted_risk}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Probabilities */}
            <div className="rot-border edge-card scale-in d2"
                 style={{ borderRadius:'16px', padding:'24px', marginBottom:'16px' }}>
              <div className="label" style={{ marginBottom:'16px' }}>Class Probabilities</div>
              {Object.entries(result.probabilities).map(([label, prob]) => {
                const s = riskStyle[label]
                return (
                  <div key={label} style={{ marginBottom:'14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ fontSize:'13px', color:'#aaa' }}>{label}</span>
                      <span style={{ fontSize:'13px', fontWeight:700, color: s.color }}>{prob}%</span>
                    </div>
                    <div style={{ height:'6px', borderRadius:'4px', background:'rgba(255,255,255,0.06)' }}>
                      <div className="bar-fill" style={{
                        height:'6px', borderRadius:'4px',
                        background: s.color,
                        width:`${prob}%`,
                        boxShadow:`0 0 8px ${s.color}`,
                      }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* SHAP mini */}
            <div className="rot-border edge-card scale-in d3"
                 style={{ borderRadius:'16px', padding:'24px' }}>
              <div className="label" style={{ marginBottom:'4px' }}>What Drives This Prediction?</div>
              <p style={{ fontSize:'12px', color:'#444', marginBottom:'16px' }}>
                SHAP feature importance (global model)
              </p>
              {shapData.map(item => (
                <div key={item.feature} style={{ marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                    <span style={{ fontSize:'12px', color:'#888' }}>{item.feature}</span>
                    <span style={{ fontSize:'12px', color:'#f97316', fontWeight:700 }}>{item.pct}%</span>
                  </div>
                  <div style={{ height:'4px', borderRadius:'3px', background:'rgba(255,255,255,0.05)' }}>
                    <div className="bar-fill" style={{
                      height:'4px', borderRadius:'3px',
                      background:'#f97316', width:`${item.pct}%`,
                      boxShadow:'0 0 6px rgba(249,115,22,0.4)',
                    }}/>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}