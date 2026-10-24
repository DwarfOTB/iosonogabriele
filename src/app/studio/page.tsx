import type { Metadata } from 'next'
import StanzaChiusa from '@/features/atrio/StanzaChiusa'

export const metadata: Metadata = { title: 'Lo studio' }

export default function Pagina() {
  return <StanzaChiusa nome="LO STUDIO" />
}
