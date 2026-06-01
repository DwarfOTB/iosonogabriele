'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Scene } from './Scene'
import { CameraRig } from './CameraRig'
import { Sol3D } from './Sol3D'
import { STAGE_CAMERA } from '@/data/rooms'

export default function World() {
  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      camera={{ position: STAGE_CAMERA.position, fov: STAGE_CAMERA.fov }}
    >
      <Suspense fallback={null}>
        <Scene />
        <CameraRig />
        <Sol3D />
      </Suspense>
    </Canvas>
  )
}
