'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { createGradientMap } from '@/lib/materials'
import { Hotspot } from '@/components/world/Hotspot'
import { useWorldStore } from '@/store/worldStore'


// Trees: {x, z, trunk radius, canopy radius, trunk color, canopy color}
const TREES = [
  { x: -5.5, z: -1.0, tr: 0.16, cr: 1.1, tc: 0x4A3018, cc: 0x3A5C20 },
  { x:  5.5, z: -0.8, tr: 0.18, cr: 1.2, tc: 0x4A3018, cc: 0x5D8A3C },
  { x: -6.2, z: -3.8, tr: 0.20, cr: 1.4, tc: 0x3D2B12, cc: 0x3A5C20 },
  { x:  6.5, z: -3.5, tr: 0.22, cr: 1.6, tc: 0x3D2B12, cc: 0x5D8A3C },
]

export function HomeRoom() {
  const setRoom    = useWorldStore((s) => s.setRoom)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  // No MeshPhysicalMaterial transmission — breaks alpha:true WebGL context on fresh load
  const glassMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: 0xB0D8F0, transparent: true, opacity: 0.40,
      roughness: 0.05, metalness: 0.15,
    }),
    []
  )

  const onOverDoor  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('door') }, [setHovered])
  const onOutDoor   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])
  const onClickDoor = useCallback(
    (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); setRoom(1) },
    [setRoom]
  )

  return (
    <group>
      {/* ─── Sky tint light ─── */}
      <hemisphereLight args={[0x87CEEB, 0x5D8A3C, 0.9]} />
      <directionalLight position={[5, 10, 3]} color={0xFFF4E0} intensity={0.7} castShadow />

      {/* ─── Ground plane (grass) ─── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
        <planeGeometry args={[60, 44]} />
        <meshStandardMaterial color={0x5D8A3C} roughness={0.92} metalness={0} />
      </mesh>

      {/* ─── Stone path ─── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -1.5]}>
        <planeGeometry args={[1.8, 8.0]} />
        <meshStandardMaterial color={0xD6C9A0} roughness={0.95} metalness={0} />
      </mesh>
      {/* Path stones suggestion — thin boxes offset slightly */}
      {[-0.5, -2, -3.5, -5].map((pz, i) => (
        <mesh key={i} receiveShadow position={[0, 0.015, pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 0.9]} />
          <meshStandardMaterial color={i % 2 === 0 ? 0xC8B890 : 0xD6C9A0} roughness={0.98} metalness={0} />
        </mesh>
      ))}

      {/* ─── Building facade ─── */}
      <mesh receiveShadow position={[0, 3.2, -5.5]}>
        <boxGeometry args={[12, 6.4, 0.4]} />
        <meshStandardMaterial color={0xEDE0C4} roughness={0.88} metalness={0} />
      </mesh>
      {/* Plinth (base band) */}
      <mesh receiveShadow position={[0, 0.3, -5.5]}>
        <boxGeometry args={[12, 0.6, 0.5]} />
        <meshStandardMaterial color={0xD6C9A0} roughness={0.92} metalness={0} />
      </mesh>
      {/* Cornice (top band) */}
      <mesh receiveShadow position={[0, 6.5, -5.5]}>
        <boxGeometry args={[12.4, 0.5, 0.5]} />
        <meshStandardMaterial color={0xD6C9A0} roughness={0.85} metalness={0} />
      </mesh>

      {/* ─── Door (interactive → room 1 music) ─── */}
      <group
        position={[0, 1.55, -5.35]}
        onPointerOver={onOverDoor}
        onPointerOut={onOutDoor}
        onClick={onClickDoor}
      >
        {/* Door body (toon — brand element) */}
        <mesh castShadow>
          <boxGeometry args={[1.35, 3.1, 0.12]} />
          <meshToonMaterial color={0x4A3018} gradientMap={gm} />
        </mesh>
        {/* Door frame */}
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[1.65, 3.3, 0.1]} />
          <meshStandardMaterial color={0xD6C9A0} roughness={0.85} metalness={0} />
        </mesh>
        {/* Door knob */}
        <mesh position={[0.5, 0.1, 0.1]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshToonMaterial color={0xF7C842} gradientMap={gm} />
        </mesh>
        {/* Hover glow hint */}
        <pointLight color={0xF7C842} intensity={0.5} distance={2.5} position={[0, 0.5, 0.5]} />
      </group>

      {/* ─── Windows ─── */}
      {[-3.5, 3.5].map((wx, i) => (
        <group key={i} position={[wx, 3.8, -5.35]}>
          {/* Frame */}
          <mesh>
            <boxGeometry args={[1.8, 2.0, 0.14]} />
            <meshStandardMaterial color={0xD6C9A0} roughness={0.82} metalness={0} />
          </mesh>
          {/* Glass */}
          <mesh position={[0, 0, 0.05]} material={glassMat}>
            <boxGeometry args={[1.5, 1.7, 0.04]} />
          </mesh>
          {/* Cross */}
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[1.5, 0.06, 0.05]} />
            <meshStandardMaterial color={0xD6C9A0} roughness={0.8} metalness={0} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.06, 1.7, 0.05]} />
            <meshStandardMaterial color={0xD6C9A0} roughness={0.8} metalness={0} />
          </mesh>
          {/* Warm interior light through window */}
          <pointLight color={0xF5A623} intensity={0.6} distance={3} position={[0, 0, 0.5]} />
        </group>
      ))}

      {/* ─── Trees ─── */}
      {TREES.map(({ x, z, tr, cr, tc, cc }, i) => (
        <group key={i}>
          <mesh castShadow position={[x, cr * 0.9, z]}>
            <cylinderGeometry args={[tr, tr * 1.3, cr * 1.8, 6]} />
            <meshToonMaterial color={tc} gradientMap={gm} />
          </mesh>
          <mesh castShadow position={[x, cr * 2.1, z]}>
            <sphereGeometry args={[cr, 9, 7]} />
            <meshToonMaterial color={cc} gradientMap={gm} />
          </mesh>
        </group>
      ))}

      {/* ─── Fence posts (each side of path) ─── */}
      {[-1.2, 1.2].map((fx, fi) =>
        [-0.5, -2, -3.5, -5].map((fz, i) => (
          <mesh key={`${fi}-${i}`} castShadow position={[fx, 0.55, fz]}>
            <cylinderGeometry args={[0.06, 0.06, 1.1, 5]} />
            <meshToonMaterial color={0xD6C9A0} gradientMap={gm} />
          </mesh>
        ))
      )}

      {/* ─── Touch hotspot (mobile discovery) — enter the studio ─── */}
      <Hotspot position={[0, 2.4, -5.2]} onActivate={() => setRoom(1)} label="Entra nello studio" />
    </group>
  )
}
