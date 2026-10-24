/**
 * Lo stato condiviso tra il mondo 3D e l'interfaccia sopra (HUD, pagine).
 * Il 3D legge con getState() dentro useFrame, il DOM con gli hook.
 */
import { create } from 'zustand'
import type { Forma } from './cuscini'
import type { Stoffa } from './tessuti'

export type FaseFortino = 'gioco' | 'finiti' | 'completo'

/** Un cuscino fermo nel fortino finito: si salva per ritrovarlo alla prossima visita */
export interface CuscinoSalvato {
  forma: Forma
  stoffa: Stoffa
  p: [number, number, number]
  q: [number, number, number, number]
}

interface StatoMondo {
  fase: FaseFortino
  /** Cuscini ancora da lasciare, compreso quello in mano */
  rimasti: number
  /** Rotazione del cuscino in mano: giro attorno all'asse verticale (passi di 45°) e in piedi o sdraiato */
  giro: number
  inPiedi: boolean
  /** Cambia a ogni "ricomincia": il fortino si rimonta da zero */
  partita: number
  /** Porta che si sta aprendo nell'atrio (la camera ci entra) */
  portaAperta: string | null
  /** Sugli schermi stretti l'atrio mostra una porta alla volta */
  portaFuoco: number
  gira: (verso?: 1 | -1) => void
  alza: () => void
  ricomincia: () => void
  imposta: (s: Partial<Pick<StatoMondo, 'fase' | 'rimasti' | 'portaAperta' | 'portaFuoco'>>) => void
}

/** Misure che cambiano a ogni fotogramma: fuori da React, per non ridisegnare l'interfaccia */
export const vivo = { cima: 0 }

export const useMondo = create<StatoMondo>((set) => ({
  fase: 'gioco',
  rimasti: 0,
  giro: 0,
  inPiedi: false,
  partita: 0,
  portaAperta: null,
  portaFuoco: 1,
  gira: (verso = 1) => set((s) => ({ giro: (s.giro + verso + 8) % 8 })),
  alza: () => set((s) => ({ inPiedi: !s.inPiedi })),
  ricomincia: () => set((s) => ({ partita: s.partita + 1, fase: 'gioco', giro: 0, inPiedi: false })),
  imposta: (s) => set(s),
}))
