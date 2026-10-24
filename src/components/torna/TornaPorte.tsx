import Link from 'next/link'
import css from './TornaPorte.module.css'

/** Il ritorno alla home (le porte), uguale in ogni stanza, in alto a sinistra */
export function TornaPorte() {
  return (
    <Link href="/" className={css.torna}>
      <span aria-hidden="true">←</span> PORTE
    </Link>
  )
}
