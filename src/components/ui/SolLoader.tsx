'use client'
import { useEffect, useState } from 'react'

interface SolLoaderProps {
  onDone: () => void
}

const RAY_DEGS  = [0,30,60,90,120,150,180,210,240,270,300,330]
const RAY_LENS  = [30,26,29,27,31,25,28,26,30,27,29,26]
const INNER_R   = 20
const CX = 40
const CY = 40

function r2(n: number) { return Math.round(n * 100) / 100 }

const RAYS = RAY_DEGS.map((deg, i) => {
  const rad = deg * Math.PI / 180
  return {
    x1: r2(CX + Math.cos(rad) * INNER_R),
    y1: r2(CY + Math.sin(rad) * INNER_R),
    x2: r2(CX + Math.cos(rad) * RAY_LENS[i]),
    y2: r2(CY + Math.sin(rad) * RAY_LENS[i]),
  }
})

export function SolLoader({ onDone }: SolLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const MIN_MS = 1500

    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / MIN_MS) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setTimeout(onDone, 300)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div
      aria-label="Caricamento in corso"
      aria-busy="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d0905',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{ animation: 'solRise 1.5s ease-out forwards' }}>
        <svg width="100" height="100" viewBox="0 0 80 80" fill="none" aria-hidden="true" suppressHydrationWarning>
          <circle cx={CX} cy={CY} r="18" fill="#F7C842" />
          <circle cx={CX} cy={CY} r="22" fill="rgba(247,200,66,0.15)" />
          {RAYS.map((ray, i) => (
            <line
              key={i}
              x1={ray.x1} y1={ray.y1}
              x2={ray.x2} y2={ray.y2}
              stroke="#E07B2A" strokeWidth="2.5" strokeLinecap="round"
            />
          ))}
          <ellipse cx="34" cy="39" rx="3" ry="1.8" fill="#1C1208" />
          <ellipse cx="46" cy="39" rx="3" ry="1.8" fill="#1C1208" />
        </svg>
      </div>

      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: '1.1rem',
        color: '#7A6548',
        marginTop: '24px',
        letterSpacing: '0.08em',
      }}>
        il sole sta sorgendo...
      </p>

      <div style={{
        width: '200px',
        height: '3px',
        background: 'rgba(247,200,66,0.15)',
        borderRadius: '2px',
        marginTop: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#F7C842',
          boxShadow: '0 0 12px rgba(247,200,66,0.8)',
          borderRadius: '2px',
          transition: 'width 0.1s linear',
        }} />
      </div>

      <style>{`
        @keyframes solRise {
          from { transform: translateY(60px); opacity: 0.2; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
