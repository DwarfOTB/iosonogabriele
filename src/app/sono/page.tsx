import type { Metadata } from 'next'
import Generatore from '@/features/generatore/Generatore'

export const metadata: Metadata = {
  title: 'SONO ___.',
  description: 'Scrivi chi sei, strozzalo, condividilo.',
}

export default function Pagina() {
  return <Generatore />
}
