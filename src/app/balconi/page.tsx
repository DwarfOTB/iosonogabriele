import type { Metadata } from 'next'
import StanzaChiusa from '@/features/atrio/StanzaChiusa'

export const metadata: Metadata = { title: 'I balconi' }

export default function Pagina() {
  return <StanzaChiusa nome="I BALCONI" />
}
