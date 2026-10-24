'use client'

import { useEffect, useRef, useState } from 'react'
import { condividiFile, salvaFile, useInApp } from './condividi'
import s from './Anteprima.module.css'

/**
 * Lo scatto in corso. `bozza` è il foglio già disegnato (ridotto), da mostrare
 * mentre il PNG si codifica: la codifica è la parte lenta.
 */
export type Scatto =
  | { fase: 'chiuso' }
  | { fase: 'disegna'; id: number; bozza?: HTMLCanvasElement }
  | { fase: 'pronto'; id: number; bozza?: HTMLCanvasElement; url: string; file: File; condivisibile: boolean }
  | { fase: 'errore'; id: number }

interface AnteprimaProps {
  scatto: Exclude<Scatto, { fase: 'chiuso' }>
  /** La frase scritta: testo alternativo dell'immagine e titolo della condivisione */
  testo: string
  onRifai: () => void
}

/**
 * La storia appena scattata, su un foglio 9:16. Mentre si disegna c'è la
 * matita che tratteggia; poi CONDIVIDI (se il sistema sa condividere file),
 * SALVA e ↻ per rifarla.
 */

/** Appoggia nel contenitore il canvas già disegnato, senza ricopiarlo (operazione sul DOM, fuori dal render) */
function appoggia(contenitore: HTMLElement, tela: HTMLCanvasElement, classe: string) {
  tela.className = classe
  tela.setAttribute('aria-hidden', 'true')
  contenitore.replaceChildren(tela)
}

export function Anteprima({ scatto, testo, onRifai }: AnteprimaProps) {
  const dialogo = useRef<HTMLDivElement>(null)
  const primo = useRef<HTMLButtonElement>(null)
  const posto = useRef<HTMLDivElement>(null)
  const [occupato, setOccupato] = useState(false)
  const [salvata, setSalvata] = useState(false)
  const inApp = useInApp()
  const pronto = scatto.fase === 'pronto'
  const bozza = scatto.fase === 'errore' ? undefined : scatto.bozza

  useEffect(() => {
    dialogo.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (pronto) primo.current?.focus({ preventScroll: true })
  }, [pronto])

  // Esc chiude anche se il fuoco è finito fuori dal foglio (sul body, dopo il pannello di condivisione)
  useEffect(() => {
    const suTasto = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return
      e.preventDefault()
      onRifai()
    }
    window.addEventListener('keydown', suTasto)
    return () => window.removeEventListener('keydown', suTasto)
  }, [onRifai])

  // la bozza è un canvas già pronto: si appoggia così com'è, senza ricopiarlo
  useEffect(() => {
    const p = posto.current
    if (!p || !bozza) return
    appoggia(p, bozza, s.foto)
    return () => p.replaceChildren()
  }, [bozza])

  useEffect(() => {
    if (!salvata) return
    const t = window.setTimeout(() => setSalvata(false), 1800)
    return () => window.clearTimeout(t)
  }, [salvata])

  const condividi = async () => {
    if (scatto.fase !== 'pronto' || occupato) return
    setOccupato(true)
    const esito = await condividiFile(scatto.file, testo)
    setOccupato(false)
    // se il sistema rifiuta (gesto scaduto, permessi) si ripiega sul download
    if (esito === 'errore') salvaFile(scatto.url, scatto.file.name)
  }

  const salva = () => {
    if (scatto.fase !== 'pronto') return
    salvaFile(scatto.url, scatto.file.name)
    // nei browser delle app il download di solito non parte: niente "SALVATA" finto
    if (!inApp) setSalvata(true)
  }

  const condivisibile = scatto.fase === 'pronto' && scatto.condivisibile

  return (
    <div
      ref={dialogo}
      className={s.velo}
      role="dialog"
      aria-modal="true"
      aria-label={testo}
      tabIndex={-1}
    >
      <figure className={s.carta} data-fase={scatto.fase} aria-busy={!pronto && scatto.fase !== 'errore'}>
        <div ref={posto} className={s.posto} />
        {scatto.fase === 'pronto' && (
          // eslint-disable-next-line @next/next/no-img-element -- blob locale, niente ottimizzazione
          <img className={s.foto} src={scatto.url} alt={testo} width={1080} height={1920} draggable={false} />
        )}
        {scatto.fase === 'disegna' && !bozza && (
          <svg className={s.matita} viewBox="0 0 90 160" aria-hidden="true">
            <path
              pathLength={1}
              d="M14 44 L74 26 L12 66 L78 46 L10 90 L80 68 L14 112 L76 92 L18 132 L72 116"
            />
          </svg>
        )}
        {scatto.fase === 'errore' && (
          <svg className={s.croce} viewBox="0 0 90 160" aria-hidden="true">
            <path d="M24 56 Q46 82 68 106" />
            <path d="M67 54 Q44 80 22 108" />
          </svg>
        )}
      </figure>

      <div className={s.azioni}>
        {condivisibile && (
          <button ref={primo} type="button" className="bottone" onClick={condividi} aria-disabled={occupato || undefined}>
            CONDIVIDI
          </button>
        )}
        {pronto && (
          <button
            ref={condivisibile ? undefined : primo}
            type="button"
            className={condivisibile ? 'bottone bottone--carta' : 'bottone'}
            onClick={salva}
          >
            {salvata ? 'SALVATA' : 'SALVA'}
          </button>
        )}
        <button type="button" className="simbolo" aria-label="Rifai" onClick={onRifai}>
          ↻
        </button>
      </div>
    </div>
  )
}
