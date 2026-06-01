'use client'
import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { useRoomNavigation } from '@/hooks/useRoomNavigation'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import Navbar from '@/components/ui/Navbar'
import BottomBar from '@/components/ui/BottomBar'
import RoomNav from '@/components/ui/RoomNav'
import RoomLabel from '@/components/ui/RoomLabel'
import KeyboardHint from '@/components/ui/KeyboardHint'
import { ContentPanel } from '@/components/ui/ContentPanel'
import { Scenografi }  from '@/components/ui/Scenografi'
import { SolLoader } from '@/components/ui/SolLoader'

const World = dynamic(() => import('@/components/world/World'), { ssr: false })

export default function Home() {
  useRoomNavigation()
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded]   = useState(false)
  const handleLoaderDone = useCallback(() => setLoaded(true), [])
  const currentRoom  = useWorldStore((s) => s.currentRoom)
  const accentColor  = ROOMS[currentRoom].accentColor

  useEffect(() => { setMounted(true) }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100svh',
        overflow: 'hidden',
        '--accent': accentColor,
      } as React.CSSProperties}
    >
      <World />
      {/* Theater vignette — darkens viewport edges, hides room-structure seams */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 72% 68% at 50% 54%, transparent 42%, rgba(13,9,5,0.55) 72%, rgba(13,9,5,0.92) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <Scenografi />
      <Navbar />
      <BottomBar />
      <RoomNav />
      <RoomLabel />
      <KeyboardHint />
      <ContentPanel />
      {mounted && !loaded && <SolLoader onDone={handleLoaderDone} />}
    </div>
  )
}
