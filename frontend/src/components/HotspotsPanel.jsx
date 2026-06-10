import { useEffect, useState } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip } from 'react-leaflet'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { LineChart, Line, ResponsiveContainer as RC } from 'recharts'
import 'leaflet/dist/leaflet.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const riskColor = avg => avg >= 70 ? '#ef4444' : avg >= 30 ? '#f97316' : '#22c55e'
const riskLabel = avg => avg >= 70 ? 'High Risk' : avg >= 30 ? 'Medium Risk' : 'Low Risk'
const trendArrow = (history) => {
  if (!history || history.length < 2) return null
  const first = history[0].accidents
  const last  = history[history.length - 1].accidents
  const up    = last >= first
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      color: up ? '#ef4444' : '#22c55e',
      fontSize: '16px', fontWeight: 700,
      lineHeight: 1
    }}>
      {up ? '▲' : '▼'}
    </span>
  )
}

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

function MiniSparkline({ data }) {
  if (!data || data.length === 0) return null
  return (
    <RC width="100%" height={32}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="accidents"
              stroke="#f97316" strokeWidth={1.5} dot={false} />
      </LineChart>
    </RC>
  )
}

export default function HotspotsPanel() {
  const [hotspots,  setHotspots]  = useState([])
  const [stations,  setStations]  = useState([])
  const [selected,  setSelected]  = useState(null)
  const [detail,    setDetail]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [histories, setHistories] = useState({})

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/hotspots`),
      axios.get(`${API}/stations-risk`)
    ]).then(([h, s]) => {
      setHotspots(h.data.hotspots)
      setStations(s.data.stations)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleMarkerClick = async (station) => {
    setSelected(station.Station)
    if (histories[station.Station]) {
      setDetail(histories[station.Station])
      return
    }
    try {
      const r = await axios.get(`${API}/station/${encodeURIComponent(station.Station)}`)
      setHistories(prev => ({ ...prev, [station.Station]: r.data }))
      setDetail(r.data)
    } catch {}
  }

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column',
              alignItems:'center', gap:'16px' }}>
  <div style={{
    width:'40px', height:'40px', borderRadius:'50%',
    border:'3px solid rgba(249,115,22,0.2)',
    borderTop:'3px solid #f97316',
    animation:'border-rotate 0.8s linear infinite',
  }}/>
  <p style={{ color:'#555', fontSize:'13px' }}>Loading...</p>
</div>
  )

  // Risk distribution for donut
  const high   = stations.filter(s => s.Risk === 'High Risk').length
  const medium = stations.filter(s => s.Risk === 'Medium Risk').length
  const low    = stations.filter(s => s.Risk === 'Low Risk').length

  const donutData = [
    { name: 'High Risk',   value: high,   color: '#ef4444' },
    { name: 'Medium Risk', value: medium, color: '#f97316' },
    { name: 'Low Risk',    value: low,    color: '#22c55e' },
  ]

  // Zone summary
  const zoneSummary = {}
  stations.forEach(s => {
    if (!zoneSummary[s.Zone]) zoneSummary[s.Zone] = { high:0, medium:0, low:0, total:0 }
    if (s.Risk === 'High Risk')   zoneSummary[s.Zone].high++
    if (s.Risk === 'Medium Risk') zoneSummary[s.Zone].medium++
    if (s.Risk === 'Low Risk')    zoneSummary[s.Zone].low++
    zoneSummary[s.Zone].total++
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* Header */}
      <div className="scale-in d1">
        <div className="label" style={{ marginBottom:'8px' }}>Geospatial</div>
        <h2 style={{ fontSize:'32px', fontWeight:800, marginBottom:'6px' }}>
          Accident Hotspot Map
        </h2>
        <p style={{ color:'#555', fontSize:'14px' }}>
          Click any marker to see the station's full 8-year history
        </p>
      </div>

      {/* ── Map + Detail Panel ───────────────── */}
      <div style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>

        {/* Map */}
        <div className="rot-border scale-in d2"
             style={{ flex:1, borderRadius:'16px', overflow:'hidden' }}>
          <MapContainer
            center={[12.9716, 77.5946]} zoom={11}
            style={{ height:'460px', width:'100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; CartoDB"
            />
            {stations.map((s, i) =>
              s.Latitude && s.Longitude ? (
                <CircleMarker
                  key={i}
                  center={[s.Latitude, s.Longitude]}
                  radius={Math.max(6, Math.min(22, s.Total_Avg / 7))}
                  fillColor={riskColor(s.Total_Avg)}
                  color={selected === s.Station ? 'white' : 'rgba(0,0,0,0.3)'}
                  weight={selected === s.Station ? 2 : 1}
                  fillOpacity={0.85}
                  eventHandlers={{ click: () => handleMarkerClick(s) }}
                >
                  <MapTooltip>
                    <div style={{ background:'#1a1a1a', color:'white',
                                  padding:'8px', borderRadius:'8px',
                                  border:'1px solid rgba(255,255,255,0.1)',
                                  fontSize:'12px', minWidth:'140px' }}>
                      <p style={{ fontWeight:'bold', marginBottom:'4px' }}>{s.Station}</p>
                      <p style={{ color:'#888' }}>Zone: {s.Zone}</p>
                      <p style={{ color: riskColor(s.Total_Avg), fontWeight:'bold' }}>
                        {s.Risk}
                      </p>
                      <p style={{ color:'#888' }}>Avg: {s.Total_Avg?.toFixed(1)}/yr</p>
                      <p style={{ color:'#f97316', fontSize:'11px', marginTop:'4px' }}>
                        Click for full history →
                      </p>
                    </div>
                  </MapTooltip>
                </CircleMarker>
              ) : null
            )}
          </MapContainer>

          {/* Legend */}
          <div style={{ display:'flex', alignItems:'center', gap:'20px',
                        padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            {[['#ef4444','High Risk'],['#f97316','Medium Risk'],['#22c55e','Low Risk']].map(([c,l]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%',
                              background:c, boxShadow:`0 0 6px ${c}` }}/>
                <span style={{ fontSize:'12px', color:'#666' }}>{l}</span>
              </div>
            ))}
            <span style={{ fontSize:'11px', color:'#333', marginLeft:'auto' }}>
              Circle size ∝ avg accidents/yr · Click marker for details
            </span>
          </div>
        </div>

        {/* Station Detail Panel */}
        {detail ? (
          <div className="rot-border-fast scale-in d1 edge-card"
               style={{ width:'280px', borderRadius:'16px', padding:'20px',
                        flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center', marginBottom:'16px' }}>
              <div className="label">Station Detail</div>
              <button onClick={() => { setDetail(null); setSelected(null) }}
                style={{ background:'none', border:'none', color:'#555',
                         cursor:'pointer', fontSize:'18px' }}>×</button>
            </div>

            <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'4px' }}>
              {detail.station}
            </h3>
            <p style={{ fontSize:'12px', color:'#555', marginBottom:'16px' }}>
              Zone: {detail.zone}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px',
                          marginBottom:'16px' }}>
              {[
                { label:'Total',   value: detail.total   },
                { label:'Avg/Yr',  value: detail.average },
                { label:'Risk',    value: detail.risk, small: true },
              ].map(item => (
                <div key={item.label} style={{
                  background:'rgba(255,255,255,0.04)',
                  borderRadius:'10px', padding:'12px',
                  gridColumn: item.small ? '1 / -1' : 'auto'
                }}>
                  <div style={{ fontSize:'10px', color:'#444',
                                letterSpacing:'1px', textTransform:'uppercase' }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: item.small ? '14px' : '22px',
                    fontWeight:700, marginTop:'4px',
                    color: item.label === 'Risk'
                      ? riskColor(detail.average)
                      : '#f97316'
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:'8px' }}>
              <div style={{ fontSize:'10px', color:'#444', letterSpacing:'1px',
                            textTransform:'uppercase', marginBottom:'8px' }}>
                8-Year Trend
              </div>
              <MiniSparkline data={detail.history} />
            </div>

            <div style={{ marginTop:'12px' }}>
              {detail.history?.map(h => (
                <div key={h.year} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)',
                  fontSize:'12px'
                }}>
                  <span style={{ color:'#555' }}>{h.year}</span>
                  <span style={{
                    color: h.accidents >= 70 ? '#ef4444'
                           : h.accidents >= 30 ? '#f97316' : '#22c55e',
                    fontWeight:600
                  }}>
                    {h.accidents}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="scale-in d3" style={{
            width:'280px', borderRadius:'16px', flexShrink:0,
            border:'1px dashed rgba(255,255,255,0.08)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            padding:'24px', textAlign:'center', minHeight:'200px'
          }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>📍</div>
            <p style={{ color:'#333', fontSize:'13px' }}>
              Click any marker on the map to see station details
            </p>
          </div>
        )}
      </div>

      {/* ── Donut + Zone Summary ─────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* Donut */}
        <Card delay="d3">
          <div className="label" style={{ marginBottom:'4px' }}>Distribution</div>
          <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'20px' }}>
            Risk Level Breakdown
          </h3>
          <div style={{ display:'flex', alignItems:'center', gap:'24px' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%"
                     innerRadius={45} outerRadius={70}
                     dataKey="value" paddingAngle={3}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color}
                          stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip {...tt} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1 }}>
              {donutData.map(item => (
                <div key={item.name} style={{ marginBottom:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                                fontSize:'13px', marginBottom:'5px' }}>
                    <span style={{ color: item.color, fontWeight:600 }}>{item.name}</span>
                    <span style={{ color:'#aaa' }}>{item.value} stations</span>
                  </div>
                  <div style={{ height:'4px', borderRadius:'3px',
                                background:'rgba(255,255,255,0.05)' }}>
                    <div style={{
                      height:'4px', borderRadius:'3px',
                      background: item.color,
                      width:`${(item.value / stations.length) * 100}%`,
                      boxShadow:`0 0 6px ${item.color}`,
                      transition:'width 1s ease'
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Zone Summary */}
        <Card delay="d4">
          <div className="label" style={{ marginBottom:'4px' }}>Zones</div>
          <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'20px' }}>
            Risk by Zone
          </h3>
          {Object.entries(zoneSummary).map(([zone, counts]) => (
            <div key={zone} style={{ marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between',
                            marginBottom:'6px', fontSize:'13px' }}>
                <span style={{ color:'white', fontWeight:600 }}>{zone}</span>
                <div style={{ display:'flex', gap:'10px' }}>
                  {counts.high   > 0 && <span style={{ color:'#ef4444', fontSize:'12px' }}>🔴 {counts.high}</span>}
                  {counts.medium > 0 && <span style={{ color:'#f97316', fontSize:'12px' }}>🟠 {counts.medium}</span>}
                  {counts.low    > 0 && <span style={{ color:'#22c55e', fontSize:'12px' }}>🟢 {counts.low}</span>}
                </div>
              </div>
              <div style={{ display:'flex', height:'6px', borderRadius:'4px', overflow:'hidden' }}>
                {counts.high   > 0 && <div style={{ flex: counts.high,   background:'#ef4444' }}/>}
                {counts.medium > 0 && <div style={{ flex: counts.medium, background:'#f97316' }}/>}
                {counts.low    > 0 && <div style={{ flex: counts.low,    background:'#22c55e' }}/>}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* ── Top 10 Table ─────────────────────── */}
      <Card delay="d5">
        <div className="label" style={{ marginBottom:'4px' }}>Ranking</div>
        <h3 style={{ fontSize:'18px', fontWeight:700, marginBottom:'20px' }}>
          Top 10 Accident Hotspots (2018–2025)
        </h3>
        <table style={{ width:'100%', fontSize:'13px', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['#','Station','Zone','Total','Trend','Risk'].map(h => (
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
            {hotspots.map((h, i) => (
              <tr key={i}
                  onClick={() => handleMarkerClick({ Station: h.Station })}
                  style={{
                    borderBottom:'1px solid rgba(255,255,255,0.04)',
                    cursor:'pointer',
                    transition:'background 0.2s',
                    background: selected === h.Station
                      ? 'rgba(249,115,22,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background =
                    selected === h.Station ? 'rgba(249,115,22,0.08)' : 'transparent'}
              >
                <td style={{ padding:'12px', fontWeight:700, color:'#f97316' }}>{i+1}</td>
                <td style={{ padding:'12px', color:'white', fontWeight:600 }}>{h.Station}</td>
                <td style={{ padding:'12px', color:'#555' }}>{h.Zone}</td>
                <td style={{ padding:'12px', color:'#aaa', fontWeight:600 }}>{h.Total_Sum}</td>
                <td style={{ padding:'12px', width:'100px' }}>
                  {histories[h.Station] ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                     {trendArrow(histories[h.Station].history)}
                     <div style={{ flex: 1 }}>
                      <MiniSparkline data={histories[h.Station].history} />
                     </div>
                    </div>
                  ) : (
                    <span style={{
                     display: 'inline-flex', alignItems: 'center', gap: '4px',
                     color: '#555', fontSize: '10px',
                     border: '1px dashed rgba(255,255,255,0.12)',
                     borderRadius: '4px', padding: '2px 7px',
                     letterSpacing: '0.5px'
                    }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                     load
                  </span>
                )}
              </td>
                <td style={{ padding:'12px' }}>
                  <span style={{
                    padding:'3px 10px', borderRadius:'12px',
                    fontSize:'11px', fontWeight:700,
                    color: riskColor(h.Total_Sum / 8),
                    background: riskColor(h.Total_Sum / 8) + '20',
                  }}>
                    {riskLabel(h.Total_Sum / 8)}
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