'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import css from './Nav.module.css'

const VOCI = [
  { href: '/', nome: 'FORTINO', anche: [] as string[] },
  { href: '/atrio', nome: 'PORTE', anche: ['/balconi', '/studio'] },
  { href: '/sono', nome: 'SONO ___.', anche: [] as string[] },
]

/** La nav sempre in vista, in alto a destra: tre posti, quello in cui sei è pieno */
export function Nav() {
  const percorso = usePathname()
  return (
    <nav className={css.nav} aria-label="Navigazione">
      {VOCI.map((v) => {
        const qui = percorso === v.href || v.anche.includes(percorso)
        return (
          <Link key={v.href} href={v.href} className={css.voce} aria-current={qui ? 'page' : undefined}>
            {v.nome}
          </Link>
        )
      })}
    </nav>
  )
}
