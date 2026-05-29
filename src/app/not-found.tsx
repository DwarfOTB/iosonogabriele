import Link from 'next/link'

const RAY_DEGS = [0,30,60,90,120,150,180,210,240,270,300,330]
const RAY_LENS = [30,26,29,27,31,25,28,26,30,27,29,26]
function r2(n: number) { return Math.round(n * 100) / 100 }
const RAYS = RAY_DEGS.map((deg, i) => {
  const rad = deg * Math.PI / 180
  return {
    x1: r2(40 + Math.cos(rad) * 20), y1: r2(40 + Math.sin(rad) * 20),
    x2: r2(40 + Math.cos(rad) * RAY_LENS[i]), y2: r2(40 + Math.sin(rad) * RAY_LENS[i]),
  }
})

export default function NotFound() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#F4EDD8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Sun SVG 2D — sad expression */}
      <svg
        width="180"
        height="180"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
        style={{ marginBottom: '28px' }}
      >
        <circle cx="40" cy="40" r="18" fill="#F7C842" />
        <circle cx="40" cy="40" r="22" fill="rgba(247,200,66,0.2)" />
        {RAYS.map((ray, i) => (
          <line key={i} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2}
            stroke="#E07B2A" strokeWidth="2" strokeLinecap="round"
          />
        ))}
        {/* Sad eyes — small, lowered */}
        <ellipse cx="34" cy="40" rx="3" ry="1.5" fill="#1C1208" />
        <ellipse cx="46" cy="40" rx="3" ry="1.5" fill="#1C1208" />
        {/* Eyebrows angled sad */}
        <line x1="30" y1="34" x2="37" y2="36" stroke="#1C1208" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="43" y1="36" x2="50" y2="34" stroke="#1C1208" strokeWidth="1.5" strokeLinecap="round" />
        {/* Frown */}
        <path d="M33 47 Q40 43 47 47" stroke="#1C1208" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>

      <h1 style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
        color: '#1C1208',
        marginBottom: '12px',
        transform: 'rotate(-0.4deg)',
      }}>
        Questa stanza non esiste ancora.
      </h1>

      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: '1rem',
        color: '#7A6548',
        marginBottom: '32px',
        maxWidth: '340px',
      }}>
        Forse ti sei perso nel buio.
      </p>

      <Link
        href="/"
        aria-label="Torna alla home di iosonogabriele"
        style={{
          fontFamily: "'Caveat', cursive",
          fontWeight: 700,
          fontSize: '1.2rem',
          color: '#FDFAF4',
          background: '#D93025',
          textDecoration: 'none',
          padding: '12px 32px',
          borderRadius: '2px 6px 4px 8px / 6px 2px 8px 4px',
          boxShadow: '3px 3px 0px #C0392B, 6px 6px 0px rgba(28,18,8,0.15)',
          display: 'inline-block',
          transform: 'rotate(-0.5deg)',
        }}
      >
        Torna alla luce →
      </Link>
    </div>
  )
}
