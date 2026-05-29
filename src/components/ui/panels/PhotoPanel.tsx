'use client'
import { useWorldStore } from '@/store/worldStore'

const TOTAL_PHOTOS = 9

const PHOTO_COLORS = [
  '#D93025', '#F7C842', '#AED6F1', '#5D8A3C',
  '#C19A6B', '#F5A623', '#4A3018', '#EDE0C4', '#C0392B',
]

const CAPTIONS = [
  'Un momento prima.',
  'Il sole era già lì.',
  'Cielo di luglio.',
  'La natura aspetta.',
  'Polvere e luce.',
  'Caldo di ottobre.',
  'Radici antiche.',
  'Carta e silenzio.',
  'Rosso sul muro.',
]

interface PhotoPanelProps {
  id: string
}

export function PhotoPanel({ id }: PhotoPanelProps) {
  const openPanel = useWorldStore((s) => s.openPanel)
  const index = parseInt(id.replace('photo-', ''), 10)
  const safeIndex = isNaN(index) ? 0 : Math.max(0, Math.min(TOTAL_PHOTOS - 1, index))

  const color = PHOTO_COLORS[safeIndex]
  const caption = CAPTIONS[safeIndex]

  function goTo(i: number) {
    openPanel(`photo-${i}`)
  }

  return (
    <div>
      {/* Polaroid enlarged */}
      <div style={{
        background: '#FDFAF4',
        borderRadius: '2px',
        padding: '16px 16px 40px',
        boxShadow: '4px 6px 0px rgba(28,18,8,0.2)',
        marginBottom: '20px',
        transform: safeIndex % 2 === 0 ? 'rotate(-0.8deg)' : 'rotate(0.6deg)',
      }}>
        <div style={{
          width: '100%',
          aspectRatio: '1',
          background: color,
          borderRadius: '1px',
          marginBottom: '12px',
        }} />
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.1rem',
          color: '#3D2E1A',
          textAlign: 'center',
          margin: 0,
        }}>
          {caption}
        </p>
      </div>

      {/* Counter + navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => goTo(safeIndex - 1)}
          disabled={safeIndex === 0}
          aria-label="Foto precedente"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.3rem',
            background: '#F4EDD8',
            border: '1px solid #D9C9A8',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: safeIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: safeIndex === 0 ? 0.3 : 1,
            color: '#1C1208',
          }}
        >
          ←
        </button>

        <span style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: '0.8rem',
          color: '#7A6548',
        }}>
          {safeIndex + 1} di {TOTAL_PHOTOS}
        </span>

        <button
          onClick={() => goTo(safeIndex + 1)}
          disabled={safeIndex === TOTAL_PHOTOS - 1}
          aria-label="Foto successiva"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '1.3rem',
            background: '#F4EDD8',
            border: '1px solid #D9C9A8',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: safeIndex === TOTAL_PHOTOS - 1 ? 'not-allowed' : 'pointer',
            opacity: safeIndex === TOTAL_PHOTOS - 1 ? 0.3 : 1,
            color: '#1C1208',
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
