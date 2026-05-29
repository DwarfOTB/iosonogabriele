'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { createGradientMap } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'

const Z = -36

const SPOTS: Array<{ x: number; color: number; coneR: number; intensity: number }> = [
  { x: -4, color: 0xF5A623, coneR: 1.1, intensity: 1.2 },
  { x:  0, color: 0xF7C842, coneR: 0.9, intensity: 2.0 }, // Il Sole come faro
  { x:  4, color: 0xD93025, coneR: 1.1, intensity: 1.2 },
]

export function StageRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const onOverDates  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('dates') }, [setHovered])
  const onOutDates   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])
  const onClickDates = useCallback((e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); openPanel('dates') }, [openPanel])

  return (
    <group>
      {/* Dark background wall */}
      <mesh position={[0, 7, Z - 8]}>
        <boxGeometry args={[24, 14, 0.5]} />
        <meshBasicMaterial color={0x0d0905} />
      </mesh>

      {/* Ceiling (dark) */}
      <mesh position={[0, 14, Z - 4]}>
        <boxGeometry args={[20, 0.3, 12]} />
        <meshToonMaterial color={0x111008} gradientMap={gm} />
      </mesh>

      {/* Stage platform */}
      <mesh castShadow receiveShadow position={[0, 0.4, Z - 1]}>
        <boxGeometry args={[14, 0.8, 8]} />
        <meshToonMaterial color={0x6B4C2A} gradientMap={gm} />
      </mesh>

      {/* Left curtain */}
      <mesh position={[-7.5, 5, Z - 4]}>
        <boxGeometry args={[2, 10, 0.3]} />
        <meshToonMaterial color={0xC0392B} gradientMap={gm} />
      </mesh>
      {/* Right curtain */}
      <mesh position={[7.5, 5, Z - 4]}>
        <boxGeometry args={[2, 10, 0.3]} />
        <meshToonMaterial color={0xC0392B} gradientMap={gm} />
      </mesh>

      {/* Spot beams — coni puntati verso il basso */}
      {SPOTS.map(({ x, color, coneR, intensity }, i) => (
        <group key={i} position={[x, 12, Z + 2]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[coneR, 9, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.13} depthWrite={false} />
          </mesh>
          <pointLight color={color} intensity={intensity} distance={14} position={[0, -9, 0]} />
        </group>
      ))}

      {/* Minimal ambient for dark room */}
      <pointLight color={0x1a1005} intensity={0.3} position={[0, 6, Z]} distance={20} />

      {/* Mic stand */}
      <mesh position={[0, 1.75, Z]}>
        <cylinderGeometry args={[0.04, 0.04, 3.5, 6]} />
        <meshToonMaterial color={0x555555} gradientMap={gm} />
      </mesh>
      {/* Mic head */}
      <mesh position={[0, 3.6, Z]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshToonMaterial color={0x666666} gradientMap={gm} />
      </mesh>
      {/* Mic cable */}
      <mesh position={[0.3, 2, Z]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.015, 0.015, 2.5, 4]} />
        <meshToonMaterial color={0x333333} gradientMap={gm} />
      </mesh>

      {/* Floor monitors */}
      <mesh position={[-2.2, 0.6, Z + 1.5]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
      </mesh>
      <mesh position={[2.2, 0.6, Z + 1.5]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
      </mesh>

      {/* Ticket dispenser (INTERACTIVE → dates) */}
      <group
        position={[-4, 1.2, Z - 1]}
        onPointerOver={onOverDates}
        onPointerOut={onOutDates}
        onClick={onClickDates}
      >
        <mesh castShadow>
          <boxGeometry args={[1, 0.8, 0.5]} />
          <meshToonMaterial color={0xEDE0C4} gradientMap={gm} />
        </mesh>
        {/* Slot */}
        <mesh position={[0, -0.25, 0.26]}>
          <boxGeometry args={[0.5, 0.06, 0.02]} />
          <meshToonMaterial color={0x1C1208} gradientMap={gm} />
        </mesh>
        {/* Small label light */}
        <pointLight color={0xF7C842} intensity={0.4} distance={2} position={[0, 0.5, 0.3]} />
      </group>
    </group>
  )
}
