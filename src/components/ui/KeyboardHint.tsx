'use client'

export default function KeyboardHint() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '24px',
        zIndex: 50,
        fontFamily: "'Courier Prime', monospace",
        fontSize: '0.65rem',
        color: 'rgba(244,237,216,0.3)',
        letterSpacing: '0.05em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      ← → naviga · click interagisci · esc chiudi
    </div>
  )
}
