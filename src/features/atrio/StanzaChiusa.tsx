'use client'

import { Strozzato } from '@/components/strozzato/Strozzato'
import css from './Atrio.module.css'
import stanza from './StanzaChiusa.module.css'

/**
 * Una stanza che arriva più avanti: la camera si ferma davanti alla sua
 * porta chiusa (nella stanza 3D), qui sopra solo il nome.
 */
export default function StanzaChiusa({ nome }: { nome: string }) {
  return (
    <main className={css.atrio}>
      <header className={css.testata} />
      <div className={stanza.nome}>
        <Strozzato as="h1" testo={nome} spasmo entraStrozzato style={{ fontSize: '1em' }} />
      </div>
      <p className={stanza.presto} aria-label="Arriva più avanti">
        +
      </p>
    </main>
  )
}
