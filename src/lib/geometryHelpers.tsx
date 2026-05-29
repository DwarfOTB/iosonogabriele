'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { createGradientMap } from '@/lib/materials'

interface RoomBoxProps {
  zOffset: number
  floorColor: THREE.ColorRepresentation
  wallColor: THREE.ColorRepresentation
  w?: number
  h?: number
  d?: number
}

export function RoomBox({ zOffset, floorColor, wallColor, w = 14, h = 8, d = 11 }: RoomBoxProps) {
  const gradMap  = useMemo(() => createGradientMap(3), [])
  const floorMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: floorColor, gradientMap: gradMap }),
    [floorColor, gradMap]
  )
  const wallMat = useMemo(
    () => new THREE.MeshToonMaterial({ color: wallColor, gradientMap: gradMap }),
    [wallColor, gradMap]
  )

  return (
    <group position={[0, 0, zOffset]}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.075, 0]} material={floorMat}>
        <boxGeometry args={[w, 0.15, d]} />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow position={[0, h / 2, -d / 2]} material={wallMat}>
        <boxGeometry args={[w, h, 0.2]} />
      </mesh>
      {/* Left wall */}
      <mesh receiveShadow position={[-w / 2, h / 2, 0]} material={wallMat}>
        <boxGeometry args={[0.2, h, d]} />
      </mesh>
      {/* Right wall */}
      <mesh receiveShadow position={[w / 2, h / 2, 0]} material={wallMat}>
        <boxGeometry args={[0.2, h, d]} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, h, 0]} material={wallMat}>
        <boxGeometry args={[w, 0.2, d]} />
      </mesh>
    </group>
  )
}
