'use client'
import { TRACKLIST } from '@/data/tracklist'
import { SpotifyEmbed } from './SpotifyEmbed'

function r2(n: number) { return Math.round(n * 100) / 100 }
const SUN_RAYS = [0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
  const rad = deg * Math.PI / 180
  return { x: r2(40 + Math.cos(rad) * 34), y: r2(40 + Math.sin(rad) * 34) }
})

const ALBUM_SPOTIFY = 'https://open.spotify.com/intl-it/album/0Ubx6rC0UAtiu2Mcl6M6F5'

export function TracklistPanel() {
  return (
    <div>
      {/* Album cover placeholder */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        maxHeight: '200px',
        background: 'linear-gradient(135deg, #F7C842 0%, #E07B2A 50%, #D93025 100%)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Sun SVG inline */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="18" fill="#FFF0A0" />
          {SUN_RAYS.map((ray, i) => (
            <line key={i} x1="40" y1="40" x2={ray.x} y2={ray.y}
              stroke="#FFF0A0" strokeWidth="2.5" strokeLinecap="round"
            />
          ))}
          <ellipse cx="34" cy="38" rx="3" ry="2" fill="#1C1208" />
          <ellipse cx="46" cy="38" rx="3" ry="2" fill="#1C1208" />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#FDFAF4',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          Il Sole è Rosso
        </div>
      </div>

      {/* Spotify CTA */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <a
          href={ALBUM_SPOTIFY}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1DB954',
            color: '#FDFAF4',
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: '1.1rem',
            padding: '10px 24px',
            borderRadius: '2px 6px 4px 8px / 6px 2px 8px 4px',
            textDecoration: 'none',
            boxShadow: '3px 3px 0px #158a3e',
            transition: 'transform 80ms, box-shadow 80ms',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Ascolta su Spotify
        </a>
      </div>

      {/* Spotify embed */}
      <div style={{ marginBottom: '24px' }}>
        <SpotifyEmbed />
      </div>

      {/* Tracklist */}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {TRACKLIST.map((track, i) => {
          const isFeature = i === 6
          return (
            <li
              key={track.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(28,18,8,0.1)',
                transform: isFeature ? 'rotate(-0.5deg)' : 'none',
                color: isFeature ? '#D93025' : '#1C1208',
                background: isFeature ? 'rgba(217,48,37,0.04)' : 'transparent',
                borderRadius: isFeature ? '2px' : '0',
                paddingLeft: isFeature ? '6px' : '0',
                paddingRight: isFeature ? '6px' : '0',
              }}
            >
              <span style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: '0.8rem',
                color: isFeature ? '#D93025' : '#7A6548',
                minWidth: '24px',
                opacity: 0.8,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '1.15rem',
                fontWeight: isFeature ? 700 : 400,
                flex: 1,
              }}>
                {track.title}
              </span>
              <span style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: '0.8rem',
                color: isFeature ? '#D93025' : '#7A6548',
                opacity: 0.7,
              }}>
                {track.duration}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
