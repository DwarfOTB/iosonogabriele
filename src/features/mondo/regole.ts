/**
 * Le regole del fortino e la disposizione della stanza. Si bilancia da qui.
 * Unità: metri. Il pavimento è a y = 0, il tappeto è centrato nell'origine.
 */
import { CAMPAGNA, type StanzaId } from '@/content/campagna'

/** Cuscini per partita */
export const CUSCINI = 12
/** Il tappeto: i cuscini si muovono solo sopra (poco oltre il bordo) */
export const RAGGIO_TAPPETO = 1.45
export const RAGGIO_MANO = 1.6
/** L'altezza della lampada: chi ci arriva col fortino la accende */
export const ALTEZZA_LAMPADA = 1.35
/** Cuscini che devono stare sul tappeto per dire che il fortino è un fortino e non una torre */
export const MINIMO_SUL_TAPPETO = 6
/** Quanto sopra la cima del fortino galleggia il cuscino in mano */
export const SOSPESO = 0.55
/** Il cuscino lasciato è "fermo" sotto queste velocità (m/s, rad/s) */
export const FERMO_LIN = 0.06
export const FERMO_ANG = 0.15
/** Quanto deve restare tutto fermo prima di passare al cuscino dopo / dichiarare il fortino */
export const ATTESA_FERMO_MS = 450
/** Dopo così tanto si passa comunque al prossimo cuscino */
export const ATTESA_MAX_MS = 2600

/** Le porte dell'atrio: un arco dietro al fortino, rivolte verso chi guarda */
export interface PostoPorta {
  id: StanzaId
  nome: string
  href: string
  aperta: boolean
  /** Posizione della soglia sul pavimento */
  x: number
  z: number
  /** Rotazione attorno all'asse verticale: la porta guarda verso +z ruotata di tanto */
  ry: number
  colore: string
  luce: string
}

const COLORI: Record<StanzaId, { colore: string; luce: string }> = {
  fortino: { colore: '#E2582A', luce: '#FFD58A' },
  sono: { colore: '#F2B33D', luce: '#FFF1C9' },
  balconi: { colore: '#5E7A5A', luce: '#CFE3C0' },
  studio: { colore: '#2F4E9A', luce: '#C9D6FF' },
}

const RAGGIO_ARCO = 9
const PASSO_ANGOLO = 0.26
const CENTRO_ARCO_Z = 2

export const PORTE: PostoPorta[] = CAMPAGNA.stanze.map((s, i, tutte) => {
  const a = (i - (tutte.length - 1) / 2) * PASSO_ANGOLO
  return {
    id: s.id,
    nome: s.nome,
    href: s.href,
    aperta: s.aperta,
    x: Math.sin(a) * RAGGIO_ARCO,
    z: CENTRO_ARCO_Z - Math.cos(a) * RAGGIO_ARCO,
    ry: -a,
    ...COLORI[s.id],
  }
})

export const portaDi = (id: string | null) => PORTE.find((p) => p.id === id) ?? null
