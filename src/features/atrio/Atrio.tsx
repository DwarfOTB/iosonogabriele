'use client'

import { CAMPAGNA, NOME_ARTISTA } from '@/content/campagna'
import { PORTE } from '@/features/mondo/regole'
import { useMondo } from '@/features/mondo/stato'
import css from './Atrio.module.css'

/**
 * L'atrio: le porte stanno nella stanza 3D (si aprono toccandole). Qui sopra
 * solo la firma e, sugli schermi stretti, le frecce per passare da una porta
 * all'altra.
 */
export default function Atrio() {
  const fuoco = useMondo((s) => s.portaFuoco)
  const imposta = useMondo((s) => s.imposta)
  const vai = (d: number) => imposta({ portaFuoco: (fuoco + d + PORTE.length) % PORTE.length })

  return (
    <main className={css.atrio}>
      <header className={css.testata}>
        <div>
          <p className={css.firma}>{NOME_ARTISTA}</p>
          <p className={css.invito}>Tocca una porta per entrare.</p>
        </div>
      </header>

      <h1 className={css.nascosto}>{CAMPAGNA.titolo}</h1>

      <nav className={css.giro} aria-label="Porte">
        <button type="button" className="simbolo" aria-label="Porta precedente" onClick={() => vai(-1)}>
          ‹
        </button>
        <span className={css.punti} aria-hidden="true">
          {PORTE.map((p, i) => (
            <i key={p.id} data-qui={i === fuoco || undefined} />
          ))}
        </span>
        <button type="button" className="simbolo" aria-label="Porta successiva" onClick={() => vai(1)}>
          ›
        </button>
      </nav>
    </main>
  )
}
