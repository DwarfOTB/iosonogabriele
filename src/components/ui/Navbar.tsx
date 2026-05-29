'use client'
import { useWorldStore } from '@/store/worldStore'
import { ROOMS } from '@/data/rooms'

export default function Navbar() {
  const currentRoom = useWorldStore((s) => s.currentRoom)
  const setRoom = useWorldStore((s) => s.setRoom)

  return (
    <nav
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        background: '#F4EDD8',
        borderRadius: '1px 4px 3px 2px / 3px 1px 4px 2px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 0 #D9C9A8',
        padding: '10px 24px',
        display: 'flex',
        gap: '28px',
        alignItems: 'center',
      }}
    >
      {ROOMS.map((room, i) => (
        <button
          key={room.id}
          onClick={() => setRoom(i)}
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.1rem',
            fontWeight: currentRoom === i ? 700 : 400,
            color: currentRoom === i ? '#D93025' : '#1C1208',
            borderBottom: currentRoom === i ? '2px solid #D93025' : '2px solid transparent',
            background: 'none',
            border: 'none',
            borderBottomWidth: '2px',
            borderBottomStyle: 'solid',
            borderBottomColor: currentRoom === i ? '#D93025' : 'transparent',
            cursor: 'pointer',
            padding: '2px 0',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (currentRoom !== i) (e.target as HTMLButtonElement).style.color = '#D93025'
          }}
          onMouseLeave={(e) => {
            if (currentRoom !== i) (e.target as HTMLButtonElement).style.color = '#1C1208'
          }}
        >
          {room.navLabel}
        </button>
      ))}
    </nav>
  )
}
