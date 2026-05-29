'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { RoomBox } from '@/lib/geometryHelpers'
import { createGradientMap } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'

const Z = -54
const BACK_WALL_Z = Z - 5.5 // -59.5

interface PolaroidDef {
  x: number
  y: number
  rz: number
  photoColor: number
}

const POLAROIDS: PolaroidDef[] = [
  { x: -5.2, y: 5.5, rz:  0.08, photoColor: 0xD93025 },
  { x: -3.4, y: 6.1, rz: -0.06, photoColor: 0xF7C842 },
  { x: -1.6, y: 5.8, rz:  0.10, photoColor: 0xAED6F1 },
  { x:  0.2, y: 6.2, rz: -0.09, photoColor: 0x5D8A3C },
  { x:  2.0, y: 5.6, rz:  0.07, photoColor: 0xC19A6B },
  { x:  3.8, y: 6.0, rz: -0.05, photoColor: 0xF5A623 },
  { x: -4.3, y: 3.8, rz: -0.10, photoColor: 0x4A3018 },
  { x: -1.0, y: 4.1, rz:  0.05, photoColor: 0xEDE0C4 },
  { x:  2.5, y: 3.9, rz:  0.09, photoColor: 0xC0392B },
]

const BOOKS = [
  { x: -4.8, h: 1.4, color: 0xD93025 },
  { x: -3.6, h: 1.0, color: 0x4A3018 },
  { x: -2.4, h: 1.6, color: 0xF7C842 },
  { x: -1.2, h: 1.2, color: 0x5D8A3C },
  { x:  0.6, h: 0.9, color: 0xEDE0C4 },
  { x:  1.8, h: 1.5, color: 0xC0392B },
]

export function ArchiveRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const makeClickHandler = useCallback(
    (id: string) => (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      openPanel(id)
    },
    [openPanel]
  )

  const onOverPhoto  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('photo') }, [setHovered])
  const onOutPhoto   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])

  return (
    <>
      <RoomBox zOffset={Z} floorColor={0xC19A6B} wallColor={0xA0784A} />

      {/* Warm overhead light */}
      <pointLight color={0xF5A623} intensity={1.5} position={[0, 7, Z]} distance={18} />

      {/* Polaroid frames on back wall */}
      {POLAROIDS.map((p, i) => (
        <group
          key={i}
          position={[p.x, p.y, BACK_WALL_Z + 0.1]}
          rotation={[0, 0, p.rz]}
          onPointerOver={onOverPhoto}
          onPointerOut={onOutPhoto}
          onClick={makeClickHandler(`photo-${i}`)}
        >
          {/* White frame */}
          <mesh>
            <boxGeometry args={[1.6, 2.0, 0.06]} />
            <meshToonMaterial color={0xFDFAF4} gradientMap={gm} />
          </mesh>
          {/* Photo area */}
          <mesh position={[0, 0.2, 0.04]}>
            <boxGeometry args={[1.3, 1.3, 0.07]} />
            <meshToonMaterial color={p.photoColor} gradientMap={gm} />
          </mesh>
          {/* Pin */}
          <mesh position={[0, 0.95, 0.06]}>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshToonMaterial color={0xD93025} gradientMap={gm} />
          </mesh>
        </group>
      ))}

      {/* Shelf */}
      <mesh position={[0, 1.5, Z - 4.5]}>
        <boxGeometry args={[12, 0.12, 0.8]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>
      {/* Books on shelf */}
      {BOOKS.map((b, i) => (
        <mesh key={i} position={[b.x, 1.5 + b.h / 2 + 0.06, Z - 4.5]}>
          <boxGeometry args={[0.8, b.h, 0.65]} />
          <meshToonMaterial color={b.color} gradientMap={gm} />
        </mesh>
      ))}

      {/* Corkboard texture suggestion — small nails pattern */}
      <mesh position={[0, 4.5, BACK_WALL_Z + 0.02]}>
        <boxGeometry args={[11, 5, 0.04]} />
        <meshToonMaterial color={0xC4925A} gradientMap={gm} />
      </mesh>
    </>
  )
}
