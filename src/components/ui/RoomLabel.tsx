'use client'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'

export default function RoomLabel() {
  const currentRoom = useWorldStore((s) => s.currentRoom)
  const isTransitioning = useWorldStore((s) => s.isTransitioning)
  const room = ROOMS[currentRoom]

  return (
    <div
      style={{
        position: 'fixed',
        top: '90px',
        left: '40px',
        zIndex: 50,
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: '0.7rem',
          color: 'rgba(244,237,216,0.5)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        {String(currentRoom + 1).padStart(2, '0')} / {String(ROOMS.length).padStart(2, '0')}
      </div>
      <div
        style={{
          fontFamily: "'Caveat', cursive",
          fontWeight: 700,
          fontSize: '2rem',
          color: '#FDFAF4',
          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
          lineHeight: 1.1,
        }}
      >
        {room.label}
      </div>
    </div>
  )
}
