'use client'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import s from './Navbar.module.css'

export default function Navbar() {
  const currentRoom = useWorldStore((st) => st.currentRoom)
  const setRoom     = useWorldStore((st) => st.setRoom)

  return (
    <nav className={s.nav} aria-label="Stanze">
      {ROOMS.map((room, i) => (
        <button
          key={room.id}
          onClick={() => setRoom(i)}
          className={`${s.btn} ${currentRoom === i ? s.active : ''}`}
          aria-current={currentRoom === i ? 'page' : undefined}
        >
          {room.navLabel}
        </button>
      ))}
    </nav>
  )
}
