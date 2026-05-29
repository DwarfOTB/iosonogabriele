'use client'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { toonMaterial } from '@/lib/materials'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Original spec: [12, 20, -10] — outside FOV from cam[0] (steep downward tilt).
// Adjusted: visible upper-right area from cam[0] at [4,7,10] → [0,1.5,0].
const SUN_POS: [number, number, number] = [-2, 5, -6]

// 12 rays — base every 30deg + non-uniform variation ±5–15deg
const RAY_ANGLES = [0, 28, 62, 88, 118, 145, 172, 208, 238, 265, 298, 328].map(
  (deg) => deg * (Math.PI / 180)
)
const RAY_LENGTHS = [2.2, 1.8, 2.5, 1.6, 2.0, 2.3, 1.9, 2.1, 1.7, 2.4, 2.0, 1.8]

export function Sol3D() {
  const currentRoom  = useWorldStore((s) => s.currentRoom)
  const expression   = ROOMS[currentRoom].sunExpression
  const reducedMotion = useReducedMotion()

  const solRef       = useRef<THREE.Group>(null!)
  const raysRef      = useRef<THREE.Group>(null!)
  const leftEyeRef   = useRef<THREE.Mesh>(null!)
  const rightEyeRef  = useRef<THREE.Mesh>(null!)

  const bodyMat  = useMemo(() => toonMaterial(0xF7C842), [])
  const rayMat   = useMemo(() => toonMaterial(0xE07B2A), [])
  const eyeMat   = useMemo(() => toonMaterial(0x1C1208), [])
  const glowMat  = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xFFF0A0, transparent: true, opacity: 0.2 }),
    []
  )
  const cheekMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xE07B2A, transparent: true, opacity: 0.3 }),
    []
  )

  useFrame((state) => {
    if (!solRef.current || !raysRef.current || !leftEyeRef.current || !rightEyeRef.current) return

    if (!reducedMotion) {
      solRef.current.rotation.z += 0.003
      solRef.current.position.y = SUN_POS[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.5
      raysRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04)
    }

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

  return (
    <group ref={solRef} position={SUN_POS}>
      {/* Glow halo */}
      <mesh material={glowMat} scale={1.5}>
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
