'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Scene } from './Scene'
import { CameraRig } from './CameraRig'
import { Sol3D } from './Sol3D'
import { ROOMS } from '@/data/rooms'

export default function World() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      camera={{ position: ROOMS[0].cameraPos, fov: 55 }}
    >
      <Suspense fallback={null}>
        <Scene />
        <CameraRig />
        <Sol3D />
      </Suspense>
    </Canvas>
  )
}
