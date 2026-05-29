'use client'
import { useState } from 'react'

const ALBUM_URL = 'https://open.spotify.com/intl-it/album/0Ubx6rC0UAtiu2Mcl6M6F5'
const EMBED_URL = 'https://open.spotify.com/embed/album/0Ubx6rC0UAtiu2Mcl6M6F5?utm_source=generator&theme=0'

export function SpotifyEmbed() {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Lora', serif",
        color: '#3D2E1A',
        fontSize: '0.95rem',
      }}>
        Oggi il giradischi è rotto.{' '}
        <a
          href={ALBUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#D93025', fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: '1.1rem' }}
        >
          → Apri su Spotify
        </a>
      </div>
    )
  }

  return (
    <iframe
      src={EMBED_URL}
      width="100%"
      height="152"
      style={{ borderRadius: '8px', border: 'none' }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Ascolta Il Sole è Rosso"
      onError={() => setFailed(true)}
    />
  )
}
