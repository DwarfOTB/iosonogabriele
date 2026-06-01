'use client'
import { useWorldStore } from '@/store/worldStore'
import type { TransitionPhase } from '@/store/worldStore'
import s from './Scenografi.module.css'

/* ── Stagehands strike & build the set, running horizontally ──
   dismantling: workers RUN IN from the left & right edges, reach a set
     piece, tug it loose (dismantle beat), then RUN OUT the way they came
     hauling the stolen pixel with them.
   assembling:  fresh workers RUN IN carrying the new room's pixels, drop
     each into its grid slot, then RUN OUT empty.
   Motion is strictly horizontal (y fixed per piece). ~42 pieces. */

interface Piece {
  gx: number       // grid x, vw
  gy: number       // grid y, vh
  tx: string       // off-screen horizontal translate (same side they enter/exit)
  size: number     // worker glyph px
  block: number    // pixel block px
  color: string
  char: '@' | '+'
  delay: number    // ms
}

const PALETTE = ['#D93025', '#F7C842', '#5D8A3C', '#4A3018', '#F4EDD8', '#E07B2A', '#AED6F1']

function seededRand(seed: number) {
  let v = seed
  return () => {
    v = (v * 1664525 + 1013904223) & 0xffffffff
    return (v >>> 0) / 0xffffffff
  }
}

function buildPieces(): Piece[] {
  const rand = seededRand(0x91a7c3f5)
  const COLS = 9
  const ROWS = 5
  const X0 = 18, X1 = 82
  const Y0 = 20, Y1 = 76
  const pieces: Piece[] = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (rand() < 0.05) continue
      const gx = X0 + (c / (COLS - 1)) * (X1 - X0)
      const gy = Y0 + (r / (ROWS - 1)) * (Y1 - Y0)

      // Enter & exit the nearest horizontal edge (left crew / right crew)
      const fromLeft = gx < 50
      const tx = fromLeft ? `${-(gx + 12).toFixed(0)}vw` : `${(100 - gx + 12).toFixed(0)}vw`

      const isAt = rand() > 0.32
      pieces.push({
        gx, gy, tx,
        size: isAt ? 17 + Math.round(rand() * 12) : 13 + Math.round(rand() * 9),
        block: 11 + Math.round(rand() * 12),
        color: PALETTE[Math.floor(rand() * PALETTE.length)],
        char: isAt ? '@' : '+',
        delay: Math.round(rand() * 150),
      })
    }
  }
  return pieces
}

const PIECES: Piece[] = buildPieces()

interface PieceElProps {
  p: Piece
  phase: 'dismantling' | 'assembling'
}

function PieceEl({ p, phase }: PieceElProps) {
  const dismantle = phase === 'dismantling'
  return (
    <div
      className={s.piece}
      style={{
        left: `${p.gx}vw`,
        top:  `${p.gy}vh`,
        '--tx': p.tx,
        '--delay': `${p.delay}ms`,
        '--block': `${p.block}px`,
        '--block-color': p.color,
        fontSize: `${p.size}px`,
        fontFamily: p.char === '@' ? "'Caveat', cursive" : "'Courier Prime', monospace",
      } as React.CSSProperties}
    >
      {/* The set pixel being carried / dropped */}
      <span className={`${s.blockWrap} ${dismantle ? s.blkOut : s.blkIn}`}>
        <span className={s.block} />
      </span>
      {/* The running stagehand */}
      <span className={`${s.workerWrap} ${dismantle ? s.wkOut : s.wkIn}`}>
        <span className={s.omino}>{p.char}</span>
      </span>
    </div>
  )
}

export function Scenografi() {
  const phase = useWorldStore((st) => st.transitionPhase)

  if (phase === 'idle') return null

  return (
    <div className={s.backdrop} aria-hidden="true">
      {/* key by phase so the run-in/run-out restarts on dismantle→assemble */}
      <div key={phase} className={s.stage}>
        {PIECES.map((p, i) => (
          <PieceEl key={i} p={p} phase={phase} />
        ))}
      </div>
    </div>
  )
}
