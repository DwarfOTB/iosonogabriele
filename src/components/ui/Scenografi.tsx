'use client'
import type { ReactNode } from 'react'
import { useWorldStore } from '@/store/worldStore'
import s from './Scenografi.module.css'

/* ── A theatre crew strikes & builds the set ──
   Stagehands (@ / +) carry recognizable SET PIECES on/off:
   - ground pieces (door flat, window flat, desk, speaker, crate) are
     carried in/out horizontally by omini holding them up;
   - overhead pieces (painted backdrop, lighting truss) fly in/out of the
     fly-loft on ropes.
   dismantling = strike the current set; assembling = build the next one. */

const INK   = '#2E1F10'
const PAPER = '#F4EDD8'
const SUN   = '#F7C842'

// ── Set-piece visuals ───────────────────────────────────────────────────
function Backdrop(): ReactNode {
  return (
    <div className={s.board} style={{ background: 'linear-gradient(#BfdDEC, #F4E6C8)' }}>
      {/* painted sun */}
      <span style={{ position: 'absolute', top: '16%', left: '18%', width: '26%', aspectRatio: '1',
        borderRadius: '50%', background: SUN, boxShadow: `0 0 0 6px rgba(247,200,66,0.3)` }} />
      {/* horizon */}
      <span style={{ position: 'absolute', left: 0, right: 0, bottom: '30%', height: '4px', background: '#9C7A46' }} />
      <span style={{ position: 'absolute', left: '8%', bottom: '8%', fontFamily: "'Caveat',cursive",
        color: INK, fontSize: '1.1em', fontWeight: 700 }}>iosonogabriele</span>
    </div>
  )
}
function DoorFlat(): ReactNode {
  return (
    <div className={s.board} style={{ background: PAPER }}>
      <span style={{ position: 'absolute', inset: '12% 22%', background: '#6B4C2A', borderRadius: '3px' }} />
      <span style={{ position: 'absolute', top: '50%', right: '28%', width: '8%', aspectRatio: '1',
        borderRadius: '50%', background: SUN }} />
    </div>
  )
}
function WindowFlat(): ReactNode {
  return (
    <div className={s.board} style={{ background: PAPER }}>
      {/* panes */}
      <span style={{ position: 'absolute', inset: '14%', background: '#Bfe0F2', border: `4px solid ${INK}` }} />
      <span style={{ position: 'absolute', top: '14%', bottom: '14%', left: '49%', width: '4px', background: INK }} />
      <span style={{ position: 'absolute', left: '14%', right: '14%', top: '49%', height: '4px', background: INK }} />
      {/* sun in the corner (like the music-room window) */}
      <span style={{ position: 'absolute', top: '8%', right: '6%', width: '24%', aspectRatio: '1',
        borderRadius: '50%', background: SUN }} />
    </div>
  )
}
function Desk(): ReactNode {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '34%', background: '#3D2510', borderRadius: '3px' }} />
      <span style={{ position: 'absolute', bottom: 0, left: '10%', width: '8%', height: '70%', background: '#3D2510' }} />
      <span style={{ position: 'absolute', bottom: 0, right: '10%', width: '8%', height: '70%', background: '#3D2510' }} />
    </div>
  )
}
function Speaker(): ReactNode {
  return (
    <div className={s.board} style={{ background: '#1a1a1a', border: `3px solid #000` }}>
      <span style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)',
        width: '36%', aspectRatio: '1', borderRadius: '50%', background: '#3a3a3a' }} />
      <span style={{ position: 'absolute', bottom: '16%', left: '50%', transform: 'translateX(-50%)',
        width: '60%', aspectRatio: '1', borderRadius: '50%', background: '#2a2a2a' }} />
    </div>
  )
}
function Crate(): ReactNode {
  return (
    <div className={s.board} style={{ background: '#B8895A', border: `3px solid #8A6238` }}>
      <span style={{ position: 'absolute', top: '46%', left: 0, right: 0, height: '8%', background: '#E8D8B0' }} />
      <span style={{ position: 'absolute', top: '20%', left: '30%', right: '30%', height: '16%',
        background: PAPER, opacity: 0.85 }} />
    </div>
  )
}
function Truss(): ReactNode {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <span style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '40%', background: '#222',
        borderTop: '2px solid #444', borderBottom: '2px solid #444' }} />
      {[20, 50, 80].map((l) => (
        <span key={l} style={{ position: 'absolute', top: '70%', left: `${l}%`, transform: 'translateX(-50%)',
          width: '0', height: '0', borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
          borderTop: `12px solid ${SUN}` }} />
      ))}
    </div>
  )
}

