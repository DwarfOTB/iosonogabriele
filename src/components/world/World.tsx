'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Scene } from './Scene'
import { CameraRig } from './CameraRig'
import { Sol3D } from './Sol3D'
import { ROOMS } from '@/data/rooms'
import { useRoomNavigation } from '@/hooks/useRoomNavigation'

function SolLoader() {
  return null
}

export default function World() {
  useRoomNavigation()

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      camera={{ position: ROOMS[0].cameraPos, fov: 55 }}
    >
      <Suspense fallback={<SolLoader />}>
        <Scene />
        <CameraRig />
        <Sol3D />
      </Suspense>
    </Canvas>
  )
}
