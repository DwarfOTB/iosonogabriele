'use client'
import { useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { RoomBox } from '@/lib/geometryHelpers'
import { createGradientMap } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'

const Z = -18

const DESK_LEGS: Array<[number, number, number]> = [
  [-2.2, 0.875, Z + 0.9],
  [ 2.2, 0.875, Z + 0.9],
  [-2.2, 0.875, Z - 0.9],
  [ 2.2, 0.875, Z - 0.9],
]

export function MusicRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const onOverTracklist  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('tracklist') }, [setHovered])
  const onOutTracklist   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])
  const onClickTracklist = useCallback((e: THREE.Event) => { (e as unknown as { stopPropagation: () => void }).stopPropagation(); openPanel('tracklist') }, [openPanel])

  const onOverAlbum  = useCallback(() => { document.body.style.cursor = 'pointer'; setHovered('album') }, [setHovered])
  const onOutAlbum   = useCallback(() => { document.body.style.cursor = 'default';  setHovered(null) }, [setHovered])
  const onClickAlbum = useCallback((e: THREE.Event) => { (e as unknown as { stopPropagation: () => void }).stopPropagation(); openPanel('album') }, [openPanel])

  const glassMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xF5A623, transparent: true, opacity: 0.6 }),
    []
  )

  return (
    <>
      <RoomBox zOffset={Z} floorColor={0x6B4C2A} wallColor={0xEDE0C4} />

      {/* === WINDOW (left wall) === */}
      {/* Frame */}
      <mesh position={[-6.9, 3.5, Z - 1]}>
        <boxGeometry args={[0.4, 3, 2.5]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>
      {/* Glass */}
      <mesh position={[-6.85, 3.5, Z - 1]} material={glassMat}>
        <boxGeometry args={[0.05, 2.7, 2.2]} />
      </mesh>
      {/* Warm light through window */}
      <pointLight color={0xF7C842} intensity={2.5} position={[-5, 4, Z - 1]} distance={12} />

      {/* === DESK === */}
      {/* Top */}
      <mesh castShadow receiveShadow position={[0, 1.88, Z - 0.5]}>
        <boxGeometry args={[5, 0.15, 2]} />
        <meshToonMaterial color={0x4A3018} gradientMap={gm} />
      </mesh>
      {/* Legs */}
      {DESK_LEGS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.07, 0.07, 1.75, 4]} />
          <meshToonMaterial color={0x4A3018} gradientMap={gm} />
        </mesh>
      ))}

      {/* === MacBook (interactive → tracklist) === */}
      <group position={[-0.5, 1.96, Z - 0.3]}>
        {/* Base */}
        <mesh
          castShadow
          onPointerOver={onOverTracklist}
          onPointerOut={onOutTracklist}
          onClick={onClickTracklist}
        >
          <boxGeometry args={[2, 0.08, 1.4]} />
          <meshToonMaterial color={0x2a2a2a} gradientMap={gm} />
        </mesh>
        {/* Screen */}
        <mesh
          position={[0, 0.68, -0.64]}
          rotation={[-0.35, 0, 0]}
          castShadow
          onPointerOver={onOverTracklist}
          onPointerOut={onOutTracklist}
          onClick={onClickTracklist}
        >
          <boxGeometry args={[2, 1.3, 0.06]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
        {/* Display */}
        <mesh position={[0, 0.68, -0.61]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.8, 1.1, 0.01]} />
          <meshBasicMaterial color={0x111111} />
        </mesh>
      </group>

      {/* === Speakers === */}
      {/* Left speaker */}
      <group position={[-2.5, 2.65, Z - 0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 1.2, 0.6]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
        <mesh position={[0, 0, 0.32]}>
          <cylinderGeometry args={[0.25, 0, 0.12, 12]} />
          <meshToonMaterial color={0x333333} gradientMap={gm} />
        </mesh>
      </group>
      {/* Right speaker */}
      <group position={[2.2, 2.65, Z - 0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 1.2, 0.6]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
        <mesh position={[0, 0, 0.32]}>
          <cylinderGeometry args={[0.25, 0, 0.12, 12]} />
          <meshToonMaterial color={0x333333} gradientMap={gm} />
        </mesh>
      </group>

      {/* === Vinyl record (interactive → album) === */}
      <group
        position={[3, 4.5, Z - 5.2]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={onOverAlbum}
        onPointerOut={onOutAlbum}
        onClick={onClickAlbum}
      >
        {/* Disc */}
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
          <meshToonMaterial color={0x111111} gradientMap={gm} />
        </mesh>
        {/* Label center */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
          <meshToonMaterial color={0xF7C842} gradientMap={gm} />
        </mesh>
      </group>

      {/* === Room point light === */}
      <pointLight color={0xFFF0A0} intensity={1.5} position={[0, 7, Z]} distance={20} />

      {/* === Plant (corner) === */}
      <group position={[-5, 0, Z - 3]}>
        {/* Pot */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.4, 0.3, 0.7, 8]} />
          <meshToonMaterial color={0xC67A52} gradientMap={gm} />
        </mesh>
        {/* Soil top */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.06, 8]} />
          <meshToonMaterial color={0x3D2E1A} gradientMap={gm} />
        </mesh>
        {/* Leaves */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.8, 8, 6]} />
          <meshToonMaterial color={0x5D8A3C} gradientMap={gm} />
        </mesh>
      </group>
    </>
  )
}
