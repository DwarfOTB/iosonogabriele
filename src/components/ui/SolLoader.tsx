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

// Seeded pseudo-random — same layout every mount
function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

interface LoaderChar {
  x: number      // vw %
  y: number      // vh %
  size: number   // px
  threshold: number // appear when progress >= this
  char: '@' | '+'
}

const LOADER_CHARS: LoaderChar[] = (() => {
  const rand = seededRand(0x7f3a1b9c)
  const chars: LoaderChar[] = []
  // 42 stagehands total — ~28 @, ~14 +
  for (let i = 0; i < 42; i++) {
    const isAt = i < 28
    // Avoid center (32–68 vw, 36–64 vh) where sun + bar sit
    let x = rand() * 100
    let y = rand() * 100
    if (x > 32 && x < 68) x = x < 50 ? x - 28 : x + 28
    if (y > 36 && y < 64) y = y < 50 ? y - 24 : y + 24
    x = Math.max(2, Math.min(96, x))
    y = Math.max(3, Math.min(95, y))

    chars.push({
      x, y,
      size: isAt ? 15 + Math.round(rand() * 13) : 12 + Math.round(rand() * 9),
      threshold: 3 + Math.round(rand() * 90), // 3–93%
      char: isAt ? '@' : '+',
    })
  }
  return chars
})()

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

      {/* Stagehand omini (@ +) — appear as progress advances, building the scene */}
      {LOADER_CHARS.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="lomino lwalk"
          style={{
            position: 'absolute',
            left: `${c.x}vw`,
            top:  `${c.y}vh`,
            fontSize: `${c.size}px`,
            fontFamily: c.char === '@' ? "'Caveat', cursive" : "'Courier Prime', monospace",
            color: '#F7C842',
            opacity: progress >= c.threshold ? 0.75 : 0,
            transition: 'opacity 0.4s ease-out',
            pointerEvents: 'none',
            userSelect: 'none',
            animationDelay: `${(i % 7) * 40}ms`,
          }}
        >
          {c.char}
        </span>
      ))}

      <style>{`
        @keyframes solRise {
          from { transform: translateY(60px); opacity: 0.2; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
        .lomino { position: relative; display: inline-block; }
        .lomino::before {
          content: ''; position: absolute; top: 42%; left: -26%;
          width: 152%; height: 9%; background: currentColor; border-radius: 2px;
        }
        .lomino::after {
          content: ''; position: absolute; bottom: -32%; left: 50%;
          width: 50%; height: 32%; transform: translateX(-50%);
          border-left: 2px solid currentColor; border-right: 2px solid currentColor;
        }
        @keyframes lwalk {
          0%   { transform: translateY(0)    rotate(-5deg); }
          50%  { transform: translateY(-12%) rotate(5deg); }
          100% { transform: translateY(0)    rotate(-5deg); }
        }
        .lwalk { animation: lwalk 380ms steps(2, end) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lwalk { animation: none; }
        }
      `}</style>
    </div>
  )
}
