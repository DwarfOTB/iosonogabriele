'use client'
import { Suspense } from 'react'
import { ROOMS } from '@/data/rooms'
import { HomeRoom } from '@/components/world/rooms/HomeRoom'
import { MusicRoom } from '@/components/world/rooms/MusicRoom'
import { StageRoom } from '@/components/world/rooms/StageRoom'
import { ArchiveRoom } from '@/components/world/rooms/ArchiveRoom'
import { MerchRoom } from '@/components/world/rooms/MerchRoom'

export function Scene() {
  return (
    <>
      <color attach="background" args={[ROOMS[0].fogColor]} />
      <fogExp2 attach="fog" args={[ROOMS[0].fogColor, 0.006]} />

      <ambientLight color="#FFF8E7" intensity={0.4} />
      <directionalLight
        position={[10, 20, 15]}
        color="#F7C842"
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Suspense fallback={null}>
        <HomeRoom />
        <MusicRoom />
        <StageRoom />
        <ArchiveRoom />
        <MerchRoom />
      </Suspense>
    </>
  )
}
