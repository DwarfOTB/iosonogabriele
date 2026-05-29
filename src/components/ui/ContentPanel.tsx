'use client'
import { useEffect, useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { TracklistPanel } from './panels/TracklistPanel'
import { TourDatesPanel } from './panels/TourDatesPanel'
import { MerchPanel } from './panels/MerchPanel'
import { PhotoPanel } from './panels/PhotoPanel'

const PANEL_TITLES: Record<string, string> = {
  tracklist: 'Tracklist',
  album:     'Ascolta',
  dates:     'Date Tour',
  merch:     'Merch',
}

function getPanelTitle(id: string): string {
  if (id.startsWith('photo-')) return 'Archivio'
  return PANEL_TITLES[id] ?? id
}

function PanelContent({ id }: { id: string }) {
  if (id === 'tracklist' || id === 'album') return <TracklistPanel />
  if (id === 'dates') return <TourDatesPanel />
  if (id === 'merch') return <MerchPanel />
  if (id.startsWith('photo-')) return <PhotoPanel id={id} />
  return null
}

export function ContentPanel() {
  const activePanel  = useWorldStore((s) => s.activePanel)
  const closePanel   = useWorldStore((s) => s.closePanel)
  const closeBtnRef  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activePanel) {
      closeBtnRef.current?.focus()
    }
  }, [activePanel])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePanel])

  if (!activePanel) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closePanel}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(28,18,8,0.72)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={getPanelTitle(activePanel)}
        style={{
          position: 'relative',
          background: '#F4EDD8',
          borderRadius: '3px 8px 4px 6px / 6px 3px 8px 4px',
          boxShadow: '12px 16px 0px #1C1208, 0 30px 60px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: 'min(560px, 92vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          animation: 'panelIn 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        }}
      >
        {/* Header */}
        <div style={{
          background: '#1C1208',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#F7C842',
            transform: 'rotate(-0.5deg)',
            display: 'block',
          }}>
            {getPanelTitle(activePanel)}
          </span>
          <button
            ref={closeBtnRef}
            onClick={closePanel}
            aria-label="Chiudi pannello"
            style={{
              background: 'none',
              border: '1px solid rgba(244,237,216,0.3)',
              color: '#F4EDD8',
              fontFamily: "'Caveat', cursive",
              fontSize: '1.3rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          aria-live="polite"
          style={{ padding: '28px' }}
        >
          <PanelContent id={activePanel} />
        </div>
      </div>
    </div>
  )
}
