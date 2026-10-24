'use client'

import { Strozzato } from '@/components/strozzato/Strozzato'
import { CAMPAGNA, NOME_ARTISTA } from '@/content/campagna'
import { CUSCINI } from '@/features/mondo/regole'
import { useMondo } from '@/features/mondo/stato'
import css from './SpazioBianco.module.css'

/** I comandi del minigioco della comunicazione in corso: a ogni campagna se ne aggiunge uno qui */
function Comandi() {
  switch (CAMPAGNA.minigioco) {
    case 'fortino':
      return <ComandiFortino />
  }
}

/**
 * Lo spazio bianco: l'ingresso. Sopra la stanza 3D il titolo della campagna
 * e i comandi del minigioco. Le porte si raggiungono dalla nav.
 */
export default function SpazioBianco() {
  return (
    <main className={css.spazio}>
      <header className={css.testata}>
        <p className={css.firma}>{NOME_ARTISTA}</p>
      </header>

      <div className={css.titolo}>
        <Strozzato
          as="h1"
          testo={CAMPAGNA.titolo}
          spasmo
          entraStrozzato
          style={{ fontSize: '1em', color: 'var(--ochre)' }}
        />
      </div>

      <Comandi />
    </main>
  )
}

function ComandiFortino() {
  const fase = useMondo((s) => s.fase)
  const rimasti = useMondo((s) => s.rimasti)
  const gira = useMondo((s) => s.gira)
  const alza = useMondo((s) => s.alza)
  const ricomincia = useMondo((s) => s.ricomincia)
  const primo = fase === 'gioco' && rimasti === CUSCINI

  return (
    <footer className={css.comandi}>
      {primo && (
        <p className={css.guida} aria-hidden="true">
          trascina · tocca per lasciare
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
        <span className={css.conta} role="status" aria-label={`${rimasti} cuscini`}>
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
