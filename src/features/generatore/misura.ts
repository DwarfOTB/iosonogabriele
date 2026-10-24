/**
 * Misure prese dal DOM, con gli stessi stili del titolo vivo.
 * Il canvas non conosce l'asse "wdth" della Archivo: misurando il DOM sappiamo
 * quanto è largo davvero ogni carattere compresso e dove sta la linea di base
 * rispetto al fondo della lettera (il punto da cui <Strozzato> la allunga).
 * Solo nel browser: va chiamato da effetti o handler.
 */

import { spaziatura } from '@/components/strozzato/fisica'

export const NBSP = '\u00a0'

export interface MisureDom {
  /** Avanzamento di ogni carattere, in em */
  avanzamenti: number[]
  /** Distanza tra la linea di base e il fondo della lettera inline-block (in em, verso il basso) */
  fondo: number
}

const PX = 100

function contenitore(famiglia: string, peso: number, wdth: number): HTMLDivElement {
  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  const st = box.style
  st.position = 'fixed'
  st.left = '-10000px'
  st.top = '0'
  st.visibility = 'hidden'
  st.pointerEvents = 'none'
  st.whiteSpace = 'nowrap'
  st.fontFamily = famiglia
  st.fontWeight = String(peso)
  st.fontVariationSettings = `"wdth" ${wdth}`
  st.fontSize = PX + 'px'
  st.lineHeight = '0.8'
  st.letterSpacing = '0'
  st.fontKerning = 'none'
  return box
}

/**
 * Misura i caratteri come li impagina <Strozzato>: ognuno nel suo
 * inline-block, quindi senza crenatura tra lettere vicine.
 */
export function misuraDom(caratteri: string[], famiglia: string, peso = 900, wdth = 62): MisureDom {
  const box = contenitore(famiglia, peso, wdth)
  const unici = Array.from(new Set(caratteri.length ? caratteri : ['H']))
  const spans = unici.map((c) => {
    const sp = document.createElement('span')
    sp.style.display = 'inline-block'
    sp.textContent = c === ' ' ? NBSP : c
    box.appendChild(sp)
    return sp
  })
  // segnaposto alto zero: il suo bordo sta esattamente sulla linea di base
  const base = document.createElement('span')
  base.style.display = 'inline-block'
  base.style.width = '0'
  base.style.height = '0'
  box.appendChild(base)
  document.body.appendChild(box)

  const larghezze = new Map<string, number>()
  spans.forEach((sp, i) => larghezze.set(unici[i], sp.getBoundingClientRect().width / PX))
  const r0 = spans[0].getBoundingClientRect()
  const yBase = base.getBoundingClientRect().top
  box.remove()

  const fondo = (r0.bottom - yBase) / PX
  return {
    avanzamenti: caratteri.map((c) => larghezze.get(c) ?? 0),
    fondo: Number.isFinite(fondo) ? fondo : 0.07,
  }
}

/** Larghezza di una stringa intera (con crenatura), in em */
export function larghezzaDom(testo: string, famiglia: string, peso: number, wdth = 62): number {
  const box = contenitore(famiglia, peso, wdth)
  box.style.whiteSpace = 'pre'
  box.style.fontKerning = 'auto'
  box.textContent = testo
  document.body.appendChild(box)
  const w = box.getBoundingClientRect().width / PX
  box.remove()
  return w
}

/* Larghezze indicative a wdth 62, peso 900 (em): servono solo al primo disegno, prima di poter misurare */
const STIMA: Record<string, number> = {
  ' ': 0.2, '.': 0.22, "'": 0.16, I: 0.23, J: 0.36, L: 0.38, F: 0.4, T: 0.4, E: 0.4,
  M: 0.6, W: 0.66, O: 0.47, Q: 0.47, C: 0.44, G: 0.46, '1': 0.32,
}

/** Larghezza del titolo a riposo in em, stimata: va bene anche sul server */
export function stimaEm(testo: string): number {
  const car = Array.from(testo)
  return Math.max(0.5, car.reduce((t, c) => t + (STIMA[c] ?? 0.43), 0) + car.length * spaziatura(0))
}

/** Larghezza del titolo a riposo in em, misurata come la impagina <Strozzato> */
export function misuraEm(testo: string, famiglia: string): number {
  const car = Array.from(testo)
  const { avanzamenti } = misuraDom(car, famiglia)
  return avanzamenti.reduce((t, a) => t + a, 0) + car.length * spaziatura(0)
}
