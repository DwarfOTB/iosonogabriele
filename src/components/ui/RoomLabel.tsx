'use client'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'
import s from './RoomLabel.module.css'

export default function RoomLabel() {
  const currentRoom    = useWorldStore((st) => st.currentRoom)
  const isTransitioning = useWorldStore((st) => st.transitionPhase !== 'idle')
  const room = ROOMS[currentRoom]

  return (
    <div
      className={`${s.label} ${isTransitioning ? s.hidden : s.visible}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={s.counter}>
        {String(currentRoom + 1).padStart(2, '0')} / {String(ROOMS.length).padStart(2, '0')}
      </div>
      <div className={s.name}>{room.label}</div>
    </div>
  )
}
