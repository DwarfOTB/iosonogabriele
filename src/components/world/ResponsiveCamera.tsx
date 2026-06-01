'use client'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import { computeFit } from '@/lib/projection'

// Applies the contain-fit camera for the current room + viewport aspect.
// Replaces the old static CameraRig: fov / position adapt so nothing gets
// cropped horizontally on portrait/mobile.
export function ResponsiveCamera() {
  const { camera, size } = useThree()
  const currentRoom = useWorldStore((s) => s.currentRoom)

  useEffect(() => {
    const aspect = size.width / size.height
    const fit = computeFit(currentRoom, aspect)
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = fit.fov
    cam.position.set(0, fit.camY, fit.camZ)
    cam.lookAt(new THREE.Vector3(0, fit.lookY, fit.lookZ))
    cam.updateProjectionMatrix()
  }, [camera, currentRoom, size.width, size.height])

  return null
}
