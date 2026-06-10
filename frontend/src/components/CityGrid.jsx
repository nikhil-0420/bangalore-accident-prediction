export default function CityGrid() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      <div className="city-grid" />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 60%)'
      }} />
    </div>
  )
}
