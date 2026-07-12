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

// Metrics are the MEAN across 5 stratified train/test splits (seeds 1-5),
// not a single run — single-split numbers on this dataset (N=334) are
// unstable enough to flip model rankings (see Decision Tree note below).
const classData = [
  { model: 'Random Forest', Accuracy: 0.8388, F1: 0.8380 },
  { model: 'XGBoost',       Accuracy: 0.8209, F1: 0.8216 },
  { model: 'Decision Tree', Accuracy: 0.8179, F1: 0.8197 },
]

const regData = [
  { model: 'Random Forest', R2: 0.8106, RMSE: 27.78, MAE: 14.86 },
  { model: 'XGBoost',       R2: 0.7856, RMSE: 29.04, MAE: 13.69 },
  { model: 'Decision Tree', R2: 0.7471, RMSE: 31.74, MAE: 17.58 },
]

const radarData = [
  { metric: 'Accuracy',  RF: 83.9, XGB: 82.1, DT: 81.8 },
  { metric: 'F1 Score',  RF: 83.8, XGB: 82.2, DT: 82.0 },
  { metric: 'R² × 100',  RF: 81.1, XGB: 78.6, DT: 74.7 },
]

const smoteBefore = [
  { label: 'High Risk',   before: 146, after: 146 },
  { label: 'Low Risk',    before: 26,  after: 146 },
  { label: 'Medium Risk', before: 95,  after: 146 },
]

const shapData = [
  { feature: '2-Year Rolling Avg',  value: 0.77 },
  { feature: 'Prev Year Accidents', value: 0.66 },
  { feature: 'Year-on-Year Trend',  value: 0.24 },
  { feature: 'Station',             value: 0.14 },
  { feature: 'Year',                value: 0.04 },
  { feature: 'Zone',                value: 0.06 },
]

// Ablation study: feature-subset impact, same 5-seed methodology
const ablationData = [
  { set: 'Full (6 features)',        Accuracy: 0.8388, F1: 0.8380, R2: 0.8053 },
  { set: 'Without Rolling_Avg',      Accuracy: 0.8507, F1: 0.8489, R2: 0.7791 },
  { set: 'Without Station/Zone',     Accuracy: 0.8687, F1: 0.8679, R2: 0.8224 },
  { set: 'Rolling_Avg + Prev_Year',  Accuracy: 0.8896, F1: 0.8856, R2: 0.8116 },
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
        <div style={{
          marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11.5px', color: '#666', lineHeight: 1.6
        }}>
          Metrics below are the <strong style={{ color: '#888' }}>mean across 5 stratified
          train/test splits</strong>, not a single run — a single split on this dataset
          (334 station-years) can swing accuracy by several points and even flip which
          model looks best, so a single-run number would be misleading either way.
          An earlier data-preprocessing pass also silently zero-filled 82 station-years
          that actually had no recorded data, which inflated some early metrics; that
          has since been corrected.
        </div>
      </div>
{/* ── Key Metrics ─────────────────────── */}
<div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
  {[
    { label:'R² Score',   value:'0.811',  sub:'Mean, 5-split average'  },
    { label:'F1 Score',   value:'0.838',  sub:'Mean, 5-split average'  },
    { label:'Accuracy',   value:'83.9%',  sub:'Mean, post-SMOTE'       },
    { label:'RMSE',       value:'27.78',  sub:'Regression error'       },
    { label:'MAE',        value:'14.86',  sub:'Mean absolute error'    },
    { label:'COVID Gap',  value:'-0.003', sub:'Generalizability (G)'   },
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
    { name:'Random Forest', color:'#f97316', acc:0.8388, f1:0.8380, r2:0.8106, winner:true,  tuned:true  },
    { name:'XGBoost',       color:'#06b6d4', acc:0.8209, f1:0.8216, r2:0.7856, winner:false, tuned:false },
    { name:'Decision Tree', color:'#8b5cf6', acc:0.8179, f1:0.8197, r2:0.7471, winner:false, tuned:false },
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
          Mean across 5 splits: R² 0.811 · F1 0.838
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
            <PolarRadiusAxis angle={90} domain={[70, 86]}
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
            <YAxis domain={[0.80, 0.85]} tick={{ fill: '#555', fontSize: 11 }} />
            <Tooltip {...tt} formatter={v => v.toFixed(4)} />
            <Bar dataKey="Accuracy" fill="#f97316" radius={[4,4,0,0]} />
            <Bar dataKey="F1"       fill="#06b6d4" radius={[4,4,0,0]} />
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
            Imbalance ratio was ~5.6 (after removing 82 mislabeled zero-fill
            rows) — SMOTE balanced all classes to 146
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
                               width: `${(item.before / 146) * 100}%`, transition: 'width 1s' }} />
                <div style={{ height: '6px', borderRadius: '3px',
                               background: riskColor[item.label], opacity: 0.4,
                               width: `${((item.after - item.before) / 146) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Ablation Study */}
        <Card delay="d6">
          <SectionLabel>Ablation Study</SectionLabel>
          <SectionTitle>Feature Contribution Analysis</SectionTitle>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Feature Set', 'Accuracy', 'F1', 'R²'].map(h => (
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
              {ablationData.map(row => (
                <tr key={row.set}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 8px', color: '#ccc', fontWeight: 600 }}>
                    {row.set}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#aaa' }}>{row.Accuracy.toFixed(4)}</td>
                  <td style={{ padding: '10px 8px', color: '#f97316', fontWeight: 700 }}>{row.F1.toFixed(4)}</td>
                  <td style={{ padding: '10px 8px', color: '#555' }}>{row.R2.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '11px', color: '#444', marginTop: '12px' }}>
            Station/Zone identity contributes almost nothing beyond temporal
            features — a 2-feature model (Rolling_Avg + Prev_Year) alone
            outperforms the full feature set on classification.
          </p>
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

      {/* ── COVID Generalizability ─────────── */}
      <Card delay="d2">
        <SectionLabel>Robustness</SectionLabel>
        <SectionTitle>COVID-19 Regime Generalization</SectionTitle>
        <p style={{ fontSize: '12px', color: '#444', marginBottom: '20px', lineHeight: 1.6 }}>
          The tuned model was retrained excluding 2020–2021 entirely, then evaluated
          only on those pandemic-disrupted years — a direct test of whether it
          collapses under a genuine regime shift it never saw during training.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase',
                        letterSpacing: '1.5px', marginBottom: '6px' }}>Normal Test Accuracy</p>
            <p style={{ fontSize: '26px', fontWeight: 800, color: '#888' }}>85.1%</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase',
                        letterSpacing: '1.5px', marginBottom: '6px' }}>COVID-Years Accuracy</p>
            <p style={{ fontSize: '26px', fontWeight: 800, color: '#22c55e' }}>85.4%</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase',
                        letterSpacing: '1.5px', marginBottom: '6px' }}>Generalizability Gap</p>
            <p style={{ fontSize: '26px', fontWeight: 800, color: '#22c55e' }}>G = -0.003</p>
          </div>
        </div>
        <div style={{
          marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
          background: 'rgba(34,197,94,0.08)', fontSize: '11.5px', color: '#22c55e'
        }}>
          No meaningful degradation — the 2-Year Rolling Average feature absorbs the
          pandemic-driven disruption without hurting predictive performance.
        </div>
      </Card>

    </div>
  )
}