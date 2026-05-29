'use client'
import { NewsletterForm } from './NewsletterForm'

function r2(n: number) { return Math.round(n * 100) / 100 }
const MERCH_RAYS = [0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
  const rad = deg * Math.PI / 180
  return { x: r2(40 + Math.cos(rad) * 30), y: r2(40 + Math.sin(rad) * 30) }
})

export function MerchPanel() {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Sun SVG — sleepy expression */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block', margin: '0 auto 20px' }}
      >
        <circle cx="40" cy="40" r="18" fill="#F7C842" />
        {MERCH_RAYS.map((ray, i) => (
          <line key={i} x1="40" y1="40" x2={ray.x} y2={ray.y}
            stroke="#E07B2A" strokeWidth="2.5" strokeLinecap="round"
          />
        ))}
        {/* Sleepy eyes — very flat */}
        <ellipse cx="34" cy="39" rx="3.5" ry="1" fill="#1C1208" />
        <ellipse cx="46" cy="39" rx="3.5" ry="1" fill="#1C1208" />
      </svg>

      <h3 style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: '1.8rem',
        color: '#1C1208',
        marginBottom: '12px',
        transform: 'rotate(-0.4deg)',
      }}>
        In arrivo.
      </h3>

      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: '0.95rem',
        color: '#3D2E1A',
        lineHeight: 1.6,
        marginBottom: '8px',
        maxWidth: '320px',
        margin: '0 auto 8px',
      }}>
        Qualcosa di fisico sta arrivando.
      </p>
      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: '0.9rem',
        color: '#7A6548',
        lineHeight: 1.6,
        marginBottom: '28px',
        maxWidth: '320px',
        margin: '0 auto 28px',
      }}>
        Lascia la tua email — ti avvisiamo prima di tutti.
      </p>

      <div style={{ textAlign: 'left' }}>
        <NewsletterForm />
      </div>
    </div>
  )
}
