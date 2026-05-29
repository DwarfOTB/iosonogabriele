'use client'
import { useMemo } from 'react'
import { createGradientMap } from '@/lib/materials'

const HILLS = [
  { pos: [-6,  -1.5, -12] as [number, number, number], r: 3.0,  color: 0x5D8A3C },
  { pos: [ 5,  -2.0, -14] as [number, number, number], r: 4.0,  color: 0x3A5C20 },
  { pos: [-3,  -1.0, -16] as [number, number, number], r: 2.5,  color: 0x5D8A3C },
  { pos: [ 3,  -1.5, -13] as [number, number, number], r: 3.5,  color: 0x3A5C20 },
  { pos: [ 0,  -2.0, -18] as [number, number, number], r: 4.5,  color: 0x5D8A3C },
  { pos: [-7,  -2.0, -17] as [number, number, number], r: 3.8,  color: 0x3A5C20 },
]

const TREES: Array<{ x: number; z: number }> = [
  { x: -3.5, z: -2.5 },
  { x:  4.5, z: -3.5 },
  { x: -5.0, z: -11.5 },
  { x:  5.5, z: -12.0 },
]

export function HomeRoom() {
  const gm = useMemo(() => createGradientMap(3), [])

  return (
    <group>
      {/* Ambient point light */}
      <pointLight color={0xFFF0A0} intensity={0.8} position={[0, 5, 3]} />

      {/* Terrain */}
      <mesh receiveShadow position={[0, -0.15, -5]}>
        <boxGeometry args={[50, 0.3, 30]} />
        <meshToonMaterial color={0x5D8A3C} gradientMap={gm} />
      </mesh>

      {/* Path */}
      <mesh receiveShadow position={[0, 0.025, -4]}>
        <boxGeometry args={[2, 0.05, 12]} />
        <meshToonMaterial color={0xF4EDD8} gradientMap={gm} />
      </mesh>

      {/* Hills */}
      {HILLS.map((h, i) => (
        <mesh key={i} position={h.pos}>
          <sphereGeometry args={[h.r, 12, 8]} />
          <meshToonMaterial color={h.color} gradientMap={gm} />
        </mesh>
      ))}

      {/* Building entrance facade */}
      <mesh receiveShadow position={[0, 2.5, -8]}>
        <boxGeometry args={[8, 5, 0.5]} />
        <meshToonMaterial color={0xEDE0C4} gradientMap={gm} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.4, -7.9]}>
        <boxGeometry args={[1.5, 2.8, 0.6]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>

      {/* Windows */}
      <mesh position={[-2.5, 3.2, -7.85]}>
        <boxGeometry args={[1.2, 1.2, 0.3]} />
        <meshBasicMaterial color={0xF5A623} transparent opacity={0.85} />
      </mesh>
      <mesh position={[2.5, 3.2, -7.85]}>
        <boxGeometry args={[1.2, 1.2, 0.3]} />
        <meshBasicMaterial color={0xF5A623} transparent opacity={0.85} />
      </mesh>
      {/* Window frames */}
      <mesh position={[-2.5, 3.2, -8]}>
        <boxGeometry args={[1.5, 1.5, 0.2]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>
      <mesh position={[2.5, 3.2, -8]}>
        <boxGeometry args={[1.5, 1.5, 0.2]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>

      {/* Trees */}
      {TREES.map(({ x, z }, i) => (
        <group key={i}>
          {/* Trunk */}
          <mesh castShadow position={[x, 1, z]}>
            <cylinderGeometry args={[0.2, 0.28, 2, 6]} />
            <meshToonMaterial color={0x4A3018} gradientMap={gm} />
          </mesh>
          {/* Canopy */}
          <mesh castShadow position={[x, 2.9, z]}>
            <sphereGeometry args={[1.3, 8, 6]} />
            <meshToonMaterial color={0x3A5C20} gradientMap={gm} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
