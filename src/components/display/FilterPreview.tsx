export function FilterPreview({ r, g, b, intensity }: { r: number; g: number; b: number; intensity: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100px',
        borderRadius: '8px',
        background: `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${intensity})`,
        border: '1px solid #30363D',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        color: '#E6EDF3',
        fontWeight: 600,
        opacity: 0.3,
      }}>
        ABC
      </div>
    </div>
  )
}
