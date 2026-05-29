'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { RoomBox } from '@/lib/geometryHelpers'
import { createGradientMap } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'

const Z = -72

const PRODUCTS = [
  { x: -3.2, h: 1.2, color: 0xD93025 },
  { x: -1.6, h: 0.8, color: 0x1C1208 },
  { x:  0.0, h: 1.5, color: 0xF7C842 },
  { x:  1.6, h: 0.9, color: 0xF4EDD8 },
  { x:  3.2, h: 1.1, color: 0x4A3018 },
]

export function MerchRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const onOverMerch  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('merch') }, [setHovered])
  const onOutMerch   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])
  const onClickMerch = useCallback((e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); openPanel('merch') }, [openPanel])

  return (
    <>
      <RoomBox zOffset={Z} floorColor={0x4A3018} wallColor={0x6B4C2A} />

      {/* Warm overhead light */}
      <pointLight color={0xFFF0A0} intensity={1.8} position={[0, 7, Z]} distance={18} />

      {/* Sun peeks through ceiling crack */}
      <pointLight color={0xF7C842} intensity={3.0} position={[2, 8.1, Z - 1]} distance={6} />
      {/* Ceiling crack frame */}
      <mesh position={[2, 7.95, Z - 1]}>
        <boxGeometry args={[1.5, 0.15, 0.8]} />
        <meshBasicMaterial color={0x1C1208} />
      </mesh>
      {/* Glow slit */}
      <mesh position={[2, 8.0, Z - 1]}>
        <boxGeometry args={[1.2, 0.08, 0.5]} />
        <meshBasicMaterial color={0xFFF0A0} transparent opacity={0.9} />
      </mesh>

      {/* Counter body */}
      <mesh castShadow receiveShadow position={[0, 0.75, Z]}>
        <boxGeometry args={[9, 1.5, 2]} />
        <meshToonMaterial color={0x6B4C2A} gradientMap={gm} />
      </mesh>
      {/* Counter top */}
      <mesh castShadow receiveShadow position={[0, 1.6, Z]}>
        <boxGeometry args={[9, 0.2, 2]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>

      {/* Product boxes (INTERACTIVE → merch) */}
      {PRODUCTS.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 1.7 + p.h / 2, Z - 0.2]}
          castShadow
          onPointerOver={onOverMerch}
          onPointerOut={onOutMerch}
          onClick={onClickMerch}
        >
          <boxGeometry args={[1.0, p.h, 0.8]} />
          <meshToonMaterial color={p.color} gradientMap={gm} />
        </mesh>
      ))}

      {/* Sign above */}
      <mesh position={[0, 5, Z - 5]}>
        <boxGeometry args={[5, 1, 0.15]} />
        <meshToonMaterial color={0xF4EDD8} gradientMap={gm} />
      </mesh>
      {/* Rope left */}
      <mesh position={[-2, 5.6, Z - 5]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 4]} />
        <meshToonMaterial color={0x7A6548} gradientMap={gm} />
      </mesh>
      {/* Rope right */}
      <mesh position={[2, 5.6, Z - 5]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 4]} />
        <meshToonMaterial color={0x7A6548} gradientMap={gm} />
      </mesh>
    </>
  )
}
