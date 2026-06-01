'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Scene } from './Scene'
import { CameraRig } from './CameraRig'
import { Sol3D } from './Sol3D'
import { STAGE_CAMERA, ROOMS } from '@/data/rooms'

// Stable module-level config objects — prevent Canvas re-init on parent re-render.
// Inline object literals ({ ... }) create new references each render, which can
// cause R3F to detect a "changed" gl/camera prop and reinitialize the renderer.
const GL_CONFIG = { antialias: true, alpha: false } as const
const CAMERA_CONFIG = {
  position: STAGE_CAMERA.position,
  fov:      STAGE_CAMERA.fov,
  near:     0.1,
  far:      200,
} as const
const CANVAS_STYLE = { background: ROOMS[0].fogColor } as const
const SHADOW_CONFIG = { type: THREE.PCFSoftShadowMap } as const

function handleCreated({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) {
  // Set background + clearColor immediately (before first frame) to ensure
  // the scene is visible even on alpha:true WebGL contexts.
  const initColor = new THREE.Color(ROOMS[0].fogColor)
  gl.setClearColor(initColor, 1)
  scene.background = initColor.clone()
}

export default function World() {
  return (
    <Canvas
      frameloop="always"
      shadows={SHADOW_CONFIG}
      gl={GL_CONFIG}
      dpr={[1, 2]}
      camera={CAMERA_CONFIG}
      style={CANVAS_STYLE}
      onCreated={handleCreated}
    >
      <Suspense fallback={null}>
        <Scene />
        <CameraRig />
        <Sol3D />
      </Suspense>
    </Canvas>
  )
}
