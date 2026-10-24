import type { Metadata } from 'next'
import Atrio from '@/features/atrio/Atrio'

export const metadata: Metadata = { title: 'Atrio' }

export default function Pagina() {
  return <Atrio />
}
