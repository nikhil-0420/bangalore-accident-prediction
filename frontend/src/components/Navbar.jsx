const tabs = [
  { id: 'predict',  label: 'Predict'      },
  { id: 'stats',    label: 'Model Stats'  },
  { id: 'trends',   label: 'Trends'       },
  { id: 'hotspots', label: 'Hotspots'     },
]

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(14,14,14,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>

        {/* Logo */}
        <button onClick={() => setActiveTab(null)}
          style={{ display:'flex', alignItems:'center', gap:'10px',
                   background:'none', border:'none', cursor:'pointer' }}>
          <div className="pulse-dot" style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#f97316', flexShrink: 0
          }} />
          <span style={{ color:'white', fontWeight:700, fontSize:'14px' }}>
            Bangalore Accident Risk Predictor
          </span>
          <span style={{
            fontSize:'10px', color:'#f97316',
            border:'1px solid rgba(249,115,22,0.3)',
            padding:'2px 8px', borderRadius:'4px', letterSpacing:'1px'
          }}>
            RESEARCH
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id
                  ? 'rgba(249,115,22,0.15)'
                  : 'transparent',
                color: activeTab === tab.id ? '#f97316' : '#666',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}

          <a href="https://github.com/nikhil-0420"
            target="_blank" rel="noreferrer"
            style={{
              marginLeft: '12px',
              fontSize: '12px', color: '#555',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '6px 14px', borderRadius: '6px',
              textDecoration: 'none', transition: 'all 0.2s'
            }}
          >
            Star on GitHub ★
          </a>
        </div>

      </div>
    </nav>
  )
}