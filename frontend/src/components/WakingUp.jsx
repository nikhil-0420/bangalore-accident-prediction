export default function WakingUp() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
      position: 'relative', zIndex: 10, textAlign: 'center', padding: '24px'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '3px solid rgba(249,115,22,0.2)',
        borderTop: '3px solid #f97316',
        animation: 'border-rotate 0.8s linear infinite',
      }} />
      <div>
        <p style={{ color: '#f97316', fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
          Waking up the backend...
        </p>
        <p style={{ color: '#555', fontSize: '13px', maxWidth: '320px' }}>
          This app runs on a free server that sleeps when inactive.
          First load can take up to 30 seconds — thanks for your patience!
        </p>
      </div>
    </div>
  )
}