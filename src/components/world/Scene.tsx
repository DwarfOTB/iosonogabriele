'use client'
import { Suspense, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { ROOMS } from '@/data/rooms'
import { useWorldStore } from '@/store/worldStore'
import { HomeRoom }    from '@/components/world/rooms/HomeRoom'
import { MusicRoom }   from '@/components/world/rooms/MusicRoom'
import { StageRoom }   from '@/components/world/rooms/StageRoom'
import { ArchiveRoom } from '@/components/world/rooms/ArchiveRoom'
import { MerchRoom }   from '@/components/world/rooms/MerchRoom'

// Cached colors — allocated once at module level (no per-frame GC)
const _target  = new THREE.Color()
const _bgColor = new THREE.Color(ROOMS[0].fogColor)
const _bgInit  = new THREE.Color(ROOMS[0].fogColor)

export function Scene() {
  const currentRoom = useWorldStore((s) => s.currentRoom)
  const { scene, gl } = useThree()

  // Set initial scene background imperatively — more reliable than <color attach>
  useEffect(() => {
    scene.background = _bgColor.clone()
    gl.setClearColor(new THREE.Color(ROOMS[0].fogColor), 1)
  }, [scene, gl])

  useFrame(() => {
    _target.set(ROOMS[currentRoom].fogColor)

    // Always ensure scene.background is a Color (World.tsx sets it in onCreated,
    // but useFrame guard ensures it's set even after HMR reloads)
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = _bgInit.clone()
    }
    ;(scene.background as THREE.Color).lerp(_target, 0.05)

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(_target, 0.05)
      scene.fog.density = THREE.MathUtils.lerp(
        scene.fog.density,
        ROOMS[currentRoom].fogDensity,
        0.05
      )
    }
  })

  return (
    <>
      {/* Fog (background lerped imperatively in useFrame) */}
      <fogExp2 attach="fog" args={[ROOMS[0].fogColor, ROOMS[0].fogDensity]} />

      {/* Base ambient — each room adds task lights */}
      <ambientLight color="#FFF8E7" intensity={0.40} />

      {/* Main directional — shadow caster */}
      <directionalLight
        position={[4, 10, 6]}
        color="#FFF4E0"
        intensity={0.80}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={8}
        shadow-camera-bottom={-2}
      />

      {/* HDRI environment disabled temporarily to diagnose suspension issue */}
      {/* <Suspense fallback={null}>
        <Environment preset="sunset" background={false} />
      </Suspense> */}

      {/* Active room — conditional mount */}
      {currentRoom === 0 && <HomeRoom    />}
      {currentRoom === 1 && <MusicRoom   />}
      {currentRoom === 2 && <StageRoom   />}
      {currentRoom === 3 && <ArchiveRoom />}
      {currentRoom === 4 && <MerchRoom   />}
    </>
  )
}
