'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { StageBox } from '@/lib/stageGeometry'
import { createGradientMap } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'

const ROOM = ROOMS[3]

interface Polaroid {
  x: number
  y: number
  rz: number
  color: number
}

const POLAROIDS: Polaroid[] = [
  { x: -5.2, y: 4.5, rz:  0.08, color: 0xD93025 },
  { x: -3.4, y: 5.1, rz: -0.06, color: 0xF7C842 },
  { x: -1.6, y: 4.8, rz:  0.10, color: 0xAED6F1 },
  { x:  0.2, y: 5.2, rz: -0.09, color: 0x5D8A3C },
  { x:  2.0, y: 4.6, rz:  0.07, color: 0xC19A6B },
  { x:  3.8, y: 5.0, rz: -0.05, color: 0xF5A623 },
  { x: -4.3, y: 2.9, rz: -0.10, color: 0x4A3018 },
  { x: -1.0, y: 3.2, rz:  0.05, color: 0xEDE0C4 },
  { x:  2.5, y: 2.9, rz:  0.09, color: 0xC0392B },
]

// Old cardboard archive boxes on the shelf — hold cassettes & DVDs
// (placeholder for future video / backstage content). Each is interactive.
interface ArchiveBox {
  x: number
  rz: number       // slight askew rotation
  panel: string    // panel id opened on click
  label: string    // marker-pen label colour suggestion
}
const ARCHIVE_BOXES: ArchiveBox[] = [
  { x: -4.7, rz:  0.04, panel: 'photo-0', label: 'VHS' },
  { x: -3.0, rz: -0.05, panel: 'photo-1', label: 'DVD' },
  { x: -1.3, rz:  0.03, panel: 'photo-2', label: 'TAPE' },
]
// Cassette colours (upright tapes inside boxes)
const TAPE_COLORS = [0x1C1208, 0xD93025, 0x4A3018, 0xF7C842, 0xEDE0C4]

