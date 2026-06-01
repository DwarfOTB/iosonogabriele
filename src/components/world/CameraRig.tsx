'use client'
// Sprint 0: CameraRig replaced by static camera init.
// Camera never moves — see STAGE_CAMERA in rooms.ts.
// This file kept for import compatibility; replaced fully in Sprint 1.
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { STAGE_CAMERA } from '@/data/rooms'

export function CameraRig() {
  const { camera } = useThree()

  useEffect(() => {
    camera.lookAt(new THREE.Vector3(...STAGE_CAMERA.lookAt))
  }, [camera])

  return null
}
