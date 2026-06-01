'use client'
import { useWorldStore } from '@/store/worldStore'
import { TOTAL_ROOMS } from '@/data/rooms'
import s from './RoomNav.module.css'

export default function RoomNav() {
  const currentRoom = useWorldStore((st) => st.currentRoom)
  const nextRoom    = useWorldStore((st) => st.nextRoom)
  const prevRoom    = useWorldStore((st) => st.prevRoom)

  return (
    <nav className={s.nav} aria-label="Navigazione stanze">
      <button
        onClick={prevRoom}
        disabled={currentRoom === 0}
        className={s.arrow}
        aria-label="Stanza precedente"
      >
        ←
      </button>

      <div className={s.dots} role="tablist" aria-label="Selezione stanza">
        {Array.from({ length: TOTAL_ROOMS }).map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={currentRoom === i}
            aria-label={`Stanza ${i + 1}`}
            onClick={() => useWorldStore.getState().setRoom(i)}
            className={`${s.dot} ${currentRoom === i ? s.active : s.inactive}`}
          />
        ))}
      </div>

      <button
        onClick={nextRoom}
        disabled={currentRoom === TOTAL_ROOMS - 1}
        className={s.arrow}
        aria-label="Stanza successiva"
      >
        →
      </button>
    </nav>
  )
}
