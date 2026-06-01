'use client'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import s from './BottomBar.module.css'

// Mobile primary navigation — fixed bottom bar (thumb zone), 5 rooms.
// Hidden on desktop (CSS); Navbar/RoomNav take over there.
const ICONS = ['⌂', '♪', '✸', '▦', '✚'] // home, musica, live, archivio, merch

export default function BottomBar() {
  const currentRoom = useWorldStore((st) => st.currentRoom)
  const setRoom     = useWorldStore((st) => st.setRoom)

  return (
    <nav className={s.bar} aria-label="Stanze">
      {ROOMS.map((room, i) => {
        const active = currentRoom === i
        return (
          <button
            key={room.id}
            className={`${s.tab} ${active ? s.active : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => setRoom(i)}
            style={{ '--accent': room.accentColor } as React.CSSProperties}
          >
            <span className={s.icon} aria-hidden="true">{ICONS[i]}</span>
            <span className={s.label}>{room.navLabel}</span>
          </button>
        )
      })}
    </nav>
  )
}
