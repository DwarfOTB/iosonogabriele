/**
 * Fisica del testo strozzato. Funzioni pure: le usa il componente <Strozzato>
 * a ogni fotogramma e le usa il generatore per ridisegnare lo stesso istante
 * su canvas quando esporta l'immagine. Stessa matematica, stesso risultato.
 *
 * T = tensione. 0 = a riposo, 1 = strozzato al massimo. Può superare 1 o
 * scendere sotto 0 per un attimo quando la molla rimbalza.
 */

/** Allungamento verticale a riposo: le lettere sono sempre un po' "collo lungo" */
export const ALLUNGAMENTO_BASE = 1.15

export interface Molla {
  T: number
  v: number
}

/**
 * Un passo della molla verso `obiettivo`. Quando si tiene premuto la molla è
 * rigida e smorzata (si strozza in fretta), al rilascio è morbida e rimbalza
 * (il respiro che torna).
 */
export function passoMolla(m: Molla, obiettivo: number, dt: number, tesa: boolean): Molla {
  const k = tesa ? 70 : 34
  const d = tesa ? 15 : 6.5
  const v = m.v + ((obiettivo - m.T) * k - m.v * d) * dt
  return { T: m.T + v * dt, v }
}

/** Tensione obiettivo mentre si tiene premuto: cresce col tempo e tirando verso l'alto */
export function tensioneTenuta(msTenuti: number, tiroInSuPx: number): number {
  return Math.min(1, 0.42 + (msTenuti / 1000) * 0.55 + Math.max(0, tiroInSuPx) / 220)
}

/** Tensione utile agli effetti: mai negativa, mai oltre 1.1 */
export const tensioneEffetti = (T: number) => Math.max(0, Math.min(1.1, T))

/** Numero pseudo-casuale stabile in [0,1) */
export function hash(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export interface ParametriLettera {
  /** Fase dell'oscillazione, diversa per ogni lettera: respirano fuori sincrono */
  fase: number
  /** Frequenza dell'oscillazione */
  freq: number
  /** Istante (ms) dell'ultimo tocco veloce: la lettera si schiaccia come un cuscino */
  tocco: number
}

export function parametriLettera(i: number, seme = 0): ParametriLettera {
  return { fase: hash(i * 7.13 + seme) * Math.PI * 2, freq: 0.8 + hash(i * 3.71 + seme) * 1.4, tocco: -1e9 }
}

export interface Trasformazione {
  /** Spostamento in em */
  tx: number
  ty: number
  sx: number
  sy: number
}

/**
 * Trasformazione di una lettera all'istante `oraMs`.
 * Il tremito cambia a scatti (circa 12 al secondo) come un disegno animato a mano.
 */
export function trasformaLettera(
  T: number,
  i: number,
  oraMs: number,
  p: ParametriLettera,
  ridotto = false,
): Trasformazione {
  const Tp = tensioneEffetti(T)
  const dtTocco = (oraMs - p.tocco) / 1000
  const schiaccio = dtTocco < 2.2 ? Math.exp(-4.5 * dtTocco) * Math.cos(13 * dtTocco) : 0
  const onda = ridotto ? 0 : Math.sin((oraMs / 1000) * p.freq * (2 + Tp * 7) + p.fase) * 0.1 * Tp
  const ampiezza = ridotto ? 0 : Math.pow(Tp, 1.4) * 0.055
  const scatto = Math.floor(oraMs / 83)
  return {
    tx: (hash(scatto * 13 + i) - 0.5) * ampiezza,
    ty: (hash(scatto * 7 + i * 3) - 0.5) * ampiezza * 0.6,
    sx: (1 - Tp * 0.24) * (1 + 0.3 * schiaccio),
    sy: (ALLUNGAMENTO_BASE + T * 0.95 + onda) * (1 - 0.45 * schiaccio),
  }
}

/** La lettera sta ancora rimbalzando dopo un tocco */
export const staRimbalzando = (p: ParametriLettera, oraMs: number) => oraMs - p.tocco < 2200

/** Spaziatura tra le lettere in em: più è strozzato, più si stringono */
export const spaziatura = (T: number) => -0.01 - tensioneEffetti(T) * 0.09

/** Echi sopra il testo (IO IO IO): offset verticale in em e opacità */
export function echi(T: number): { dy: number; alfa: number; colore: 'ticking' | 'ink' }[] {
  const n = Math.floor(tensioneEffetti(T) * 5.5)
  return Array.from({ length: n }, (_, k) => {
    const i = k + 1
    return { dy: -0.085 * i, alfa: Math.max(0.08, 0.7 - i * 0.12), colore: i % 2 ? 'ticking' : 'ink' }
  })
}

/** Parametri del filtro "elettrico" (bordi irti come i capelli della cover) */
export function elettrico(T: number): { attivo: boolean; frequenza: number; scala: number } {
  const Tp = tensioneEffetti(T)
  return { attivo: Tp > 0.04, frequenza: 0.03 + Tp * 0.45, scala: 1 + Tp * 7.5 }
}
