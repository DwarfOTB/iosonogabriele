'use client'
import dynamic from 'next/dynamic'
import { useRoomNavigation } from '@/hooks/useRoomNavigation'
import Navbar from '@/components/ui/Navbar'
import RoomNav from '@/components/ui/RoomNav'
import RoomLabel from '@/components/ui/RoomLabel'
import KeyboardHint from '@/components/ui/KeyboardHint'

const World = dynamic(() => import('@/components/world/World'), { ssr: false })

export default function Home() {
  useRoomNavigation()

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <World />
      <Navbar />
      <RoomNav />
      <RoomLabel />
      <KeyboardHint />
      {/* ContentPanel — Sprint 4 */}
    </div>
  )
}
