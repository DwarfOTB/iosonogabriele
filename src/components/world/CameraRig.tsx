'use client'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function CameraRig() {
  const { camera }       = useThree()
  const currentRoom      = useWorldStore((s) => s.currentRoom)
  const setTransitioning = useWorldStore((s) => s.setTransitioning)
  const reducedMotion    = useReducedMotion()
  const lookRef          = useRef(new THREE.Vector3(...ROOMS[0].cameraLookAt))

  useEffect(() => {
    const cfg      = ROOMS[currentRoom]
    const duration = reducedMotion ? 0 : 1.4

    setTransitioning(true)

    const tl = gsap.timeline({ onComplete: () => setTransitioning(false) })

    tl.to(
      camera.position,
      {
        x: cfg.cameraPos[0],
        y: cfg.cameraPos[1],
        z: cfg.cameraPos[2],
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.updateMatrixWorld()
        },
      },
      0
    )

    tl.to(
      lookRef.current,
      {
        x: cfg.cameraLookAt[0],
        y: cfg.cameraLookAt[1],
        z: cfg.cameraLookAt[2],
        duration,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(lookRef.current),
      },
      0
    )

    return () => {
      tl.kill()
    }
  }, [currentRoom, reducedMotion, camera, setTransitioning])

  return null
}
