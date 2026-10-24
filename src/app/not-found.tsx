import Link from 'next/link'
import { Strozzato } from '@/components/strozzato/Strozzato'

export default function NonTrovata() {
  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', alignContent: 'center', gap: 28, padding: '24px var(--gut)' }}>
      <Strozzato testo="QUI NON C'È" spasmo style={{ fontSize: 'clamp(3.4rem, 15vw, 9rem)', color: 'var(--ochre)' }} />
      <Link href="/" className="simbolo" aria-label="Torna allo spazio bianco">←</Link>
    </main>
  )
}
