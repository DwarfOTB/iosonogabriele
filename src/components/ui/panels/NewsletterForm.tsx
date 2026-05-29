'use client'
import { useState } from 'react'

function r2(n: number) { return Math.round(n * 100) / 100 }
const SUCCESS_RAYS = [0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
  const rad = deg * Math.PI / 180
  return { x: r2(40 + Math.cos(rad) * 30), y: r2(40 + Math.sin(rad) * 30) }
})

export function NewsletterForm() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  function validate(value: string) {
    if (!value) return 'Inserisci la tua email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email non valida.'
    return ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate(email)
    if (err) { setError(err); return }
    setError('')
    console.log('newsletter signup:', email)
    setSuccess(true)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <svg width="48" height="48" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ display: 'block', margin: '0 auto 12px' }}>
          <circle cx="40" cy="40" r="18" fill="#F7C842" />
          {SUCCESS_RAYS.map((ray, i) => (
            <line key={i} x1="40" y1="40" x2={ray.x} y2={ray.y}
              stroke="#F7C842" strokeWidth="2" strokeLinecap="round"
            />
          ))}
          <ellipse cx="34" cy="38" rx="3" ry="3" fill="#1C1208" />
          <ellipse cx="46" cy="38" rx="3" ry="3" fill="#1C1208" />
          <path d="M33 47 Q40 52 47 47" stroke="#1C1208" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.2rem',
          color: '#1C1208',
          fontWeight: 700,
        }}>
          Ti faremo sapere.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          htmlFor="newsletter-email"
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: '0.8rem',
            color: '#7A6548',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="la tua email..."
          aria-describedby={error ? 'newsletter-error' : undefined}
          style={{
            fontFamily: "'Lora', serif",
            fontSize: '1rem',
            padding: '10px 14px',
            border: error ? '2px solid #D93025' : '2px solid #D9C9A8',
            borderRadius: '2px 4px 3px 2px',
            background: '#FDFAF4',
            color: '#1C1208',
            outline: 'none',
          }}
        />
        {error && (
          <p
            id="newsletter-error"
            role="alert"
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: '0.8rem',
              color: '#D93025',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          style={{
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#FDFAF4',
            background: '#D93025',
            border: 'none',
            padding: '10px 28px',
            borderRadius: '2px 6px 4px 8px / 6px 2px 8px 4px',
            boxShadow: '3px 3px 0px #C0392B',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            transform: 'rotate(-0.5deg)',
            marginTop: '4px',
          }}
        >
          Avvisami →
        </button>
      </div>
    </form>
  )
}
