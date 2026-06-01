'use client'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import s from './BottomBar.module.css'

// Mobile primary navigation — a hand-made paper "playbill" strip in the thumb
// zone. On-brand (Caveat, paper texture, sun marker), not a generic tab bar.
// Hidden on desktop (CSS); Navbar/RoomNav take over there.
export default function BottomBar() {
  const currentRoom = useWorldStore((st) => st.currentRoom)
  const setRoom     = useWorldStore((st) => st.setRoom)

  return (
    <nav className={s.bar} aria-label="Stanze">
      <span className={s.tape} aria-hidden="true" />
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
            <span className={s.sun} aria-hidden="true">✲</span>
            <span className={s.label}>{room.navLabel}</span>
          </button>
        )
      })}
    </nav>
  )
}
