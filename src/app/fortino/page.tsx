import type { Metadata } from 'next'
import SpazioBianco from '@/features/spazio-bianco/SpazioBianco'

export const metadata: Metadata = { title: 'Il fortino' }

export default function Pagina() {
  return <SpazioBianco />
}
