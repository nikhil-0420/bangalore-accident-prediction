import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  BarChart, Bar
} from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const COLORS = ['#f97316','#06b6d4','#22c55e','#8b5cf6','#ef4444','#f59e0b','#ec4899','#64748b']
const YEARS  = [2018,2019,2020,2021,2022,2023,2024,2025]

const tt = {
  contentStyle: {
    background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'white', fontSize: '12px'
  }
}

function Card({ children, delay = 'd1', style = {} }) {
  return (
    <div className={`rot-border edge-card scale-in ${delay}`}
         style={{ borderRadius: '16px', padding: '24px', ...style }}>
      {children}
    </div>
  )
}

export default function TrendsPanel() {
  const [data,      setData]      = useState([])
  const [zones,     setZones]     = useState([])
  const [zoneA,     setZoneA]     = useState('')
  const [zoneB,     setZoneB]     = useState('')
  const [yoyData,   setYoyData]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [wakeSeconds, setWakeSeconds] = useState(0)

  const inp = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: '8px',
    padding: '8px 12px', fontSize: '13px', outline: 'none',
  }

  const loadTrends = () => {
    let cancelled = false
    let attempt = 0
    setLoading(true)
    setError(null)
    setWakeSeconds(0)

    const tick = setInterval(() => {
      if (!cancelled) setWakeSeconds(s => s + 1)
    }, 1000)

    const tryFetch = () => {
      attempt += 1
      axios.get(`${API}/trends`, { timeout: 12000 }).then(r => {
        if (cancelled) return
        const raw = r.data.trends
        const zoneNames = raw.map(z => z.Zone)
        setZones(zoneNames)
        setZoneA(zoneNames[0] || '')
        setZoneB(zoneNames[1] || '')

        const formatted = YEARS.map(yr => {
          const pt = { year: yr }
          raw.forEach(z => { pt[z.Zone] = z[`Y${yr}`] || 0 })
          return pt
        })
        setData(formatted)

        const yoy = zoneNames.map(zone => {
          const vals = YEARS.map(yr => {
            const row = raw.find(z => z.Zone === zone)
            return row ? (row[`Y${yr}`] || 0) : 0
          })
          const change = vals[vals.length-1] - vals[vals.length-2]
          const pct    = vals[vals.length-2] > 0
            ? ((change / vals[vals.length-2]) * 100).toFixed(1)
            : '0.0'
          return { zone, latest: vals[vals.length-1], change, pct }
        })
        setYoyData(yoy)
        setLoading(false)
        clearInterval(tick)
      }).catch(() => {
        if (cancelled) return
        // Render free-tier cold-start can take 20-30s — retry before
        // surfacing a hard error, same pattern as PredictionPanel.
        if (attempt < 6) {
          setTimeout(tryFetch, 5000)
        } else {
          setLoading(false)
          clearInterval(tick)
          setError('Could not load trend data. The backend may still be waking up — try again.')
        }
      })
    }
    tryFetch()
    return () => { cancelled = true; clearInterval(tick) }
  }

  useEffect(() => { loadTrends() }, [])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column',
              alignItems:'center', gap:'16px', padding:'60px 0' }}>
      <div style={{
        width:'40px', height:'40px', borderRadius:'50%',
        border:'3px solid rgba(249,115,22,0.2)',
        borderTop:'3px solid #f97316',
        animation:'border-rotate 0.8s linear infinite',
      }}/>
      <p style={{ color:'#555', fontSize:'13px' }}>
        {wakeSeconds > 3
          ? `Waking up the backend (free-tier hosting sleeps after inactivity) — ${wakeSeconds}s elapsed`
          : 'Loading trend data...'}
      </p>
    </div>
  )

  if (error) return (
    <div style={{ display:'flex', flexDirection:'column',
              alignItems:'center', gap:'14px', padding:'60px 0', textAlign:'center' }}>
      <p style={{ color:'#ef4444', fontSize:'14px' }}>{error}</p>
      <button onClick={loadTrends} style={{
        background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)',
        color:'#f97316', borderRadius:'8px', padding:'10px 20px',
        fontSize:'13px', cursor:'pointer',
      }}>
        Retry
      </button>
    </div>
  )

  const compareData = YEARS.map((yr, i) => ({
    year: yr,
    [zoneA]: data[i]?.[zoneA] || 0,
    [zoneB]: data[i]?.[zoneB] || 0,
  }))

  // Derive COVID summary stats from the same live data the chart uses,
  // instead of hardcoding them — so this card can't silently drift out
  // of sync if the underlying data ever changes.
  const totalsByYear = YEARS.map(yr => {
    const row = data.find(d => d.year === yr)
    return row ? zones.reduce((sum, z) => sum + (row[z] || 0), 0) : 0
  })
  const peakYearIdx = totalsByYear.indexOf(Math.max(...totalsByYear))
  const peakYear = YEARS[peakYearIdx]
  const covidYears = [2020, 2021].filter(y => YEARS.includes(y))
  const lowestCovidYear = covidYears.reduce((a, b) => {
    const totalA = totalsByYear[YEARS.indexOf(a)]
    const totalB = totalsByYear[YEARS.indexOf(b)]
    return totalB < totalA ? b : a
  }, covidYears[0])
  const postCovidYears = YEARS.filter(y => y > 2021)
  const recoveryYear = postCovidYears.reduce((best, yr) => {
    const idx = YEARS.indexOf(yr)
    const bestIdx = YEARS.indexOf(best)
    return totalsByYear[idx] > totalsByYear[bestIdx] ? yr : best
  }, postCovidYears[0] || 2023)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* Header */}
      <div className="scale-in d1">
        <div className="label" style={{ marginBottom:'8px' }}>Analysis</div>
        <h2 style={{ fontSize:'32px', fontWeight:800, marginBottom:'6px' }}>
          Year-wise Accident Trends
        </h2>
        <p style={{ color:'#555', fontSize:'14px' }}>
          Zone-level accident counts from 2018 to 2025 with COVID impact analysis
        </p>
      </div>

      {/* ── Main Trend Chart ─────────────────── */}
      <Card delay="d2">
        <div className="label" style={{ marginBottom:'4px' }}>Zone Trends</div>
        <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'6px' }}>
          Accidents by Zone (2018–2025)
        </h3>
        <p style={{ fontSize:'12px', color:'#444', marginBottom:'20px' }}>
          Dashed lines mark COVID-19 lockdown period (2020–2021)
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fill:'#666', fontSize:12 }} />
            <YAxis tick={{ fill:'#555', fontSize:11 }} />
            <Tooltip {...tt} />
            <Legend wrapperStyle={{ color:'#666', fontSize:'12px' }} />
            <ReferenceLine x={2020} stroke="rgba(249,115,22,0.5)"
                           strokeDasharray="4 4"
                           label={{ value:'COVID ↓', fill:'#f97316', fontSize:11, position:'top' }}/>
            <ReferenceLine x={2021} stroke="rgba(249,115,22,0.3)"
                           strokeDasharray="4 4"/>
            {zones.map((zone, i) => (
              <Line key={zone} type="monotone" dataKey={zone}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2} dot={{ r:3 }} activeDot={{ r:5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── COVID Impact ─────────────────────── */}
      <div className="scale-in d3" style={{
        borderRadius:'16px', padding:'24px',
        background:'rgba(249,115,22,0.06)',
        border:'1px solid rgba(249,115,22,0.2)',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'16px' }}>
          <div style={{
            fontSize:'32px', lineHeight:1,
            background:'rgba(249,115,22,0.15)',
            borderRadius:'12px', padding:'12px',
          }}>🦠</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:'18px', fontWeight:700, color:'#f97316', marginBottom:'8px' }}>
              COVID-19 Impact Analysis (2020–2021)
            </h3>
            <p style={{ fontSize:'13px', color:'#888', lineHeight:1.7, marginBottom:'16px' }}>
              A consistent dip in accident counts was observed across all zones during
              2020–2021, attributable to reduced traffic activity during the COVID-19
              lockdown period. Counts recovered and exceeded pre-pandemic levels in
              several zones by 2023–2024.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
              {[
                { label:'Peak Year',   value:String(peakYear),        sub:'Highest total' },
                { label:'Lowest',      value:String(lowestCovidYear), sub:'COVID dip'      },
                { label:'Recovery',    value:String(recoveryYear),    sub:'Post-lockdown peak' },
              ].map(item => (
                <div key={item.label} style={{
                  background:'rgba(249,115,22,0.08)',
                  borderRadius:'10px', padding:'14px',
                  border:'1px solid rgba(249,115,22,0.15)',
                }}>
                  <div style={{ fontSize:'10px', color:'#f97316', letterSpacing:'2px',
                                textTransform:'uppercase', marginBottom:'4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize:'22px', fontWeight:800, color:'white' }}>{item.value}</div>
                  <div style={{ fontSize:'11px', color:'#555', marginTop:'2px' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Zone Comparison ──────────────────── */}
      <Card delay="d4">
        <div className="label" style={{ marginBottom:'4px' }}>Zone vs Zone</div>
        <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'16px' }}>
          Compare Two Zones
        </h3>
        <div style={{ display:'flex', gap:'12px', marginBottom:'20px' }}>
          <select value={zoneA} onChange={e => setZoneA(e.target.value)} style={inp}>
            {zones.map(z => <option key={z} value={z} disabled={z === zoneB}>{z}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', color: '#444', fontSize: '13px' }}>vs</div>
          <select value={zoneB} onChange={e => setZoneB(e.target.value)} style={inp}>
            {zones.map(z => <option key={z} value={z} disabled={z === zoneA}>{z}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={compareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fill:'#666', fontSize:12 }} />
            <YAxis tick={{ fill:'#555', fontSize:11 }} />
            <Tooltip {...tt} />
            <Legend wrapperStyle={{ color:'#666', fontSize:'12px' }} />
            <Line type="monotone" dataKey={zoneA}
                  stroke="#f97316" strokeWidth={2.5} dot={{ r:4 }} />
            <Line type="monotone" dataKey={zoneB}
                  stroke="#06b6d4" strokeWidth={2.5} dot={{ r:4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── YoY Change Table ─────────────────── */}
      <Card delay="d5">
        <div className="label" style={{ marginBottom:'4px' }}>Year-on-Year</div>
        <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>
          2024 → 2025 Change by Zone
        </h3>
        <p style={{ fontSize:'12px', color:'#444', marginBottom:'20px' }}>
          Which zones improved vs worsened in the latest year
        </p>
        <table style={{ width:'100%', fontSize:'13px', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Zone','2025 Total','Change','% Change','Trend'].map(h => (
                <th key={h} style={{
                  textAlign:'left', padding:'8px 12px',
                  fontSize:'10px', color:'#444',
                  textTransform:'uppercase', letterSpacing:'1px',
                  borderBottom:'1px solid rgba(255,255,255,0.06)'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yoyData.map(row => (
              <tr key={row.zone}
                  style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding:'12px', color:'white', fontWeight:600 }}>{row.zone}</td>
                <td style={{ padding:'12px', color:'#aaa' }}>{row.latest}</td>
                <td style={{ padding:'12px',
                             color: row.change < 0 ? '#22c55e' : row.change > 0 ? '#ef4444' : '#555',
                             fontWeight:600 }}>
                  {row.change > 0 ? '+' : ''}{row.change}
                </td>
                <td style={{ padding:'12px',
                             color: parseFloat(row.pct) < 0 ? '#22c55e' : '#ef4444' }}>
                  {row.pct > 0 ? '+' : ''}{row.pct}%
                </td>
                <td style={{ padding:'12px' }}>
                 <span style={{
                  fontSize:'22px', fontWeight:900, lineHeight: 1,
                  color: row.change < 0 ? '#22c55e' : row.change > 0 ? '#ef4444' : '#555',
                  textShadow: row.change < 0
                   ? '0 0 8px rgba(34,197,94,0.5)'
                   : row.change > 0
                   ? '0 0 8px rgba(239,68,68,0.5)'
                   : 'none'
                }}>
                  {row.change < 0 ? '▼' : row.change > 0 ? '▲' : '→'}
                </span>
               </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

    </div>
  )
}