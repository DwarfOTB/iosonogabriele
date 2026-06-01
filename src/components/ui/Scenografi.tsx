'use client'
import type { ReactNode, CSSProperties } from 'react'
import { useWorldStore } from '@/store/worldStore'
import s from './Scenografi.module.css'

/* ── Crew strikes & builds the REAL set of each room ──
   Room shell stays; only set objects move. dismantling: currentRoom is still
   the OLD room → its objects go OUT. assembling: currentRoom is the NEW room
   → its objects come IN. So we render ROOM_PIECES[currentRoom] both phases.

   Piece x/y/w/h are screen-projected (camera [0,1.6,6.6], fov 57, aspect~1.8)
   from each object's real 3D position, and colours match the 3D materials,
   so the carried silhouette lands exactly where (and as what) the object is. */

const INK = '#1C1208'
const FRAME = '#2E1F10'
const PAPER = '#F4EDD8'
const CREAM = '#EDE0C4'
const WOOD = '#3D2510'
const WOOD2 = '#4A3018'
const SUN = '#F7C842'
const RED = '#D93025'

const box = (bg: string, extra: CSSProperties = {}): CSSProperties => ({ position: 'absolute', background: bg, ...extra })

// ── Object silhouettes (match the 3D objects) ──────────────────────────────
function Tree(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD2, { bottom: 0, left: '44%', width: '12%', height: '46%' })} />
    <span style={box('#3A5C20', { top: 0, left: '50%', transform: 'translateX(-50%)', width: '92%', height: '64%', borderRadius: '50%' })} />
  </div>)
}
function Door(): ReactNode {
  return (<div className={s.board} style={{ background: CREAM }}>
    <span style={box(WOOD2, { inset: '6% 18%', borderRadius: '3px' })} />
    <span style={box(SUN, { top: '52%', right: '24%', width: '9%', aspectRatio: '1', borderRadius: '50%' })} />
  </div>)
}
function Window({ sun }: { sun?: boolean }): ReactNode {
  return (<div className={s.board} style={{ background: CREAM }}>
    <span style={box('#B0D8F0', { inset: '14%', border: `4px solid ${CREAM}` })} />
    <span style={box(CREAM, { top: '14%', bottom: '14%', left: '49%', width: '5px' })} />
    <span style={box(CREAM, { left: '14%', right: '14%', top: '49%', height: '5px' })} />
    {sun && <span style={box(SUN, { top: '8%', right: '6%', width: '24%', aspectRatio: '1', borderRadius: '50%' })} />}
  </div>)
}
function Desk(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD, { top: 0, left: 0, right: 0, height: '26%', borderRadius: '3px' })} />
    <span style={box(WOOD, { bottom: 0, left: '8%', width: '5%', height: '78%' })} />
    <span style={box(WOOD, { bottom: 0, right: '8%', width: '5%', height: '78%' })} />
  </div>)
}
function Macbook(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#0a0a0a', { bottom: 0, left: '6%', right: '6%', height: '20%', borderRadius: '2px' })} />
    <span style={box('#060606', { top: '2%', left: '12%', right: '12%', height: '76%', borderRadius: '2px' })} />
    <span style={box('#0a0f1a', { top: '10%', left: '18%', right: '18%', height: '60%' })} />
  </div>)
}
function Speaker(): ReactNode {
  return (<div className={s.board} style={{ background: '#1a1a1a', border: '2px solid #000' }}>
    <span style={box('#444444', { top: '16%', left: '50%', transform: 'translateX(-50%)', width: '28%', aspectRatio: '1', borderRadius: '50%' })} />
    <span style={box('#2a2a2a', { bottom: '14%', left: '50%', transform: 'translateX(-50%)', width: '60%', aspectRatio: '1', borderRadius: '50%' })} />
  </div>)
}
function Vinyl(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#111111', { inset: 0, borderRadius: '50%' })} />
    <span style={box(SUN, { inset: '38%', borderRadius: '50%' })} />
    <span style={box('#000', { inset: '47%', borderRadius: '50%' })} />
  </div>)
}
function Poster({ c }: { c: string }): ReactNode {
  return (<div className={s.board} style={{ background: CREAM, border: `4px solid ${CREAM}`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }}>
    <span style={box(c, { inset: '10%' })} />
  </div>)
}
function Plant(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#C67A52', { bottom: 0, left: '30%', width: '40%', height: '34%' })} />
    <span style={box('#5D8A3C', { top: 0, left: '50%', transform: 'translateX(-50%)', width: '90%', height: '72%', borderRadius: '50%' })} />
    <span style={box('#3A5C20', { top: '8%', left: '58%', width: '46%', height: '46%', borderRadius: '50%' })} />
  </div>)
}
function StagePlatform(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD, { inset: 0, borderRadius: '2px' })} />
    <span style={box('#5a3a18', { top: 0, left: 0, right: 0, height: '20%' })} />
  </div>)
}
function Curtain(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%',
    background: 'repeating-linear-gradient(90deg, #8B1A14 0 16%, #6B0F0A 16% 20%)' }} />)
}
function MicStand(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#777777', { bottom: 0, left: '44%', width: '12%', height: '100%' })} />
    <span style={box('#555555', { top: '2%', left: '24%', width: '52%', height: '14%', borderRadius: '40%' })} />
  </div>)
}
function Wedge(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#1a1a1a', { bottom: 0, left: 0, right: 0, height: '72%', transform: 'skewX(-18deg)', borderRadius: '2px' })} />
  </div>)
}
function Truss(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box('#222', { top: '28%', left: 0, right: 0, height: '40%', borderTop: '2px solid #444', borderBottom: '2px solid #444' })} />
    {[16, 38, 62, 84].map((l) => (
      <span key={l} style={{ position: 'absolute', top: '68%', left: `${l}%`, transform: 'translateX(-50%)',
        width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `12px solid ${SUN}` }} />
    ))}
  </div>)
}
function Ticket(): ReactNode {
  return (<div className={s.board} style={{ background: CREAM }}>
    <span style={box(INK, { bottom: '26%', left: '24%', right: '24%', height: '8%' })} />
  </div>)
}
function CorkBoard(): ReactNode {
  return (<div className={s.board} style={{ background: '#C4925A', border: `5px solid ${WOOD2}` }}>
    {[[12, 22], [30, 14], [48, 24], [66, 16], [80, 26], [22, 52], [44, 56], [64, 50]].map(([lx, ty], i) => (
      <span key={i} style={box(PAPER, { left: `${lx}%`, top: `${ty}%`, width: '13%', height: '26%', transform: `rotate(${i % 2 ? 6 : -5}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' })} />
    ))}
  </div>)
}
function Shelf(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD2, { top: '46%', left: 0, right: 0, height: '14%' })} />
    <span style={box(WOOD2, { top: '46%', left: '6%', width: '4%', height: '40%' })} />
    <span style={box(WOOD2, { top: '46%', right: '6%', width: '4%', height: '40%' })} />
  </div>)
}
function MerchShelf({ colors }: { colors: string[] }): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD2, { bottom: '32%', left: 0, right: 0, height: '12%' })} />
    {colors.map((c, i) => (
      <span key={i} style={box(c, { bottom: '44%', left: `${10 + i * 28}%`, width: '22%', height: '40%' })} />
    ))}
  </div>)
}
function CardboardBox(): ReactNode {
  const tapes = ['#1C1208', '#D93025', '#4A3018', '#F7C842']
  return (<div className={s.board} style={{ background: '#B8895A', border: '3px solid #8A6238' }}>
    <span style={box('#E8D8B0', { top: '42%', left: 0, right: 0, height: '8%' })} />
    {[18, 36, 54, 72].map((l, i) => (
      <span key={l} style={box(tapes[i], { bottom: '12%', left: `${l}%`, width: '8%', height: '38%' })} />
    ))}
  </div>)
}
function SmallDesk(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD2, { top: 0, left: 0, right: 0, height: '24%', borderRadius: '3px' })} />
    <span style={box(WOOD2, { bottom: 0, left: '10%', width: '6%', height: '80%' })} />
    <span style={box(WOOD2, { bottom: 0, right: '10%', width: '6%', height: '80%' })} />
  </div>)
}
function Counter(): ReactNode {
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <span style={box(WOOD2, { inset: 0, borderRadius: '2px' })} />
    <span style={box('#2A1208', { top: 0, left: 0, right: 0, height: '14%' })} />
  </div>)
}
function Products(): ReactNode {
  const items: [number, string, number][] = [
    [4, RED, 70], [24, INK, 50], [42, SUN, 85], [62, PAPER, 55], [80, WOOD2, 65],
  ]
  return (<div style={{ position: 'relative', width: '100%', height: '100%' }}>
    {items.map(([l, c, h], i) => (
      <span key={i} style={box(c, { bottom: 0, left: `${l}%`, width: '16%', height: `${h}%` })} />
    ))}
  </div>)
}
function Sign(): ReactNode {
  return (<div className={s.board} style={{ background: PAPER, border: `3px solid ${FRAME}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ color: RED, fontFamily: "'Caveat',cursive", fontWeight: 700, fontSize: '1.5em' }}>@+</span>
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

// Real objects per room — screen-projected positions/sizes
const ROOM_PIECES: Piece[][] = [
  // 0 — HOME: trees, door, windows
  [
    mk('carry', 18, 58, 14, 28, 2, 60,  <Tree />),
    mk('carry', 82, 58, 14, 28, 2, 90,  <Tree />),
    mk('carry', 50, 56, 11, 26, 2, 0,   <Door />),
    mk('carry', 35, 44, 12, 18, 1, 120, <Window sun />),
    mk('carry', 65, 44, 12, 18, 1, 150, <Window />),
  ],
  // 1 — MUSIC: posters(3), vinyl, speakers(2), macbook, desk, plant
  [
    mk('carry', 35, 37, 9,  15, 1, 0,   <Poster c={RED} />),
    mk('carry', 50, 37, 9,  15, 1, 40,  <Poster c={INK} />),
    mk('carry', 65, 37, 9,  15, 1, 70,  <Poster c={SUN} />),
    mk('carry', 69, 44, 11, 15, 1, 90,  <Vinyl />),
    mk('carry', 37, 52, 8,  16, 1, 110, <Speaker />),
    mk('carry', 63, 52, 8,  16, 1, 120, <Speaker />),
    mk('carry', 50, 53, 15, 12, 2, 60,  <Macbook />),
    mk('carry', 50, 60, 52, 12, 3, 160, <Desk />),
    mk('carry', 34, 50, 9,  18, 1, 175, <Plant />),
  ],
  // 2 — LIVE: truss + curtains (fly), stage, mic, wedges, ticket
  [
    mk('fly',   50, 8,  70, 8,  2, 0,   <Truss />),
    mk('fly',   15, 36, 11, 60, 2, 40,  <Curtain />),
    mk('fly',   85, 36, 11, 60, 2, 60,  <Curtain />),
    mk('carry', 50, 64, 88, 10, 4, 130, <StagePlatform />),
    mk('carry', 50, 46, 6,  30, 1, 90,  <MicStand />),
    mk('carry', 34, 59, 10, 7,  1, 150, <Wedge />),
    mk('carry', 66, 59, 10, 7,  1, 160, <Wedge />),
    mk('carry', 18, 58, 9,  12, 1, 175, <Ticket />),
  ],
  // 3 — ARCHIVE: cork board (fly), shelf, cardboard boxes(3), small desk
  [
    mk('fly',   50, 33, 76, 44, 3, 0,   <CorkBoard />),
    mk('carry', 35, 50, 34, 8,  2, 120, <Shelf />),
    mk('carry', 27, 46, 7,  8,  1, 150, <CardboardBox />),
    mk('carry', 36, 46, 7,  8,  1, 165, <CardboardBox />),
    mk('carry', 44, 46, 7,  8,  1, 180, <CardboardBox />),
    mk('carry', 71, 57, 18, 10, 2, 90,  <SmallDesk />),
  ],
  // 4 — MERCH: sign (fly), shelves(2), products, counter
  [
    mk('fly',   50, 34, 28, 7,  2, 0,   <Sign />),
    mk('carry', 26, 40, 14, 9,  1, 60,  <MerchShelf colors={[RED, PAPER, INK]} />),
    mk('carry', 74, 40, 14, 9,  1, 80,  <MerchShelf colors={[SUN, WOOD2, RED]} />),
    mk('carry', 50, 50, 30, 10, 2, 150, <Products />),
    mk('carry', 50, 60, 80, 16, 4, 120, <Counter />),
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

// ── Free running crew ──────────────────────────────────────────────────────
function seededRand(seed: number) {
  let v = seed
  return () => { v = (v * 1664525 + 1013904223) & 0xffffffff; return (v >>> 0) / 0xffffffff }
}
interface Runner { y: number; size: number; dir: 1 | -1; delay: number; char: '@' | '+'; plank: boolean }
const RUNNERS: Runner[] = (() => {
  const rand = seededRand(0x3ce91b77)
  const out: Runner[] = []
  for (let i = 0; i < 9; i++) {
    out.push({
      y: 26 + rand() * 56,
      size: 15 + Math.round(rand() * 12),
      dir: rand() > 0.5 ? 1 : -1,
      delay: Math.round(rand() * 220),
      char: rand() > 0.3 ? '@' : '+',
      plank: rand() > 0.55,
    })
  }
  return out
})()

function RunnerEl({ r }: { r: Runner }) {
  const from = r.dir === 1 ? '-12vw' : '112vw'
  const to = r.dir === 1 ? '112vw' : '-12vw'
  return (
    <span className={s.runner}
      style={{ top: `${r.y}vh`, fontSize: `${r.size}px`, '--from': from, '--to': to, '--delay': `${r.delay}ms` } as CSSProperties}>
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
      <div key={phase} className={s.stage}>
        {pieces.map((p, i) => <PieceEl key={i} p={p} dismantle={dismantle} />)}
        {RUNNERS.map((r, i) => <RunnerEl key={`r${i}`} r={r} />)}
      </div>
    </div>
  )
}
