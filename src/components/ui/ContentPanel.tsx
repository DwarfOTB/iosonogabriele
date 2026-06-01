'use client'
import { useEffect, useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { TracklistPanel } from './panels/TracklistPanel'
import { TourDatesPanel } from './panels/TourDatesPanel'
import { MerchPanel }     from './panels/MerchPanel'
import { PhotoPanel }     from './panels/PhotoPanel'
import s from './ContentPanel.module.css'

const PANEL_TITLES: Record<string, string> = {
  tracklist:  'Tracklist',
  album:      'Ascolta',
  dates:      'Date Tour',
  merch:      'Merch',
  'poster-0': 'Singolo',
  'poster-1': 'Singolo',
  'poster-2': 'Singolo',
}

function getPanelTitle(id: string): string {
  if (id.startsWith('photo-')) return 'Archivio'
  return PANEL_TITLES[id] ?? id
}

function PanelContent({ id }: { id: string }) {
  if (id === 'tracklist' || id === 'album') return <TracklistPanel />
  if (id === 'dates')                       return <TourDatesPanel />
  if (id === 'merch')                       return <MerchPanel />
  if (id.startsWith('photo-'))              return <PhotoPanel id={id} />
  return null
}

export function ContentPanel() {
  const activePanel = useWorldStore((st) => st.activePanel)
  const closePanel  = useWorldStore((st) => st.closePanel)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Focus close button when panel opens
  useEffect(() => {
    if (activePanel) closeBtnRef.current?.focus()
  }, [activePanel])

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closePanel])

  if (!activePanel) return null

  return (
    <div className={s.overlay}>
      {/* Click-away backdrop */}
      <div className={s.backdrop} onClick={closePanel} aria-hidden="true" />

      {/* Panel dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={getPanelTitle(activePanel)}
        className={s.panel}
      >
        {/* Sticky header */}
        <div className={s.header}>
          <span className={s.title}>{getPanelTitle(activePanel)}</span>
          <button
            ref={closeBtnRef}
            onClick={closePanel}
            aria-label="Chiudi pannello"
            className={s.close}
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className={s.body} aria-live="polite">
          <PanelContent id={activePanel} />
        </div>
      </div>
    </div>
  )
}
