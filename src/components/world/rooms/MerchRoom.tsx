'use client'
import { useCallback, useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { StageBox } from '@/lib/stageGeometry'
import { createGradientMap } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'

const ROOM = ROOMS[4]

// Shuttered transom on the back wall — sun (Sol3D room 4) peeks between slats
const SHUTTER = { x: 0, y: 5.0, w: 5.6, h: 1.8 }
// Half-open slats (fewer + bigger gaps → sun more visible)
const SLAT_Y = [-0.62, 0.0, 0.62]

const PRODUCTS = [
  { x: -3.0, h: 1.2, color: 0xD93025 },
  { x: -1.5, h: 0.8, color: 0x1C1208 },
  { x:  0.0, h: 1.5, color: 0xF7C842 },
  { x:  1.5, h: 0.9, color: 0xF4EDD8 },
  { x:  3.0, h: 1.1, color: 0x4A3018 },
]

export function MerchRoom() {
  const openPanel  = useWorldStore((s) => s.openPanel)
  const setHovered = useWorldStore((s) => s.setHovered)
  const gm = useMemo(() => createGradientMap(3), [])

  const over  = useCallback((id: string) => () => { document.body.style.cursor = 'pointer'; setHovered(id) }, [setHovered])
  const out   = useCallback(() => { document.body.style.cursor = 'default'; setHovered(null) }, [setHovered])
  const click = useCallback(
    (id: string) => (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); openPanel(id) },
    [openPanel]
  )

  const counterMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x4A3018, roughness: 0.82, metalness: 0 }),
    []
  )
  const counterTopMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x2A1208, roughness: 0.75, metalness: 0.05 }),
    []
  )

  return (
    <>
      {/* ─── Stage shell with a shuttered transom on the back wall ─── */}
      {/* The sun (Sol3D room 4) is glimpsed between half-open roller-shutter slats. */}
      <StageBox
        wallColor={ROOM.wallColor}
        floorColor={ROOM.floorColor}
        ceilingColor={ROOM.ceilingColor}
        hasCeiling={ROOM.hasCeiling}
        backWindow={SHUTTER}
        skyColor="#F6C24A"
      />

      {/* ─── Shutter slats across the transom (sun peeks between them) ─── */}
      {SLAT_Y.map((sy, i) => (
        <mesh key={i} position={[SHUTTER.x, SHUTTER.y + sy, -5.42]}>
          <boxGeometry args={[SHUTTER.w + 0.1, 0.2, 0.08]} />
          <meshStandardMaterial color={0x2A1A0C} roughness={0.85} metalness={0.15} />
        </mesh>
      ))}
      {/* Shutter side rails */}
      {[-SHUTTER.w / 2 - 0.12, SHUTTER.w / 2 + 0.12].map((rx, i) => (
        <mesh key={`r-${i}`} position={[SHUTTER.x + rx, SHUTTER.y, -5.42]}>
          <boxGeometry args={[0.14, SHUTTER.h + 0.4, 0.12]} />
          <meshStandardMaterial color={0x1C1208} roughness={0.8} metalness={0.2} />
        </mesh>
      ))}

      {/* ─── Atmospheric lighting ─── */}
      {/* Warm sun light spilling in through the shutter */}
      <pointLight color={0xF7C842} intensity={4.0} distance={12} position={[SHUTTER.x, SHUTTER.y, -4.6]} />
      <pointLight color={0xFFF0A0} intensity={1.4} distance={12} position={[0, 4, -3.5]} />
      {/* Dim ambient for shop mood */}
      <pointLight color={0xD4A050} intensity={0.6} distance={15} position={[-4, 3, -4]} />
      {/* Light beam (cone) from the transom toward the counter */}
      <mesh position={[SHUTTER.x, 3.6, -4.4]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.9, 3.6, 10, 1, true]} />
        <meshBasicMaterial color={0xFFE8A0} transparent opacity={0.07} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* ─── Counter (main interactive) ─── */}
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.8, -2.8]} material={counterMat}>
        <boxGeometry args={[9.5, 1.6, 1.8]} />
      </mesh>
      {/* Top surface */}
      <mesh castShadow receiveShadow position={[0, 1.62, -2.8]} material={counterTopMat}>
        <boxGeometry args={[9.5, 0.1, 1.8]} />
      </mesh>
      {/* Front panel texture suggestion */}
      <mesh position={[0, 0.8, -1.88]} material={counterMat}>
        <boxGeometry args={[9.5, 1.6, 0.04]} />
      </mesh>

      {/* ─── Product boxes on counter (interactive → merch) ─── */}
      {PRODUCTS.map((p, i) => (
        <group
          key={i}
          position={[p.x, 1.65 + p.h / 2, -2.8]}
          onPointerOver={over('merch')}
          onPointerOut={out}
          onClick={click('merch')}
        >
          <mesh castShadow>
            <boxGeometry args={[0.95, p.h, 0.75]} />
            <meshToonMaterial color={p.color} gradientMap={gm} />
          </mesh>
          {/* Label strip */}
          <mesh position={[0, 0, 0.39]}>
            <boxGeometry args={[0.75, 0.18, 0.01]} />
            <meshBasicMaterial color={0xFDFAF4} />
          </mesh>
        </group>
      ))}

      {/* ─── Hanging sign (below the shutter transom) ─── */}
      <mesh position={[0, 3.6, -5.2]}>
        <boxGeometry args={[5.5, 1.1, 0.12]} />
        <meshToonMaterial color={0xF4EDD8} gradientMap={gm} />
      </mesh>
      {/* @ symbol on sign (brand) */}
      <mesh position={[-1.0, 3.6, -5.14]}>
        <torusGeometry args={[0.22, 0.05, 8, 16]} />
        <meshToonMaterial color={0xD93025} gradientMap={gm} />
      </mesh>
      <mesh position={[-1.0, 3.6, -5.14]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshBasicMaterial color={0xD93025} />
      </mesh>
      {/* Ropes up to the shutter rail */}
      {[-2.2, 2.2].map((rx, i) => (
        <mesh key={i} position={[rx, 4.3, -5.2]} rotation={[0, 0, i === 0 ? -0.12 : 0.12]}>
          <cylinderGeometry args={[0.025, 0.025, 1.5, 4]} />
          <meshToonMaterial color={0x7A6548} gradientMap={gm} />
        </mesh>
      ))}

      {/* ─── Wall shelves with stacked boxes ─── */}
      {/* Left shelf */}
      <mesh receiveShadow position={[-5.5, 2.8, -5.0]}>
        <boxGeometry args={[2.5, 0.08, 0.9]} />
        <meshStandardMaterial color={0x4A3018} roughness={0.85} metalness={0} />
      </mesh>
      {[0xD93025, 0xF4EDD8, 0x1C1208].map((c, i) => (
        <mesh key={i} castShadow position={[-6.2 + i * 0.8, 3.1, -5.0]}>
          <boxGeometry args={[0.6, 0.55, 0.7]} />
          <meshToonMaterial color={c} gradientMap={gm} />
        </mesh>
      ))}
      {/* Right shelf */}
      <mesh receiveShadow position={[5.5, 2.8, -5.0]}>
        <boxGeometry args={[2.5, 0.08, 0.9]} />
        <meshStandardMaterial color={0x4A3018} roughness={0.85} metalness={0} />
      </mesh>
      {[0xF7C842, 0x4A3018, 0xD93025].map((c, i) => (
        <mesh key={i} castShadow position={[4.7 + i * 0.8, 3.1, -5.0]}>
          <boxGeometry args={[0.6, 0.55, 0.7]} />
          <meshToonMaterial color={c} gradientMap={gm} />
        </mesh>
      ))}
    </>
  )
}
