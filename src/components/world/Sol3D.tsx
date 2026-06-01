'use client'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { toonMaterial } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Per-room position + scale lookup.
// Camera at [0,1.6,7.5]. Back wall z=-5.5, ceiling y=6.
// The sun lives BEHIND the back wall (z<-5.5) or ABOVE the ceiling (y>6) so
// the set occludes it — it's glimpsed only through a window / skylight / slats,
// floating up & down. It's a consistent background element, never the centre.
const ROOM_CONFIGS: Array<{
  pos: [number, number, number]
  scale: number
}> = [
  { pos: [ 2.0,  7.0, -7.6], scale: 1.10 }, // 0 Home    — behind facade, orbits in the sky
  { pos: [-6.5,  4.2, -7.2], scale: 0.70 }, // 1 Musica  — 3/4 in the desk-wall window (left)
  { pos: [ 0.0,  5.4, -7.2], scale: 0.60 }, // 2 Live    — 3/4 in the high back window
  { pos: [-4.5,  8.6, -3.6], scale: 0.72 }, // 3 Archivio— corner of the giant attic skylight
  { pos: [ 0.0,  5.1, -7.2], scale: 0.62 }, // 4 Merch   — behind the shutter slats
]

// 12 rays — base every 30° + intentional variation
const RAY_ANGLES = [0, 28, 62, 88, 118, 145, 172, 208, 238, 265, 298, 328].map(
  (deg) => deg * (Math.PI / 180)
)
const RAY_LENGTHS = [2.2, 1.8, 2.5, 1.6, 2.0, 2.3, 1.9, 2.1, 1.7, 2.4, 2.0, 1.8]

// Working vectors — allocated once
const _targetPos   = new THREE.Vector3()
const _currentPos  = new THREE.Vector3()

export function Sol3D() {
  const currentRoom   = useWorldStore((s) => s.currentRoom)
  const expression    = ROOMS[currentRoom].sunExpression
  const reducedMotion = useReducedMotion()

  const solRef      = useRef<THREE.Group>(null!)
  const raysRef     = useRef<THREE.Group>(null!)
  const leftEyeRef  = useRef<THREE.Mesh>(null!)
  const rightEyeRef = useRef<THREE.Mesh>(null!)

  const currentScaleRef = useRef(ROOM_CONFIGS[0].scale)

  const bodyMat  = useMemo(() => toonMaterial(0xF7C842), [])
  const rayMat   = useMemo(() => toonMaterial(0xE07B2A), [])
  const eyeMat   = useMemo(() => toonMaterial(0x1C1208), [])
  const glowMat  = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xFFF0A0, transparent: true, opacity: 0.18 }),
    []
  )
  const cheekMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xE07B2A, transparent: true, opacity: 0.30 }),
    []
  )

  useFrame((state) => {
    if (!solRef.current || !raysRef.current || !leftEyeRef.current || !rightEyeRef.current) return

    const cfg = ROOM_CONFIGS[currentRoom]
    const t   = state.clock.elapsedTime
    const isHome = currentRoom === 0

    if (!reducedMotion) {
      if (isHome) {
        // Home: sun orbits gently (horizontal + vertical) around/behind the house
        _targetPos.set(
          cfg.pos[0] + Math.sin(t * 0.22) * 2.4,   // horizontal sweep
          cfg.pos[1] + Math.sin(t * 0.40) * 0.30,  // slight bob
          cfg.pos[2]
        )
        _currentPos.copy(solRef.current.position).lerp(_targetPos, 0.05)
        solRef.current.position.copy(_currentPos)
        solRef.current.rotation.z += 0.0030
      } else {
        // Interior rooms: FIXED in its peek position. Only spins on itself.
        // No travel / no vertical float → no occlusion bugs, no distraction.
        solRef.current.position.set(...cfg.pos)
        solRef.current.rotation.z += 0.0040
      }

      // Ray pulse (subtle breathing) — all rooms
      raysRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04)

      // Lerp scale toward target (smooth on room change)
      currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, cfg.scale, 0.06)
      solRef.current.scale.setScalar(currentScaleRef.current)
    } else {
      // Reduced motion: snap to position, no spin
      solRef.current.position.set(...cfg.pos)
      solRef.current.scale.setScalar(cfg.scale)
    }

    // Expression animation
    switch (expression) {
      case 'calm':
        leftEyeRef.current.scale.y  = 0.6
        rightEyeRef.current.scale.y = 0.6
        break
      case 'happy':
        leftEyeRef.current.scale.y  = 1.0
        rightEyeRef.current.scale.y = 1.0
        break
      case 'curious':
        leftEyeRef.current.scale.y  = 0.7
        rightEyeRef.current.scale.y = 1.2
        break
      case 'sleepy':
        leftEyeRef.current.scale.y  = 0.3
        rightEyeRef.current.scale.y = 0.3
        break
      case 'sad':
        leftEyeRef.current.scale.y  = 0.4
        rightEyeRef.current.scale.y = 0.4
        break
    }
  })

  // Initialize position to room 0 config
  const initPos = ROOM_CONFIGS[0].pos

  return (
    <group ref={solRef} position={initPos} scale={ROOM_CONFIGS[0].scale}>
      {/* Glow halo — kept tight (scale 1.0) so it never pokes in front of
          the facade/wall the sun sits behind */}
      <mesh material={glowMat} scale={1.02}>
        <sphereGeometry args={[1.8, 32, 32]} />
      </mesh>

      {/* Sun body */}
      <mesh material={bodyMat} castShadow>
        <sphereGeometry args={[1.8, 32, 32]} />
      </mesh>

      {/* Rays */}
      <group ref={raysRef}>
        {RAY_ANGLES.map((angle, i) => {
          const len  = RAY_LENGTHS[i]
          const dist = 1.8 + len / 2 + 0.1
          return (
            <mesh
              key={i}
              material={rayMat}
              position={[Math.cos(angle) * dist, Math.sin(angle) * dist, 0]}
              rotation={[0, 0, angle + Math.PI / 2]}
            >
              <cylinderGeometry args={[0.08, 0.12, len, 6]} />
            </mesh>
          )
        })}
      </group>

      {/* Left eye */}
      <mesh ref={leftEyeRef} material={eyeMat} position={[-0.48, 0.18, 1.7]}>
        <sphereGeometry args={[0.18, 12, 12]} />
      </mesh>

      {/* Right eye */}
      <mesh ref={rightEyeRef} material={eyeMat} position={[0.48, 0.18, 1.7]}>
        <sphereGeometry args={[0.18, 12, 12]} />
      </mesh>

      {/* Happy — cheeks */}
      {expression === 'happy' && (
        <>
          <mesh material={cheekMat} position={[-0.9, -0.18, 1.62]}>
            <sphereGeometry args={[0.24, 8, 8]} />
          </mesh>
          <mesh material={cheekMat} position={[0.9, -0.18, 1.62]}>
            <sphereGeometry args={[0.24, 8, 8]} />
          </mesh>
        </>
      )}

      {/* Sad — angled eyebrows */}
      {expression === 'sad' && (
        <>
          <mesh material={eyeMat} position={[-0.48, 0.51, 1.7]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.36, 0.06, 0.05]} />
          </mesh>
          <mesh material={eyeMat} position={[0.48, 0.51, 1.7]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.36, 0.06, 0.05]} />
          </mesh>
        </>
      )}
    </group>
  )
}
