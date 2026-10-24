/** Piccoli servizi condivisi: numeri casuali ripetibili e preferenza di movimento */

export type Rng = () => number

/** Generatore pseudo-casuale con seme (mulberry32) */
export function rng(seme: number): Rng {
  let a = seme | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const movimentoRidotto = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
