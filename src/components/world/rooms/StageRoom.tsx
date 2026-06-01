'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { createGradientMap } from '@/lib/materials'
import { Hotspot } from '@/components/world/Hotspot'
import { useWorldStore } from '@/store/worldStore'

// Spotlights: x, color, intensity — center one is Il Sole
const SPOTS = [
  { x: -4,  color: 0xF5A623, int: 1.8, coneH: 9, coneR: 1.2 },
  { x:  0,  color: 0xF7C842, int: 3.5, coneH: 9, coneR: 0.9 }, // Il Sole
  { x:  4,  color: 0xD93025, int: 1.8, coneH: 9, coneR: 1.2 },
]

export function StageRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const onOverDates  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('dates') }, [setHovered])
  const onOutDates   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])
  const onClickDates = useCallback((e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); openPanel('dates') }, [openPanel])

  const floorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.85, metalness: 0 }),
    []
  )
  const stageMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x3D2510, roughness: 0.80, metalness: 0 }),
    []
  )
  const darkWallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x0d0905, roughness: 0.98, metalness: 0 }),
    []
  )
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.7, metalness: 0.1 }),
    []
  )
  const glassMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x88AACC, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1 }),
    []
  )

  return (
    <group>
      {/* ─── Very dark ambient ─── */}
      <ambientLight color={0x0d0905} intensity={0.25} />

      {/* ─── Floor (dark, extends toward camera) ─── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} material={floorMat}>
        <planeGeometry args={[60, 44]} />
      </mesh>

      {/* ─── Back wall (dark) — segmented around a high window ─── */}
      {/* Window opening centred at (0,5), 3 wide × 2.2 tall. Sun (Sol3D) floats behind. */}
      <mesh position={[-4.75, 4, -5.5]} material={darkWallMat}>
        <planeGeometry args={[6.5, 8]} />
      </mesh>
      <mesh position={[4.75, 4, -5.5]} material={darkWallMat}>
        <planeGeometry args={[6.5, 8]} />
      </mesh>
      <mesh position={[0, 7.05, -5.5]} material={darkWallMat}>
        <planeGeometry args={[3, 1.9]} />
      </mesh>
      <mesh position={[0, 1.95, -5.5]} material={darkWallMat}>
        <planeGeometry args={[3, 3.9]} />
      </mesh>

      {/* Window dressing — sun glows through from behind */}
      <group position={[0, 5, -5.5]}>
        {/* Dusk sky glow behind the sun */}
        <mesh position={[0, 0, -2.4]}>
          <planeGeometry args={[3.6, 2.8]} />
          <meshBasicMaterial color={0x4A2E5A} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, 0, 0.03]} material={glassMat}>
          <planeGeometry args={[3, 2.2]} />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 1.1, 0.06]} material={frameMat}><boxGeometry args={[3.3, 0.16, 0.16]} /></mesh>
        <mesh position={[0, -1.1, 0.06]} material={frameMat}><boxGeometry args={[3.3, 0.16, 0.16]} /></mesh>
        <mesh position={[-1.5, 0, 0.06]} material={frameMat}><boxGeometry args={[0.16, 2.36, 0.16]} /></mesh>
        <mesh position={[1.5, 0, 0.06]} material={frameMat}><boxGeometry args={[0.16, 2.36, 0.16]} /></mesh>
        <mesh position={[0, 0, 0.05]} material={frameMat}><boxGeometry args={[0.08, 2.2, 0.12]} /></mesh>
      </group>

      {/* ─── Stage platform ─── */}
      <mesh castShadow receiveShadow position={[0, 0.4, -3.2]} material={stageMat}>
        <boxGeometry args={[12, 0.8, 4.5]} />
      </mesh>
      {/* Stage front edge (lighter planks) */}
      <mesh position={[0, 0.82, -1.0]} material={stageMat}>
        <boxGeometry args={[12, 0.04, 0.12]} />
      </mesh>

      {/* ─── Curtains (deep red) — lowered to stay in frame at z=6.6 ─── */}
      {/* Left curtain */}
      <mesh castShadow position={[-6.5, 3.1, -3.0]}>
        <boxGeometry args={[2.2, 6.4, 0.2]} />
        <meshToonMaterial color={0x8B1A14} gradientMap={gm} />
      </mesh>
      {/* Right curtain */}
      <mesh castShadow position={[6.5, 3.1, -3.0]}>
        <boxGeometry args={[2.2, 6.4, 0.2]} />
        <meshToonMaterial color={0x8B1A14} gradientMap={gm} />
      </mesh>
      {/* Curtain valance top */}
      <mesh position={[0, 6.5, -3.0]}>
        <boxGeometry args={[15, 0.8, 0.3]} />
        <meshToonMaterial color={0x6B0F0A} gradientMap={gm} />
      </mesh>

      {/* ─── Spot rigs from ceiling ─── */}
      {SPOTS.map(({ x, color, int: intensity, coneH, coneR }, i) => (
        <group key={i} position={[x, 7.5, -3.0]}>
          {/* Rig housing */}
          <mesh>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={0x111111} roughness={0.8} metalness={0.5} />
          </mesh>
          {/* Light cone (volumetric feel) */}
          <mesh position={[0, -coneH / 2 - 0.15, 0]}>
            <coneGeometry args={[coneR, coneH, 10, 1, true]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={i === 1 ? 0.18 : 0.12}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Actual spot */}
          <spotLight
            color={color}
            intensity={intensity * 40}
            distance={12}
            angle={Math.atan(coneR / coneH)}
            penumbra={0.35}
            castShadow
            position={[0, 0, 0]}
            target-position={[x, 0, -3.0]}
          />
        </group>
      ))}

      {/* ─── Mic stand (Toon — brand) ─── */}
      <group position={[0, 0.8, -3.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 3.4, 6]} />
          <meshToonMaterial color={0x777777} gradientMap={gm} />
        </mesh>
        {/* Boom arm */}
        <mesh position={[0.5, 1.5, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 4]} />
          <meshToonMaterial color={0x666666} gradientMap={gm} />
        </mesh>
        {/* Mic head */}
        <mesh position={[0.85, 1.8, 0]}>
          <capsuleGeometry args={[0.14, 0.28, 6, 12]} />
          <meshToonMaterial color={0x555555} gradientMap={gm} />
        </mesh>
        {/* Pop filter */}
        <mesh position={[0.85, 1.8, 0.25]}>
          <circleGeometry args={[0.18, 12]} />
          <meshToonMaterial color={0x888888} gradientMap={gm} />
        </mesh>
      </group>

      {/* ─── Floor monitors (wedges) ─── */}
      <group position={[-2.5, 0.82, -1.5]} rotation={[-0.4, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.45, 0.7]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
      </group>
      <group position={[2.5, 0.82, -1.5]} rotation={[-0.4, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.45, 0.7]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
      </group>

      {/* ─── Ticket dispenser (interactive → dates) ─── */}
      <group
        position={[-5, 0.85, -1.5]}
        onPointerOver={onOverDates}
        onPointerOut={onOutDates}
        onClick={onClickDates}
      >
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.9, 0.5]} />
          <meshToonMaterial color={0xEDE0C4} gradientMap={gm} />
        </mesh>
        {/* Slot */}
        <mesh position={[0, -0.3, 0.27]}>
          <boxGeometry args={[0.45, 0.05, 0.02]} />
          <meshToonMaterial color={0x1C1208} gradientMap={gm} />
        </mesh>
        {/* Label */}
        <pointLight color={0xF7C842} intensity={0.6} distance={2} position={[0, 0.6, 0.4]} />
      </group>

      {/* ─── Touch hotspot (mobile discovery) ─── */}
      <Hotspot position={[-5, 1.5, -1.2]} onActivate={() => openPanel('dates')} label="Date del tour" />
    </group>
  )
}
