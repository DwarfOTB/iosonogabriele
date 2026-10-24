/**
 * Le tinte della scritta sulla foto: testo, colore degli echi e ombra della
 * firma. Gli echi di <Strozzato> sono "ink" (la tinta stessa) e "ticking".
 */
export interface Tinta {
  id: 'bianco' | 'nero' | 'ocra'
  testo: string
  eco: string
  ombra: string
}

export const TINTE: readonly Tinta[] = [
  { id: 'bianco', testo: '#FFFFFF', eco: '#E2582A', ombra: 'rgba(0,0,0,0.45)' },
  { id: 'nero', testo: '#1B1A1F', eco: '#2F4E9A', ombra: 'rgba(255,255,255,0.4)' },
  { id: 'ocra', testo: '#E2582A', eco: '#1B1A1F', ombra: 'rgba(0,0,0,0.35)' },
]

/** La fascia della scritta, in frazioni della storia: metà bassa, sopra la firma e la barra di Instagram */
export const ZONA_SCRITTA = { x: 0.06, w: 0.88, y0: 0.5, y1: 0.8 } as const
