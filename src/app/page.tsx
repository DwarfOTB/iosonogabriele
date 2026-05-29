'use client'
import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { useRoomNavigation } from '@/hooks/useRoomNavigation'
import Navbar from '@/components/ui/Navbar'
import RoomNav from '@/components/ui/RoomNav'
import RoomLabel from '@/components/ui/RoomLabel'
import KeyboardHint from '@/components/ui/KeyboardHint'
import { ContentPanel } from '@/components/ui/ContentPanel'
import { SolLoader } from '@/components/ui/SolLoader'

const World = dynamic(() => import('@/components/world/World'), { ssr: false })

export default function Home() {
  useRoomNavigation()
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded]   = useState(false)
  const handleLoaderDone = useCallback(() => setLoaded(true), [])

  useEffect(() => { setMounted(true) }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <World />
      <Navbar />
      <RoomNav />
      <RoomLabel />
      <KeyboardHint />
      <ContentPanel />
      {mounted && !loaded && <SolLoader onDone={handleLoaderDone} />}
    </div>
  )
}
