'use client'
import type { ReactNode, CSSProperties } from 'react'
import { useWorldStore } from '@/store/worldStore'
import s from './Scenografi.module.css'

/* ── Crew strikes & builds the REAL set of each room ──
   The room shell (walls/floor) stays put; only the set objects move.
   - dismantling: currentRoom is still the OLD room → its objects are
     carried OUT.
   - assembling:  currentRoom is the NEW room → its objects are carried IN.
   So we just render ROOM_PIECES[currentRoom] in both phases. Each piece is a
   silhouette of an actual object in that room, hauled by omini (ground) or
   flown from the loft (overhead: curtains, signs, truss). */

const INK = '#2E1F10'
const PAPER = '#F4EDD8'
const SUN = '#F7C842'
const RED = '#D93025'

// ── Object silhouettes (each fills its piece box) ──────────────────────────
const box = (bg: string, extra: CSSProperties = {}): CSSProperties => ({
  position: 'absolute', background: bg, ...extra,
})

function Tree(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#4A3018', { bottom: 0, left: '44%', width: '12%', height: '46%' })} />
    <span style={box('#3A5C20', { top: 0, left: '50%', transform: 'translateX(-50%)', width: '92%', height: '64%', borderRadius: '50%' })} />
  </div>)
}
function Door(): ReactNode {
  return (<div className={s.board} style={{ background: PAPER }}>
    <span style={box('#6B4C2A', { inset: '8% 20%', borderRadius: '3px' })} />
    <span style={box(SUN, { top: '50%', right: '26%', width: '9%', aspectRatio: '1', borderRadius: '50%' })} />
  </div>)
}
function Window({ sun }: { sun?: boolean }): ReactNode {
  return (<div className={s.board} style={{ background: PAPER }}>
    <span style={box('#Bfe0F2', { inset: '14%', border: `4px solid ${INK}` })} />
    <span style={box(INK, { top: '14%', bottom: '14%', left: '49%', width: '4px' })} />
    <span style={box(INK, { left: '14%', right: '14%', top: '49%', height: '4px' })} />
    {sun && <span style={box(SUN, { top: '8%', right: '6%', width: '24%', aspectRatio: '1', borderRadius: '50%' })} />}
  </div>)
}
function Desk(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#3D2510', { top: 0, left: 0, right: 0, height: '32%', borderRadius: '3px' })} />
    <span style={box('#3D2510', { bottom: 0, left: '10%', width: '8%', height: '70%' })} />
    <span style={box('#3D2510', { bottom: 0, right: '10%', width: '8%', height: '70%' })} />
  </div>)
}
function Macbook(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#0a0a0a', { bottom: 0, left: '8%', right: '8%', height: '22%', borderRadius: '2px' })} />
    <span style={box('#060606', { top: '4%', left: '14%', right: '14%', height: '74%', borderRadius: '2px' })} />
    <span style={box('#16324d', { top: '12%', left: '20%', right: '20%', height: '56%' })} />
  </div>)
}
function Speaker(): ReactNode {
  return (<div className={s.board} style={{ background: '#1a1a1a', border: '3px solid #000' }}>
    <span style={box('#3a3a3a', { top: '14%', left: '50%', transform: 'translateX(-50%)', width: '34%', aspectRatio: '1', borderRadius: '50%' })} />
    <span style={box('#2a2a2a', { bottom: '16%', left: '50%', transform: 'translateX(-50%)', width: '58%', aspectRatio: '1', borderRadius: '50%' })} />
  </div>)
}
function Vinyl(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#111', { inset: 0, borderRadius: '50%' })} />
    <span style={box(SUN, { inset: '38%', borderRadius: '50%' })} />
  </div>)
}
function Poster({ c }: { c: string }): ReactNode {
  return (<div className={s.board} style={{ background: PAPER, border: `4px solid ${INK}` }}>
    <span style={box(c, { inset: '12%' })} />
  </div>)
}
function Plant(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#C67A52', { bottom: 0, left: '28%', width: '44%', height: '36%' })} />
    <span style={box('#5D8A3C', { top: 0, left: '50%', transform: 'translateX(-50%)', width: '88%', height: '70%', borderRadius: '50%' })} />
  </div>)
}
function StagePlatform(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#3D2510', { inset: 0, borderRadius: '3px' })} />
    <span style={box('#5a3a18', { top: 0, left: 0, right: 0, height: '22%' })} />
  </div>)
}
function Curtain(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%', background:
    'repeating-linear-gradient(90deg, #8B1A14 0 18%, #6B0F0A 18% 22%)', borderRadius: '0 0 4px 4px' }} />)
}
function MicStand(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#777', { bottom: 0, left: '46%', width: '8%', height: '100%' })} />
    <span style={box('#555', { top: '2%', left: '30%', width: '40%', height: '16%', borderRadius: '40%' })} />
  </div>)
}
function Wedge(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#1a1a1a', { bottom: 0, left: 0, right: 0, height: '70%', transform: 'skewX(-18deg)', borderRadius: '2px' })} />
  </div>)
}
function Truss(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#222', { top: '30%', left: 0, right: 0, height: '40%', borderTop: '2px solid #444', borderBottom: '2px solid #444' })} />
    {[20, 50, 80].map((l) => (
      <span key={l} style={{ position: 'absolute', top: '70%', left: `${l}%`, transform: 'translateX(-50%)',
        width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `12px solid ${SUN}` }} />
    ))}
  </div>)
}
function Ticket(): ReactNode {
  return (<div className={s.board} style={{ background: PAPER }}>
    <span style={box(INK, { bottom: '24%', left: '24%', right: '24%', height: '8%' })} />
  </div>)
}
function CorkBoard(): ReactNode {
  return (<div className={s.board} style={{ background: '#C4925A', border: `5px solid #4A3018` }}>
    {[[20, 24], [54, 18], [78, 30], [30, 60], [62, 56]].map(([lx, ty], i) => (
      <span key={i} style={box(PAPER, { left: `${lx}%`, top: `${ty}%`, width: '16%', height: '22%', transform: `rotate(${i % 2 ? 6 : -5}deg)` })} />
    ))}
  </div>)
}
function Shelf(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#4A3018', { top: '40%', left: 0, right: 0, height: '16%' })} />
    {[12, 40, 68].map((l, i) => (
      <span key={l} style={box(['#D93025', '#F7C842', '#5D8A3C'][i], { bottom: '44%', left: `${l}%`, width: '14%', height: '40%' })} />
    ))}
  </div>)
}
function CardboardBox(): ReactNode {
  const tapes = ['#1C1208', '#D93025', '#4A3018', '#F7C842']
  return (<div className={s.board} style={{ background: '#B8895A', border: '3px solid #8A6238' }}>
    <span style={box('#E8D8B0', { top: '44%', left: 0, right: 0, height: '8%' })} />
    {[20, 36, 52, 68].map((l, i) => (
      <span key={l} style={box(tapes[i], { bottom: '14%', left: `${l}%`, width: '8%', height: '36%' })} />
    ))}
  </div>)
}
function SmallDesk(): ReactNode { return <Desk /> }
function Counter(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#4A3018', { inset: 0, borderRadius: '3px' })} />
    <span style={box('#2A1208', { top: 0, left: 0, right: 0, height: '20%' })} />
  </div>)
}
function Products(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {[[6, RED, 60], [34, INK, 80], [60, SUN, 50], [80, PAPER, 70]].map(([l, c, h], i) => (
      <span key={i} style={box(c as string, { bottom: 0, left: `${l}%`, width: '16%', height: `${h}%` })} />
    ))}
  </div>)
}
function Sign(): ReactNode {
  return (<div className={s.board} style={{ background: PAPER, border: `3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ color: RED, fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: '1.6em' }}>@+</span>
  </div>)
}

// ── Piece type + factory ────────────────────────────────────────────────
interface Piece {
  kind: 'fly' | 'carry'
  x: number; y: number; w: number; h: number
  tx: string; fy: string
  carriers: number; delay: number
  node: ReactNode
}
function mk(kind: Piece['kind'], x: number, y: number, w: number, h: number, carriers: number, delay: number, node: ReactNode): Piece {
  const tx = x < 50 ? '-48vw' : '48vw'
  return { kind, x, y, w, h, tx, fy: '-135vh', carriers, delay, node }
}

// Real objects per room (positions roughly mirror the 3D framing)
const ROOM_PIECES: Piece[][] = [
  // 0 — HOME (exterior): trees, door, windows
  [
    mk('carry', 18, 60, 14, 26, 2, 60,  <Tree />),
    mk('carry', 82, 60, 14, 26, 2, 90,  <Tree />),
    mk('carry', 50, 58, 10, 24, 2, 0,   <Door />),
    mk('carry', 36, 46, 11, 18, 1, 120, <Window sun />),
    mk('carry', 64, 46, 11, 18, 1, 150, <Window />),
  ],
  // 1 — MUSIC: desk, macbook, speakers, vinyl, posters, plant
  [
    mk('carry', 42, 72, 18, 9,  2, 150, <Desk />),
    mk('carry', 50, 64, 8,  7,  1, 60,  <Macbook />),
    mk('carry', 33, 62, 7,  12, 1, 100, <Speaker />),
    mk('carry', 60, 62, 7,  12, 1, 120, <Speaker />),
    mk('carry', 74, 42, 9,  16, 1, 40,  <Vinyl />),
    mk('carry', 44, 36, 8,  16, 2, 0,   <Poster c={RED} />),
    mk('carry', 56, 36, 8,  16, 2, 80,  <Poster c={SUN} />),
    mk('carry', 20, 64, 8,  16, 1, 175, <Plant />),
  ],
  // 2 — LIVE: stage, curtains (fly), truss (fly), mic, wedges, ticket
  [
    mk('fly',   50, 14, 56, 9,  2, 0,   <Truss />),
    mk('fly',   22, 36, 12, 40, 2, 40,  <Curtain />),
    mk('fly',   78, 36, 12, 40, 2, 60,  <Curtain />),
    mk('carry', 50, 74, 30, 8,  3, 120, <StagePlatform />),
    mk('carry', 50, 56, 6,  20, 1, 90,  <MicStand />),
    mk('carry', 38, 70, 8,  7,  1, 150, <Wedge />),
    mk('carry', 62, 70, 8,  7,  1, 160, <Wedge />),
    mk('carry', 18, 70, 7,  9,  1, 180, <Ticket />),
  ],
  // 3 — ARCHIVE: cork board (fly), shelf, cardboard boxes, small desk
  [
    mk('fly',   50, 34, 34, 30, 3, 0,   <CorkBoard />),
    mk('carry', 24, 62, 16, 8,  2, 120, <Shelf />),
    mk('carry', 30, 72, 8,  9,  1, 150, <CardboardBox />),
    mk('carry', 44, 72, 8,  9,  1, 170, <CardboardBox />),
    mk('carry', 72, 70, 14, 8,  2, 90,  <SmallDesk />),
  ],
  // 4 — MERCH: sign (fly), counter, products, shelves
  [
    mk('fly',   50, 22, 22, 9,  2, 0,   <Sign />),
    mk('carry', 50, 70, 30, 10, 3, 120, <Counter />),
    mk('carry', 50, 60, 22, 9,  2, 160, <Products />),
    mk('carry', 20, 46, 12, 8,  1, 60,  <Shelf />),
    mk('carry', 80, 46, 12, 8,  1, 80,  <Shelf />),
  ],
]

function PieceEl({ p, dismantle }: { p: Piece; dismantle: boolean }) {
  const anim = p.kind === 'fly'
    ? (dismantle ? s.flyOut : s.flyIn)
    : (dismantle ? s.carryOut : s.carryIn)
  return (
    <div
      className={`${s.piece} ${anim}`}
      style={{
        left: `${p.x}vw`, top: `${p.y}vh`, width: `${p.w}vw`, height: `${p.h}vh`,
        '--tx': p.tx, '--fy': p.fy, '--delay': `${p.delay}ms`,
      } as CSSProperties}
    >
      <div className={s.flat}>{p.node}</div>
      {Array.from({ length: p.carriers }).map((_, k) => (
        <span key={k} className={s.carrier} style={{ left: `${((k + 1) / (p.carriers + 1)) * 100}%` }}>
          <span className={s.omino}>{k % 3 === 2 ? '+' : '@'}</span>
        </span>
      ))}
    </div>
  )
}

// ── Free running crew (generic, fills the gaps) ────────────────────────────
function seededRand(seed: number) {
  let v = seed
  return () => { v = (v * 1664525 + 1013904223) & 0xffffffff; return (v >>> 0) / 0xffffffff }
}
interface Runner { y: number; size: number; dir: 1 | -1; delay: number; char: '@' | '+'; plank: boolean }
const RUNNERS: Runner[] = (() => {
  const rand = seededRand(0x3ce91b77)
  const out: Runner[] = []
  for (let i = 0; i < 10; i++) {
    out.push({
      y: 28 + rand() * 54,
      size: 15 + Math.round(rand() * 12),
      dir: rand() > 0.5 ? 1 : -1,
      delay: Math.round(rand() * 220),
      char: rand() > 0.3 ? '@' : '+',
      plank: rand() > 0.5,
    })
  }
  return out
})()

function RunnerEl({ r }: { r: Runner }) {
  const from = r.dir === 1 ? '-12vw' : '112vw'
  const to = r.dir === 1 ? '112vw' : '-12vw'
  return (
    <span
      className={s.runner}
      style={{ top: `${r.y}vh`, fontSize: `${r.size}px`, '--from': from, '--to': to, '--delay': `${r.delay}ms` } as CSSProperties}
    >
      <span className={s.omino}>{r.char}</span>
      {r.plank && <span className={s.plank} />}
    </span>
  )
}

export function Scenografi() {
  const phase = useWorldStore((st) => st.transitionPhase)
  const currentRoom = useWorldStore((st) => st.currentRoom)
  if (phase === 'idle') return null

  const dismantle = phase === 'dismantling'
  const pieces = ROOM_PIECES[currentRoom] ?? []

  return (
    <div className={s.backdrop} aria-hidden="true">
      {/* key by phase so the strike/build restarts on dismantle→assemble */}
      <div key={phase} className={s.stage}>
        {pieces.map((p, i) => <PieceEl key={i} p={p} dismantle={dismantle} />)}
        {RUNNERS.map((r, i) => <RunnerEl key={`r${i}`} r={r} />)}
      </div>
    </div>
  )
}
