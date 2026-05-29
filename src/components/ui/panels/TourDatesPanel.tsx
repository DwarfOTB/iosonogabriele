'use client'
import { TOUR_DATES } from '@/data/tourDates'
import { NewsletterForm } from './NewsletterForm'

const hasDates = TOUR_DATES.length > 0

function TicketCard({ date, city, venue, ticketUrl, soldOut }: {
  date: string
  city: string
  venue: string
  ticketUrl?: string
  soldOut?: boolean
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr auto',
      gap: '0',
      border: soldOut ? '2px solid #D93025' : '1px solid #D9C9A8',
      borderRadius: '2px 4px 3px 2px',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: '12px',
    }}>
      <div style={{
        padding: '12px',
        background: '#1C1208',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Courier Prime', monospace",
          fontSize: '0.85rem',
          color: '#F7C842',
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          {new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
        </span>
      </div>
      <div style={{
        padding: '12px 16px',
        borderLeft: '1px dashed #D9C9A8',
        borderRight: '1px dashed #D9C9A8',
        background: '#F4EDD8',
      }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', fontWeight: 700, color: '#1C1208' }}>
          {city}
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#7A6548' }}>
          {venue}
        </div>
      </div>
      <div style={{
        padding: '12px',
        background: '#F4EDD8',
        display: 'flex',
        alignItems: 'center',
      }}>
        {ticketUrl && !soldOut ? (
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#D93025',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Biglietti →
          </a>
        ) : null}
      </div>

      {soldOut && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '12px',
          transform: 'translateY(-50%) rotate(-12deg)',
          fontFamily: "'Courier Prime', monospace",
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#D93025',
          border: '2px solid #D93025',
          padding: '2px 6px',
          borderRadius: '2px',
          background: 'rgba(244,237,216,0.95)',
          letterSpacing: '0.1em',
        }}>
          ESAURITO
        </div>
      )}
    </div>
  )
}

export function TourDatesPanel() {
  if (hasDates) {
    return (
      <div>
        {TOUR_DATES.map((d) => (
          <TicketCard key={d.id} {...d} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Empty stage SVG */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <svg width="160" height="100" viewBox="0 0 160 100" fill="none" aria-hidden="true" style={{ display: 'block', margin: '0 auto' }}>
          {/* Stage floor */}
          <rect x="20" y="70" width="120" height="10" rx="2" fill="#6B4C2A" />
          {/* Curtains */}
          <rect x="10" y="10" width="20" height="65" rx="2" fill="#C0392B" />
          <rect x="130" y="10" width="20" height="65" rx="2" fill="#C0392B" />
          {/* Spotlight beam — center/sun */}
          <polygon points="75,10 85,10 90,70 70,70" fill="#F7C842" opacity="0.35" />
          {/* Spotlight head */}
          <circle cx="80" cy="8" r="6" fill="#F7C842" />
          <circle cx="80" cy="8" r="3" fill="#FFF0A0" />
        </svg>
      </div>

      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: '1.6rem',
        fontWeight: 700,
        color: '#1C1208',
        textAlign: 'center',
        marginBottom: '8px',
        transform: 'rotate(-0.3deg)',
      }}>
        L&apos;estate si sta preparando.
      </p>
      <p style={{
        fontFamily: "'Lora', serif",
        fontSize: '0.95rem',
        color: '#7A6548',
        textAlign: 'center',
        marginBottom: '28px',
      }}>
        Lascia la tua email e sarai il primo a sapere.
      </p>

      <NewsletterForm />
    </div>
  )
}
