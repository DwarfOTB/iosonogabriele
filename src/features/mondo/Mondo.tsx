'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Component, useState, type ReactNode } from 'react'
import css from './Mondo.module.css'

const Scena = dynamic(() => import('./Scena'), {
  ssr: false,
  loading: () => <span className={css.carica}>+</span>,
})

/** Le pagine che stanno dentro la stanza bianca */
const NEL_MONDO = new Set(['/', '/atrio', '/balconi', '/studio'])

/** Senza WebGL la scena non parte: resta la carta, le pagine funzionano lo stesso */
class SenzaWebGL extends Component<{ children: ReactNode }, { rotto: boolean }> {
  state = { rotto: false }
  static getDerivedStateFromError() {
    return { rotto: true }
  }
  render() {
    return this.state.rotto ? null : this.props.children
  }
}

/**
 * Il mondo 3D, montato una volta nel layout sotto a tutte le pagine.
 * Si accende la prima volta che serve e da lì resta vivo: tornando
 * all'atrio o al fortino tutto è dove l'avevi lasciato.
 */
export function Mondo() {
  const percorso = usePathname()
  const dentro = NEL_MONDO.has(percorso)
  const [acceso, setAcceso] = useState(dentro)
  // la prima volta che si entra nel mondo si accende, e da lì non si spegne più
  if (dentro && !acceso) setAcceso(true)

  return (
    <div className={css.mondo} data-spento={!dentro || undefined} aria-hidden="true">
      {acceso && (
        <SenzaWebGL>
          <Scena percorso={percorso} attiva={dentro} />
        </SenzaWebGL>
      )}
    </div>
  )
}
