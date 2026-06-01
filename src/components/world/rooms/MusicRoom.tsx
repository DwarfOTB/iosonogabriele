'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { StageBox } from '@/lib/stageGeometry'
import { createGradientMap } from '@/lib/materials'
import { Hotspot } from '@/components/world/Hotspot'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'

// Room 1 = index 1
const ROOM = ROOMS[1]

// Desk legs positions (x, z offsets from desk center [0, *, -2.6])
const LEGS: [number, number][] = [[-2.2, -1.0], [2.2, -1.0], [-2.2, -4.1], [2.2, -4.1]]

// Back-wall window — sun (Sol3D room 1) floats behind it
const MUSIC_WINDOW = { x: -6.5, y: 3.5, w: 2.6, h: 3.4 }

export function MusicRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  // ---- pointer handlers ----
  const over  = useCallback((id: string) => () => { document.body.style.cursor = 'pointer'; setHovered(id) }, [setHovered])
  const out   = useCallback(() => { document.body.style.cursor = 'default'; setHovered(null) }, [setHovered])
  const click = useCallback((id: string) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); openPanel(id) }, [openPanel])

  // Desk materials (PBR — architecture)
  const deskMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3D2510', roughness: 0.86, metalness: 0 }),
    []
  )
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ROOM.wallColor, roughness: 0.88, metalness: 0 }),
    []
  )

  // Poster frame positions on back wall (z ≈ -5.4)
  const posters = [
    { x: -3.5, id: 'poster-0' },
    { x:  0.0, id: 'poster-1' },
    { x:  3.5, id: 'poster-2' },
  ]

  return (
    <>
      {/* ─── Stage shell with sun window on the desk (back) wall ─── */}
      <StageBox
        wallColor={ROOM.wallColor}
        floorColor={ROOM.floorColor}
        ceilingColor={ROOM.ceilingColor}
        hasCeiling={ROOM.hasCeiling}
        backWindow={MUSIC_WINDOW}
        skyColor="#FBE6B0"
      />

      {/* ─── Warm light spilling through the window ─── */}
      <pointLight color={0xF7C842} intensity={3.2} position={[MUSIC_WINDOW.x + 1.5, MUSIC_WINDOW.y, -4.8]} distance={12} />
      {/* Soft fill from right */}
      <pointLight color={0xFFF4E0} intensity={0.8} position={[4, 4.5, -3]}   distance={12} />
      {/* Overhead warm point */}
      <pointLight color={0xFFF0A0} intensity={1.2} position={[0, 5.5, -3]}   distance={14} />

      {/* ─── Desk (PBR walnut) ─── */}
      {/* Top surface */}
      <mesh castShadow receiveShadow position={[0, 0.88, -2.6]} material={deskMat}>
        <boxGeometry args={[5.2, 0.09, 1.6]} />
      </mesh>
      {/* Legs */}
      {LEGS.map(([lx, lz], i) => (
        <mesh key={i} castShadow position={[lx, 0.44, lz]} material={deskMat}>
          <cylinderGeometry args={[0.06, 0.06, 0.88, 5]} />
        </mesh>
      ))}
      {/* Back support rail */}
      <mesh castShadow position={[0, 0.15, -3.6]} material={deskMat}>
        <boxGeometry args={[5, 0.07, 0.07]} />
      </mesh>

      {/* ─── MacBook (Toon — brand, black, centred on desk) → tracklist ─── */}
      <group
        position={[0, 0.92, -2.6]}
        onPointerOver={over('tracklist')}
        onPointerOut={out}
        onClick={click('tracklist')}
      >
        {/* Base */}
        <mesh castShadow>
          <boxGeometry args={[1.9, 0.06, 1.3]} />
          <meshToonMaterial color={0x0a0a0a} gradientMap={gm} />
        </mesh>
        {/* Screen lid */}
        <mesh castShadow position={[0, 0.72, -0.58]} rotation={[-0.32, 0, 0]}>
          <boxGeometry args={[1.9, 1.25, 0.06]} />
          <meshToonMaterial color={0x060606} gradientMap={gm} />
        </mesh>
        {/* Display glow */}
        <mesh position={[0, 0.72, -0.55]} rotation={[-0.32, 0, 0]}>
          <boxGeometry args={[1.7, 1.08, 0.01]} />
          <meshBasicMaterial color={0x0a0f1a} />
        </mesh>
        {/* Apple logo hint */}
        <mesh position={[0, 0.72, -0.6]} rotation={[-0.32, 0, 0]}>
          <circleGeometry args={[0.12, 12]} />
          <meshBasicMaterial color={0x333333} />
        </mesh>
      </group>

      {/* ─── Studio monitors (Toon — brand objects) ─── */}
      {/* Left */}
      <group position={[-2.4, 1.48, -2.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 1.15, 0.55]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
        {/* Tweeter */}
        <mesh position={[0, 0.3, 0.29]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshToonMaterial color={0x444444} gradientMap={gm} />
        </mesh>
        {/* Woofer */}
        <mesh position={[0, -0.22, 0.29]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 14]} />
          <meshToonMaterial color={0x2a2a2a} gradientMap={gm} />
        </mesh>
      </group>
      {/* Right */}
      <group position={[2.4, 1.48, -2.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 1.15, 0.55]} />
          <meshToonMaterial color={0x1a1a1a} gradientMap={gm} />
        </mesh>
        <mesh position={[0, 0.3, 0.29]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshToonMaterial color={0x444444} gradientMap={gm} />
        </mesh>
        <mesh position={[0, -0.22, 0.29]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 14]} />
          <meshToonMaterial color={0x2a2a2a} gradientMap={gm} />
        </mesh>
      </group>

      {/* ─── Vinyl record on back wall (Toon — brand) → album ─── */}
      <group
        position={[4.5, 2.4, -5.35]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={over('album')}
        onPointerOut={out}
        onClick={click('album')}
      >
        {/* Disc */}
        <mesh>
          <cylinderGeometry args={[0.88, 0.88, 0.04, 40]} />
          <meshToonMaterial color={0x111111} gradientMap={gm} />
        </mesh>
        {/* Grooves hint (slightly lighter ring) */}
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.6, 0.85, 0.01, 40]} />
          <meshToonMaterial color={0x1e1e1e} gradientMap={gm} />
        </mesh>
        {/* Center label */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.045, 20]} />
          <meshToonMaterial color={0xF7C842} gradientMap={gm} />
        </mesh>
        {/* Spindle hole */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.06, 8]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
      </group>

      {/* ─── Poster frames on back wall (Toon — brand) ─── */}
      {posters.map(({ x, id }, i) => (
        <group
          key={i}
          position={[x, 3.3, -5.35]}
          onPointerOver={over(id)}
          onPointerOut={out}
          onClick={click(id)}
        >
          {/* Frame */}
          <mesh material={wallMat}>
            <boxGeometry args={[1.45, 1.95, 0.08]} />
          </mesh>
          {/* Poster face — toon coloured for now, texture in Sprint 4 */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[1.25, 1.72, 0.01]} />
            <meshToonMaterial
              color={[0xD93025, 0x1C1208, 0xF7C842][i]}
              gradientMap={gm}
            />
          </mesh>
          {/* Hang wire */}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
            <meshToonMaterial color={0x888888} gradientMap={gm} />
          </mesh>
        </group>
      ))}

      {/* ─── Plant corner (bottom-left, PBR pot + Toon leaves) ─── */}
      <group position={[-3.5, 0, -4.8]}>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.35, 0.26, 0.76, 8]} />
          <meshStandardMaterial color={0xC67A52} roughness={0.9} metalness={0} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.04, 8]} />
          <meshStandardMaterial color={0x3D2E1A} roughness={0.95} metalness={0} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.82, 8, 6]} />
          <meshToonMaterial color={0x5D8A3C} gradientMap={gm} />
        </mesh>
        {/* Second leaf cluster */}
        <mesh position={[0.45, 1.9, 0.2]}>
          <sphereGeometry args={[0.55, 7, 5]} />
          <meshToonMaterial color={0x3A5C20} gradientMap={gm} />
        </mesh>
      </group>

      {/* ─── Ceiling lamp (PBR shade) ─── */}
      <group position={[0, 5.7, -2.8]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.45, 0.45, 12]} />
          <meshStandardMaterial color={0x2A1E0E} roughness={0.7} metalness={0.2} />
        </mesh>
        <pointLight color={0xFFF0A0} intensity={1.5} distance={8} position={[0, -0.5, 0]} />
      </group>

      {/* ─── Touch hotspots (mobile discovery) ─── */}
      <Hotspot position={[0, 1.75, -2.4]}  onActivate={() => openPanel('tracklist')} label="Apri tracklist" />
      <Hotspot position={[4.5, 2.4, -5.1]} onActivate={() => openPanel('album')}     label="Ascolta album" />
      {posters.map(({ x, id }) => (
        <Hotspot key={id} position={[x, 3.3, -5.1]} onActivate={() => openPanel(id)} label="Apri singolo" />
      ))}
    </>
  )
}
