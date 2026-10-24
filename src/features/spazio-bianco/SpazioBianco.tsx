'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Strozzato } from '@/components/strozzato/Strozzato'
import { TornaPorte } from '@/components/torna/TornaPorte'
import { CAMPAGNA } from '@/content/campagna'
import { ALTEZZA_LAMPADA, CUSCINI, MINIMO_SUL_TAPPETO } from '@/features/mondo/regole'
import { useMondo, vivo } from '@/features/mondo/stato'
import { segnaIntroVista, useProgressi } from '@/lib/progressi'
import css from './SpazioBianco.module.css'

/** I comandi del minigioco della comunicazione in corso: a ogni campagna se ne aggiunge uno qui */
function Comandi() {
  switch (CAMPAGNA.minigioco) {
    case 'fortino':
      return <ComandiFortino />
  }
}

const nessuno = () => () => {}
/** Vero solo nel browser: la spiegazione dipende da cosa c'è nello storage, sul server non si sa */
const useNelBrowser = () =>
  useSyncExternalStore(
    nessuno,
    () => true,
    () => false,
  )

/**
 * Il fortino: sopra la stanza 3D il nome, lo scopo in una riga, quanto manca
 * alla luce, i comandi e il ritorno alle porte. Alla prima visita una
 * spiegazione in tre passi (riapribile col "?").
 */
export default function SpazioBianco() {
  const nelBrowser = useNelBrowser()
  const { introVista } = useProgressi()
  const [riaperta, setRiaperta] = useState(false)
  const spiega = nelBrowser && (!introVista || riaperta)

  return (
    <main className={css.spazio}>
      <header className={css.testata}>
        <TornaPorte />
        <button type="button" className="simbolo" aria-label="Come si gioca" onClick={() => setRiaperta(true)}>
          ?
        </button>
      </header>

      <div className={css.titolo}>
        <Strozzato as="h1" testo="IL FORTINO" spasmo entraStrozzato style={{ fontSize: '1em', color: 'var(--ochre)' }} />
        <p className={css.scopo}>Costruisci un rifugio di cuscini, alto fino alla luce.</p>
      </div>

      <Altimetro />
      <Comandi />

      {spiega && (
        <Spiegazione
          onChiudi={() => {
            segnaIntroVista()
            setRiaperta(false)
          }}
        />
      )}
    </main>
  )
}

/** La spiegazione: tre passi, un bottone. */
function Spiegazione({ onChiudi }: { onChiudi: () => void }) {
  const bottone = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    bottone.current?.focus({ preventScroll: true })
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onChiudi()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onChiudi])

  return (
    <div className={css.velo} role="dialog" aria-modal="true" aria-labelledby="titolo-spiegazione">
      <div className={css.foglio}>
        <h2 id="titolo-spiegazione" className={css.foglioTitolo}>
          IL FORTINO
        </h2>
        <p className={css.foglioScopo}>Un rifugio di cuscini, come da bambini. Costruiscilo fino ad accendere la luce.</p>
        <ol className={css.passi}>
          <li>
            <b>1</b>
            <span>
              <strong>Sposta il cuscino</strong>{' '}
              sopra al tappeto: trascina col dito (o muovi il mouse). L&apos;ombra
              ti dice dove cadrà.
            </span>
          </li>
          <li>
            <b>2</b>
            <span>
              <strong>Tocca per lasciarlo.</strong> Con <span aria-label="gira">⟳</span> lo giri, con{' '}
              <span aria-label="in piedi">⇅</span> lo metti in piedi per fare le pareti.
            </span>
          </li>
          <li>
            <b>3</b>
            <span>
              <strong>Arriva all&apos;anello giallo</strong> sotto la lampadina, con almeno {MINIMO_SUL_TAPPETO} cuscini
              sul tappeto. Hai {CUSCINI} cuscini.
            </span>
          </li>
        </ol>
        <button ref={bottone} type="button" className="bottone" onClick={onChiudi}>
          COSTRUISCI
        </button>
      </div>
    </div>
  )
}

/**
 * Quanto manca alla luce: una barra verticale che si riempie con la cima del
 * fortino, la lampadina in cima, e il conto dei cuscini sul tappeto.
 * Si aggiorna fuori da React, leggendo il mondo a ogni fotogramma.
 */
function Altimetro() {
  const fase = useMondo((s) => s.fase)
  const pieno = useRef<HTMLSpanElement>(null)
  const conto = useRef<HTMLSpanElement>(null)
  const base = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    let id = 0
    const giro = () => {
      const k = Math.min(1, vivo.cima / ALTEZZA_LAMPADA)
      if (pieno.current) pieno.current.style.transform = `scaleY(${k.toFixed(3)})`
      if (conto.current) conto.current.textContent = `${Math.min(vivo.sulTappeto, MINIMO_SUL_TAPPETO)}/${MINIMO_SUL_TAPPETO}`
      // alto abbastanza ma con pochi cuscini sotto: si dice cosa manca
      if (base.current) base.current.hidden = !(k > 0.92 && vivo.sulTappeto < MINIMO_SUL_TAPPETO)
      id = requestAnimationFrame(giro)
    }
    id = requestAnimationFrame(giro)
    return () => cancelAnimationFrame(id)
  }, [])

  if (fase === 'completo') return null
  return (
    <aside className={css.altimetro} aria-hidden="true">
      <span className={css.lampadina} />
      <span className={css.canna}>
        <span ref={pieno} className={css.pieno} />
      </span>
      <span className={css.tappeto}>
        <span ref={conto}>0/{MINIMO_SUL_TAPPETO}</span>
        <small>sul tappeto</small>
      </span>
      <p ref={base} className={css.manca} hidden>
        Serve una base più larga: almeno {MINIMO_SUL_TAPPETO} cuscini sul tappeto.
      </p>
    </aside>
  )
}

function ComandiFortino() {
  const fase = useMondo((s) => s.fase)
  const rimasti = useMondo((s) => s.rimasti)
  const gira = useMondo((s) => s.gira)
  const alza = useMondo((s) => s.alza)
  const ricomincia = useMondo((s) => s.ricomincia)

  return (
    <footer className={css.comandi}>
      {fase === 'completo' && (
        <p className={css.esito} role="status">
          <strong>Il fortino regge.</strong> La luce è accesa.
        </p>
      )}
      {fase === 'finiti' && (
        <p className={css.esito} role="status">
          <strong>Cuscini finiti.</strong> Non arriva alla luce: riprova.
        </p>
      )}
      <div className={css.fila}>
        {fase === 'gioco' && (
          <>
            <button type="button" className="simbolo" aria-label="Gira il cuscino" onClick={() => gira(1)}>
              ⟳
            </button>
            <button type="button" className="simbolo" aria-label="Metti il cuscino in piedi" onClick={alza}>
              ⇅
            </button>
          </>
        )}
        <span className={css.conta} role="status" aria-label={`${rimasti} cuscini rimasti`}>
          {Array.from({ length: CUSCINI }, (_, i) => (
            <i key={i} data-pieno={i < rimasti || undefined} />
          ))}
        </span>
        <button
          type="button"
          className={`simbolo ${css.ricomincia}`}
          data-forte={fase === 'finiti' || undefined}
          aria-label="Ricomincia"
          onClick={ricomincia}
        >
          ↺
        </button>
      </div>
    </footer>
  )
}
