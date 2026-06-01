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
import SwipeHint from '@/components/ui/SwipeHint'
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
      {/* Theater vignette — frames the scene, hides edges (responsive) */}
      <div aria-hidden="true" className="sceneVignette" />
      <Scenografi />
      <Navbar />
      <BottomBar />
      <RoomNav />
      <RoomLabel />
      <KeyboardHint />
      <SwipeHint />
      <ContentPanel />
      {mounted && !loaded && <SolLoader onDone={handleLoaderDone} />}
    </div>
  )
}
