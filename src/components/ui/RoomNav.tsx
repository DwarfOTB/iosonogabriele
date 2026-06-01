'use client'
import { useWorldStore } from '@/store/worldStore'
import { TOTAL_ROOMS } from '@/data/rooms'

export default function RoomNav() {
  const currentRoom = useWorldStore((s) => s.currentRoom)
  const nextRoom = useWorldStore((s) => s.nextRoom)
  const prevRoom = useWorldStore((s) => s.prevRoom)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <button
        onClick={prevRoom}
        disabled={currentRoom === 0}
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.4rem',
          background: '#F4EDD8',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: currentRoom === 0 ? 'not-allowed' : 'pointer',
          opacity: currentRoom === 0 ? 0.3 : 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'opacity 0.2s',
          color: '#1C1208',
        }}
        aria-label="Stanza precedente"
      >
        ←
      </button>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {Array.from({ length: TOTAL_ROOMS }).map((_, i) => (
          <div
            key={i}
            onClick={() => useWorldStore.getState().setRoom(i)}
            style={{
              height: '8px',
              width: currentRoom === i ? '28px' : '8px',
              borderRadius: '4px',
              background: currentRoom === i ? '#F7C842' : 'rgba(244,237,216,0.4)',
              boxShadow: currentRoom === i ? '0 0 8px rgba(247,200,66,0.8)' : 'none',
              transition: 'width 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <button
        onClick={nextRoom}
        disabled={currentRoom === TOTAL_ROOMS - 1}
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.4rem',
          background: '#F4EDD8',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: currentRoom === TOTAL_ROOMS - 1 ? 'not-allowed' : 'pointer',
          opacity: currentRoom === TOTAL_ROOMS - 1 ? 0.3 : 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'opacity 0.2s',
          color: '#1C1208',
        }}
        aria-label="Stanza successiva"
      >
        →
      </button>
    </div>
  )
}