export function ArchiveRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const over  = useCallback((id: string) => () => { document.body.style.cursor = 'pointer'; setHovered(id) }, [setHovered])
  const out   = useCallback(() => { document.body.style.cursor = 'default'; setHovered(null) }, [setHovered])
  const click = useCallback(
    (id: string) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); openPanel(id) },
    [openPanel]
  )

  return (
    <>
      {/* ─── Giant attic roof skylight (spans the cork board) — sun in a corner ─── */}
      {/* Pulled forward (z toward camera) so the front edge clears the navbar. */}
      <StageBox
        wallColor={ROOM.wallColor}
        floorColor={ROOM.floorColor}
        ceilingColor={ROOM.ceilingColor}
        hasCeiling={ROOM.hasCeiling}
        skylight={{ x: 0, z: -3.6, w: 12, d: 4 }}
        skyColor="#EAD9B0"
      />

      {/* ─── Daylight pouring from the sun's corner of the skylight ─── */}
      <pointLight color={0xF7C842} intensity={2.6} distance={16} position={[-4.5, 5.2, -3.6]} />
      <pointLight color={0xFFF0C0} intensity={1.0} distance={14} position={[3, 5.2, -3.6]} />
      {/* Faint volumetric glow under the sun corner */}
      <mesh position={[-4.5, 4.4, -3.6]}>
        <coneGeometry args={[1.2, 3.0, 10, 1, true]} />
        <meshBasicMaterial color={0xFFE8A0} transparent opacity={0.05} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* ─── Warm hanging bulb ─── */}
      <group position={[0, 5.7, -3]}>
        <mesh>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshBasicMaterial color={0xFFF0A0} />
        </mesh>
        <pointLight color={0xF5A623} intensity={1.6} distance={12} position={[0, 0, 0]} />
      </group>
      {/* Secondary fill from left */}
      <pointLight color={0xF5A623} intensity={0.8} distance={10} position={[-4, 4, -2]} />

      {/* ─── Big cork board on back wall ─── */}
      <mesh receiveShadow position={[0, 3.8, -5.38]}>
        <boxGeometry args={[12, 5.5, 0.06]} />
        <meshStandardMaterial color={0xC4925A} roughness={0.96} metalness={0} />
      </mesh>
      {/* Cork board frame */}
      <mesh position={[0, 3.8, -5.42]}>
        <boxGeometry args={[12.4, 5.9, 0.05]} />
        <meshStandardMaterial color={0x4A3018} roughness={0.88} metalness={0} />
      </mesh>

      {/* ─── Polaroid photos (interactive) ─── */}
      {POLAROIDS.map((p, i) => (
        <group
          key={i}
          position={[p.x, p.y, -5.30]}
          rotation={[0, 0, p.rz]}
          onPointerOver={over(`photo-${i}`)}
          onPointerOut={out}
          onClick={click(`photo-${i}`)}
        >
          {/* White border */}
          <mesh>
            <boxGeometry args={[1.5, 1.9, 0.06]} />
            <meshToonMaterial color={0xFDFAF4} gradientMap={gm} />
          </mesh>
          {/* Photo area */}
          <mesh position={[0, 0.15, 0.04]}>
            <boxGeometry args={[1.2, 1.2, 0.07]} />
            <meshToonMaterial color={p.color} gradientMap={gm} />
          </mesh>
          {/* Push pin */}
          <mesh position={[0, 0.9, 0.06]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshToonMaterial color={0xD93025} gradientMap={gm} />
          </mesh>
        </group>
      ))}

      {/* ─── Floating shelf (left wall side) ─── */}
      <mesh castShadow receiveShadow position={[-3, 1.6, -4.0]}>
        <boxGeometry args={[5.5, 0.1, 0.95]} />
        <meshStandardMaterial color={0x4A3018} roughness={0.85} metalness={0} />
      </mesh>
      {/* Bracket supports */}
      {[-4.8, -0.6].map((bx, i) => (
        <mesh key={i} position={[bx, 1.4, -4.0]}>
          <boxGeometry args={[0.08, 0.4, 0.6]} />
          <meshStandardMaterial color={0x4A3018} roughness={0.85} metalness={0} />
        </mesh>
      ))}

      {/* ─── Old cardboard archive boxes (cassettes + DVDs inside) ─── */}
      {ARCHIVE_BOXES.map((b, i) => (
        <group
          key={i}
          position={[b.x, 1.65, -4.0]}
          rotation={[0, 0, b.rz]}
          onPointerOver={over(b.panel)}
          onPointerOut={out}
          onClick={click(b.panel)}
        >
          {/* Carton — 4 walls (open top), worn cardboard */}
          {/* front */}
          <mesh castShadow position={[0, 0.32, 0.36]}>
            <boxGeometry args={[1.45, 0.64, 0.05]} />
            <meshStandardMaterial color={0xB8895A} roughness={0.96} metalness={0} />
          </mesh>
          {/* back */}
          <mesh castShadow position={[0, 0.32, -0.36]}>
            <boxGeometry args={[1.45, 0.64, 0.05]} />
            <meshStandardMaterial color={0xA87C4E} roughness={0.96} metalness={0} />
          </mesh>
          {/* left */}
          <mesh castShadow position={[-0.72, 0.32, 0]}>
            <boxGeometry args={[0.05, 0.64, 0.72]} />
            <meshStandardMaterial color={0xA87C4E} roughness={0.96} metalness={0} />
          </mesh>
          {/* right */}
          <mesh castShadow position={[0.72, 0.32, 0]}>
            <boxGeometry args={[0.05, 0.64, 0.72]} />
            <meshStandardMaterial color={0xA87C4E} roughness={0.96} metalness={0} />
          </mesh>
          {/* base */}
          <mesh receiveShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[1.45, 0.05, 0.72]} />
            <meshStandardMaterial color={0x8A6238} roughness={0.97} metalness={0} />
          </mesh>
          {/* Marker-pen label strip */}
          <mesh position={[0, 0.42, 0.39]}>
            <boxGeometry args={[0.7, 0.16, 0.01]} />
            <meshBasicMaterial color={0xF4EDD8} />
          </mesh>

          {/* Cassettes — upright tapes packed in a row */}
          {[-0.5, -0.3, -0.1, 0.1, 0.3].map((cx, j) => (
            <mesh key={`c-${j}`} castShadow position={[cx, 0.36, -0.05]}>
              <boxGeometry args={[0.16, 0.42, 0.5]} />
              <meshToonMaterial color={TAPE_COLORS[(i + j) % TAPE_COLORS.length]} gradientMap={gm} />
            </mesh>
          ))}
          {/* A couple of DVD cases leaning at the back */}
          <mesh castShadow position={[0.5, 0.34, -0.08]} rotation={[0.12, 0, 0.04]}>
            <boxGeometry args={[0.06, 0.5, 0.62]} />
            <meshToonMaterial color={0x111111} gradientMap={gm} />
          </mesh>
          <mesh castShadow position={[0.58, 0.34, -0.06]} rotation={[0.14, 0, 0.03]}>
            <boxGeometry args={[0.06, 0.5, 0.62]} />
            <meshToonMaterial color={0xC0392B} gradientMap={gm} />
          </mesh>
        </group>
      ))}

      {/* ─── Small desk (right corner) ─── */}
      <mesh castShadow receiveShadow position={[4.5, 0.75, -4.5]}>
        <boxGeometry args={[3.5, 0.09, 1.2]} />
        <meshStandardMaterial color={0x4A3018} roughness={0.88} metalness={0} />
      </mesh>
      {/* Desk legs */}
      {[[3.3, 0.37, -3.95], [5.7, 0.37, -3.95], [3.3, 0.37, -5.0], [5.7, 0.37, -5.0]].map(([dx, dy, dz], i) => (
        <mesh key={i} castShadow position={[dx, dy, dz]}>
          <cylinderGeometry args={[0.05, 0.05, 0.74, 5]} />
          <meshStandardMaterial color={0x4A3018} roughness={0.88} metalness={0} />
        </mesh>
      ))}
    </>
  )
}
