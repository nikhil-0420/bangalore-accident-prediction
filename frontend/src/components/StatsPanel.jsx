import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const tt = {
  contentStyle: {
    background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'white', fontSize: '12px'
  }
}

const classData = [
  { model: 'Random Forest', Accuracy: 0.7976, Precision: 0.78, Recall: 0.77, F1: 0.799 },
  { model: 'XGBoost',       Accuracy: 0.7857, Precision: 0.7953, Recall: 0.7857, F1: 0.7883 },
  { model: 'Decision Tree', Accuracy: 0.7738, Precision: 0.7812, Recall: 0.7738, F1: 0.7758 },
]

const regData = [
  { model: 'Random Forest', R2: 0.859 , RMSE: 25.48, MAE: 9.86  },
  { model: 'XGBoost',       R2: 0.8259, RMSE: 24.66, MAE: 10.22 },
  { model: 'Decision Tree', R2: 0.7554, RMSE: 29.23, MAE: 13.30 },
]

const radarData = [
  { metric: 'Accuracy',  RF: 78.6, XGB: 78.6, DT: 77.4 },
  { metric: 'Precision', RF: 79.0, XGB: 79.5, DT: 78.1 },
  { metric: 'Recall',    RF: 78.6, XGB: 78.6, DT: 77.4 },
  { metric: 'F1 Score',  RF: 78.7, XGB: 78.8, DT: 77.6 },
]

const smoteBefore = [
  { label: 'High Risk',   before: 143, after: 147 },
  { label: 'Low Risk',    before: 100, after: 147 },
  { label: 'Medium Risk', before: 89,  after: 147 },
]

const classReport = [
  { cls: 'High Risk',   prec: 0.82, rec: 0.78, f1: 0.80, sup: 36 },
  { cls: 'Low Risk',    prec: 0.83, rec: 0.79, f1: 0.81, sup: 24 },
  { cls: 'Medium Risk', prec: 0.67, rec: 0.75, f1: 0.71, sup: 24 },
]

const shapData = [
  { feature: '2-Year Rolling Avg',  value: 0.750 },
  { feature: 'Prev Year Accidents', value: 0.634 },
  { feature: 'Year-on-Year Trend',  value: 0.169 },
  { feature: 'Year',                value: 0.043 },
  { feature: 'Station',             value: 0.041 },
  { feature: 'Zone',                value: 0.039 },
]

const riskColor = { 'High Risk': '#ef4444', 'Low Risk': '#22c55e', 'Medium Risk': '#f97316' }

