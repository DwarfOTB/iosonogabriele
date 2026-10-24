/**
 * Impaginazione del testo strozzato per l'export. Funzioni pure: rifanno in
 * unità "em" quello che <Strozzato> fa con gli span, usando la stessa fisica
 * (trasformaLettera, spaziatura, echi). Unità: em, linea di base a y = 0,
 * y positivo verso il basso.
 */
import {
  echi,
  parametriLettera,
  spaziatura,
  trasformaLettera,
  type Trasformazione,
} from '@/components/strozzato/fisica'

export interface Glifo {
  /** Avanzamento nel DOM (wdth 62), in em */
  avanzamento: number
  /** Inchiostro sopra la linea di base, in em */
  sopra: number
  /** Inchiostro sotto la linea di base, in em */
  sotto: number
  /** Spazio: occupa posto ma non si disegna */
  vuoto: boolean
}

export interface LetteraImpaginata {
  glifo: Glifo
  /** Bordo sinistro dello span */
  x: number
  /** Centro dello span: origine della trasformazione (con y = fondo) */
  ox: number
  t: Trasformazione
}

export interface Riquadro {
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface Impaginazione {
  lettere: LetteraImpaginata[]
  echi: ReturnType<typeof echi>
  /** Origine verticale delle trasformazioni (fondo dello span), in em sotto la base */
  fondo: number
  /** Ingombro dell'inchiostro, echi compresi */
  riquadro: Riquadro
  /** Ingombro delle sole lettere */
  lettereRiquadro: Riquadro
}

const vuoto = (): Riquadro => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity })

function allarga(r: Riquadro, x: number, y: number) {
  if (x < r.x0) r.x0 = x
  if (x > r.x1) r.x1 = x
  if (y < r.y0) r.y0 = y
  if (y > r.y1) r.y1 = y
}

/** Applica la trasformazione dello span a un punto (stessa matematica del CSS transform con origine) */
export function trasforma(l: LetteraImpaginata, fondo: number, px: number, py: number): [number, number] {
  return [l.ox + l.t.tx + (px - l.ox) * l.t.sx, fondo + l.t.ty + (py - fondo) * l.t.sy]
}

export function impagina(glifi: Glifo[], fondo: number, T: number, oraMs: number): Impaginazione {
  const ls = spaziatura(T)
  const ec = echi(T)
  const dyEco = ec.reduce((m, e) => Math.min(m, e.dy), 0)
  const riquadro = vuoto()
  const lettereRiquadro = vuoto()
  let x = 0

  const lettere = glifi.map((glifo, i) => {
    const w = glifo.avanzamento + ls
    const l: LetteraImpaginata = {
      glifo,
      x,
      ox: x + w / 2,
      t: trasformaLettera(T, i, oraMs, parametriLettera(i)),
    }
    if (!glifo.vuoto) {
      for (const px of [x, x + glifo.avanzamento]) {
        for (const py of [-glifo.sopra, glifo.sotto]) {
          const [X, Y] = trasforma(l, fondo, px, py)
          allarga(lettereRiquadro, X, Y)
          allarga(riquadro, X, Y)
        }
        const [X, Y] = trasforma(l, fondo, px, -glifo.sopra + dyEco)
        allarga(riquadro, X, Y)
      }
    }
    x += w
    return l
  })

  if (!Number.isFinite(riquadro.x0)) {
    const zero = { x0: 0, y0: -0.7, x1: 0.1, y1: 0 }
    return { lettere, echi: ec, fondo, riquadro: zero, lettereRiquadro: { ...zero } }
  }
  return { lettere, echi: ec, fondo, riquadro, lettereRiquadro }
}

export interface Zona {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Scala e posizione per far stare l'ingombro nella zona, centrato.
 * Restituisce la dimensione del font F (px) e dove cade l'origine (x=0, base) in px.
 */
export function adatta(r: Riquadro, zona: Zona, maxF: number): { F: number; ax: number; by: number } {
  const w = Math.max(1e-3, r.x1 - r.x0)
  const h = Math.max(1e-3, r.y1 - r.y0)
  const F = Math.min(zona.w / w, zona.h / h, maxF)
  return {
    F,
    ax: zona.x + (zona.w - w * F) / 2 - r.x0 * F,
    by: zona.y + (zona.h - h * F) / 2 - r.y0 * F,
  }
}