// ── Piece layout ──────────────────────────────────────────────────────────
interface Piece {
  id: string
  kind: 'fly' | 'carry'
  x: number; y: number     // centre, vw / vh
  w: number; h: number     // size, vw / vh
  tx: string               // off-screen X (carry)
  fy: string               // off-screen Y (fly)
  carriers: number
  delay: number
  node: ReactNode
}

const PIECES: Piece[] = [
  { id: 'backdrop', kind: 'fly',   x: 50, y: 36, w: 38, h: 36, tx: '0', fy: '-135vh', carriers: 3, delay: 40,  node: <Backdrop /> },
  { id: 'truss',    kind: 'fly',   x: 50, y: 13, w: 56, h: 9,  tx: '0', fy: '-135vh', carriers: 2, delay: 0,   node: <Truss /> },
  { id: 'door',     kind: 'carry', x: 23, y: 52, w: 11, h: 34, tx: '-40vw', fy: '0', carriers: 2, delay: 90,  node: <DoorFlat /> },
  { id: 'window',   kind: 'carry', x: 78, y: 50, w: 13, h: 30, tx: '40vw',  fy: '0', carriers: 2, delay: 70,  node: <WindowFlat /> },
  { id: 'desk',     kind: 'carry', x: 41, y: 72, w: 18, h: 9,  tx: '-46vw', fy: '0', carriers: 2, delay: 150, node: <Desk /> },
  { id: 'speaker',  kind: 'carry', x: 62, y: 70, w: 7,  h: 13, tx: '46vw',  fy: '0', carriers: 1, delay: 120, node: <Speaker /> },
  { id: 'crate',    kind: 'carry', x: 32, y: 76, w: 7,  h: 10, tx: '-46vw', fy: '0', carriers: 1, delay: 175, node: <Crate /> },
]

function PieceEl({ p, dismantle }: { p: Piece; dismantle: boolean }) {
  const anim =
    p.kind === 'fly'
      ? dismantle ? s.flyOut : s.flyIn
      : dismantle ? s.carryOut : s.carryIn

  return (
    <div
      className={`${s.piece} ${anim}`}
      style={{
        left: `${p.x}vw`, top: `${p.y}vh`,
        width: `${p.w}vw`, height: `${p.h}vh`,
        '--tx': p.tx, '--fy': p.fy, '--delay': `${p.delay}ms`,
      } as React.CSSProperties}
    >
      <div className={s.flat}>{p.node}</div>
      {/* carrier omini along the base */}
      {Array.from({ length: p.carriers }).map((_, k) => (
        <span
          key={k}
          className={s.carrier}
          style={{ left: `${((k + 1) / (p.carriers + 1)) * 100}%` }}
        >
          <span className={s.omino}>{k % 3 === 2 ? '+' : '@'}</span>
        </span>
      ))}
    </div>
  )
}

// ── Free running crew ──────────────────────────────────────────────────────
function seededRand(seed: number) {
  let v = seed
  return () => { v = (v * 1664525 + 1013904223) & 0xffffffff; return (v >>> 0) / 0xffffffff }
}
interface Runner { y: number; size: number; dir: 1 | -1; delay: number; char: '@' | '+'; plank: boolean }
const RUNNERS: Runner[] = (() => {
  const rand = seededRand(0x3ce91b77)
  const out: Runner[] = []
  for (let i = 0; i < 14; i++) {
    out.push({
      y: 30 + rand() * 52,
      size: 15 + Math.round(rand() * 13),
      dir: rand() > 0.5 ? 1 : -1,
      delay: Math.round(rand() * 240),
      char: rand() > 0.3 ? '@' : '+',
      plank: rand() > 0.45,
    })
  }
  return out
})()

function RunnerEl({ r }: { r: Runner }) {
  // dir 1 = run left→right, -1 = right→left
  const from = r.dir === 1 ? '-12vw' : '112vw'
  const to   = r.dir === 1 ? '112vw' : '-12vw'
  return (
    <span
      className={s.runner}
      style={{
        top: `${r.y}vh`,
        fontSize: `${r.size}px`,
        '--from': from, '--to': to,
        '--delay': `${r.delay}ms`,
        transform: r.dir === -1 ? 'scaleX(-1)' : undefined,
      } as React.CSSProperties}
    >
      <span className={s.omino}>{r.char}</span>
      {r.plank && <span className={s.plank} />}
    </span>
  )
}

export function Scenografi() {
  const phase = useWorldStore((st) => st.transitionPhase)
  if (phase === 'idle') return null
  const dismantle = phase === 'dismantling'

  return (
    <div className={s.backdrop} aria-hidden="true">
      {/* key by phase so the strike/build restarts on dismantle→assemble */}
      <div key={phase} className={s.stage}>
        {PIECES.map((p) => <PieceEl key={p.id} p={p} dismantle={dismantle} />)}
        {RUNNERS.map((r, i) => <RunnerEl key={i} r={r} />)}
      </div>
    </div>
  )
}