function Card({ children, delay = 'd1', style = {} }) {
  return (
    <div className={`rot-border edge-card scale-in ${delay}`}
         style={{ borderRadius: '16px', padding: '24px', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return <div className="label" style={{ marginBottom: '6px' }}>{children}</div>
}

function SectionTitle({ children }) {
  return <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{children}</h3>
}

export default function StatsPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div className="scale-in d1">
        <div className="label" style={{ marginBottom: '8px' }}>Performance</div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>Model Analytics</h2>
        <p style={{ color: '#555', fontSize: '14px' }}>
          Random Forest vs XGBoost vs Decision Tree — full comparison
        </p>
      </div>
{/* ── Key Metrics ─────────────────────── */}
<div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
  {[
    { label:'R² Score',   value:'0.859',  sub:'Regression accuracy'    },
    { label:'F1 Score',   value:'0.799',  sub:'Weighted classification' },
    { label:'Accuracy',   value:'79.8%',  sub:'Post-SMOTE'             },
    { label:'RMSE',       value:'23.56',  sub:'Regression error'       },
    { label:'MAE',        value:'13.06',  sub:'Mean absolute error'    },
    { label:'Confidence', value:'98.6%',  sub:'Max sample confidence'  },
  ].map((s, i) => (
    <div key={s.label}
         className={`rot-border edge-card scale-in d${(i%6)+1}`}
         style={{ borderRadius:'14px', padding:'20px' }}>
      <p style={{ fontSize:'11px', color:'#555', textTransform:'uppercase',
                  letterSpacing:'2px', marginBottom:'8px' }}>{s.label}</p>
      <p style={{ fontSize:'32px', fontWeight:800, color:'#f97316',
                  lineHeight:1, marginBottom:'4px' }}>{s.value}</p>
      <p style={{ fontSize:'12px', color:'#444' }}>{s.sub}</p>
    </div>
  ))}
</div>
      {/* ── Competitor Cards ────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', marginTop:'16px' }}>
  {[
    { name:'Random Forest', color:'#f97316', acc:0.7976, f1:0.799, r2:0.859, winner:false, tuned:true  },
    { name:'XGBoost',       color:'#06b6d4', acc:0.7857, f1:0.7883, r2:0.8259, winner:true,  tuned:false },
    { name:'Decision Tree', color:'#8b5cf6', acc:0.7738, f1:0.7758, r2:0.7554, winner:false, tuned:false },
  ].map((m, i) => (
    <div key={m.name}
         className={`rot-border edge-card scale-in d${i+1}`}
         style={{
           borderRadius:'16px', padding:'24px',
           ...(m.tuned ? { boxShadow:'0 0 24px rgba(249,115,22,0.15)' } : {})
         }}>
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:'16px' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:m.color }}>
          {m.name}
        </div>
        {m.winner && (
          <div style={{
            background:'#06b6d4', color:'white',
            fontSize:'10px', fontWeight:700, letterSpacing:'1px',
            padding:'3px 10px', borderRadius:'20px'
          }}>BASELINE WINNER</div>
        )}
        {m.tuned && (
          <div style={{
            background:'#f97316', color:'white',
            fontSize:'10px', fontWeight:700, letterSpacing:'1px',
            padding:'3px 10px', borderRadius:'20px'
          }}>FINAL MODEL</div>
        )}
      </div>
      {[
        { label:'Accuracy', val:m.acc.toFixed(4) },
        { label:'F1 Score', val:m.f1.toFixed(4)  },
        { label:'R² Score', val:m.r2.toFixed(4)  },
      ].map(item => (
        <div key={item.label} style={{
          display:'flex', justifyContent:'space-between',
          marginBottom:'10px', fontSize:'13px'
        }}>
          <span style={{ color:'#555' }}>{item.label}</span>
          <span style={{ color:'white', fontWeight:600 }}>{item.val}</span>
        </div>
      ))}
      {m.tuned && (
        <div style={{
          marginTop:'12px', padding:'8px 12px', borderRadius:'8px',
          background:'rgba(249,115,22,0.1)', fontSize:'11px', color:'#f97316'
        }}>
          After SMOTE + Tuning: R² 0.859 · F1 0.799
        </div>
      )}
    </div>
  ))}
</div>
      {/* ── Radar Chart ────────────────────── */}
      <Card delay="d2">
        <SectionLabel>Comparison</SectionLabel>
        <SectionTitle>All Metrics Radar View</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#666', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[76, 80]}
                             tick={{ fill: '#444', fontSize: 10 }} />
            <Radar name="Random Forest" dataKey="RF"
                   stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
            <Radar name="XGBoost"       dataKey="XGB"
                   stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
            <Radar name="Decision Tree" dataKey="DT"
                   stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
            <Tooltip {...tt} />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
          {[['#f97316', 'Random Forest'], ['#06b6d4', 'XGBoost'], ['#8b5cf6', 'Decision Tree']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#666' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
              {l}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Classification Chart ────────────── */}
      <Card delay="d3">
        <SectionLabel>Classification</SectionLabel>
        <SectionTitle>Metrics Comparison</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={classData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="model" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis domain={[0.75, 0.82]} tick={{ fill: '#555', fontSize: 11 }} />
            <Tooltip {...tt} formatter={v => v.toFixed(4)} />
            <Bar dataKey="Accuracy"  fill="#f97316" radius={[4,4,0,0]} />
            <Bar dataKey="Precision" fill="#8b5cf6" radius={[4,4,0,0]} />
            <Bar dataKey="Recall"    fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="F1"        fill="#06b6d4" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Regression Chart ────────────────── */}
      <Card delay="d4">
        <SectionLabel>Regression</SectionLabel>
        <SectionTitle>R² Score Comparison</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={regData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="model" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis domain={[0.70, 0.88]} tick={{ fill: '#555', fontSize: 11 }} />
            <Tooltip {...tt} formatter={v => v.toFixed(4)} />
            <Bar dataKey="R2" fill="#f97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Two col: SMOTE + Classification Report ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* SMOTE */}
        <Card delay="d5">
          <SectionLabel>Class Balancing</SectionLabel>
          <SectionTitle>SMOTE Before vs After</SectionTitle>
          <div style={{ fontSize: '12px', color: '#444', marginBottom: '16px' }}>
            Imbalance ratio was 1.61 — SMOTE balanced all classes to 147
          </div>
          {smoteBefore.map(item => (
            <div key={item.label} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                            fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: riskColor[item.label] }}>{item.label}</span>
                <span style={{ color: '#555' }}>{item.before} → <span style={{ color: '#f97316' }}>{item.after}</span></span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ height: '6px', borderRadius: '3px', background: '#333',
                               width: `${(item.before / 147) * 100}%`, transition: 'width 1s' }} />
                <div style={{ height: '6px', borderRadius: '3px',
                               background: riskColor[item.label], opacity: 0.4,
                               width: `${((item.after - item.before) / 147) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Classification Report */}
        <Card delay="d6">
          <SectionLabel>Final Model</SectionLabel>
          <SectionTitle>Classification Report</SectionTitle>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Class', 'Precision', 'Recall', 'F1', 'Support'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px',
                                       fontSize: '10px', color: '#444',
                                       textTransform: 'uppercase', letterSpacing: '1px',
                                       borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classReport.map(row => (
                <tr key={row.cls}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 8px', color: riskColor[row.cls], fontWeight: 600 }}>
                    {row.cls}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#aaa' }}>{row.prec}</td>
                  <td style={{ padding: '10px 8px', color: '#aaa' }}>{row.rec}</td>
                  <td style={{ padding: '10px 8px', color: '#f97316', fontWeight: 700 }}>{row.f1}</td>
                  <td style={{ padding: '10px 8px', color: '#555' }}>{row.sup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ── SHAP ───────────────────────────── */}
      <Card delay="d1">
        <SectionLabel>Explainability</SectionLabel>
        <SectionTitle>SHAP Feature Importance</SectionTitle>
        <p style={{ fontSize: '12px', color: '#444', marginBottom: '20px' }}>
          Pearson correlation with accident count — both SHAP and correlation agree
        </p>
        {shapData.map((item, i) => (
          <div key={item.feature} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#888' }}>{item.feature}</span>
              <span style={{ color: '#f97316', fontWeight: 700 }}>{item.value}</span>
            </div>
            <div style={{ height: '5px', borderRadius: '3px',
                          background: 'rgba(255,255,255,0.05)' }}>
              <div className="bar-fill" style={{
                height: '5px', borderRadius: '3px',
                background: `rgba(249,115,22,${0.4 + (shapData.length - i) * 0.1})`,
                width: `${item.value * 100}%`,
                boxShadow: '0 0 8px rgba(249,115,22,0.3)',
              }} />
            </div>
          </div>
        ))}
      </Card>

    </div>
  )
}