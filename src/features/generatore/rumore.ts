/**
 * Rumore per l'export, su array di pixel: niente DOM, si può provare in Node.
 * - spostamento "elettrico": l'equivalente in JS di feTurbulence + feDisplacementMap
 *   che <Strozzato> usa sullo schermo (bordi irti come i capelli della cover).
 */

type Rng = () => number

/** Griglia di valori casuali in [0,1] */
function griglia(gw: number, gh: number, r: Rng): Float32Array {
  const g = new Float32Array(gw * gh)
  for (let i = 0; i < g.length; i++) g[i] = r()
  return g
}

const liscio = (t: number) => t * t * (3 - 2 * t)

export interface Spostamento {
  /** Elabora le righe [y0, y1) leggendo da `sorgente` e scrivendo in `dest` (pixel RGBA in Uint32) */
  righe: (sorgente: Uint32Array, dest: Uint32Array, y0: number, y1: number) => void
}

interface Campo {
  gw: number
  g: Float32Array
  ix: Int32Array
  fx: Float32Array
  /** Lato della cella in verticale */
  cy: number
}

/** Value noise su una griglia con celle cx × cy, con indici di colonna precalcolati */
function campo(w: number, h: number, cx: number, cy: number, r: Rng): Campo {
  const gw = Math.ceil(w / cx) + 2
  const gh = Math.ceil(h / cy) + 2
  const ix = new Int32Array(w)
  const fx = new Float32Array(w)
  for (let x = 0; x < w; x++) {
    const u = x / cx
    const i = Math.floor(u)
    ix[x] = i
    fx[x] = liscio(u - i)
  }
  return { gw, g: griglia(gw, gh, r), ix, fx, cy }
}

/**
 * Spostamento dei pixel con un campo di value noise "piegato" (|2n-1|, come la
 * turbolenza): le pieghe danno i bordi irti. `cella` = lato medio della
 * griglia in px, `scala` = spostamento massimo in px (stessa convenzione di
 * feDisplacementMap). Il campo è stirato: lo spostamento orizzontale cambia
 * in fretta riga per riga e piano lungo la riga, quello verticale il contrario.
 * Così dai bordi escono fili sottili, come i capelli della cover, invece
 * di una frangia a quadretti.
 */
export function preparaSpostamento(w: number, h: number, cella: number, scala: number, r: Rng): Spostamento {
  const c = Math.max(1.5, cella)
  const corto = Math.max(1.2, c * 0.4)
  const lungo = c * 2.6
  const cx = campo(w, h, lungo, corto, r)
  const cy = campo(w, h, corto, lungo, r)

  return {
    righe(sorgente, dest, y0, y1) {
      for (let y = y0; y < y1; y++) {
        const va = y / cx.cy
        const ja = Math.floor(va)
        const ta = liscio(va - ja)
        const a0 = ja * cx.gw
        const a1 = a0 + cx.gw
        const vb = y / cy.cy
        const jb = Math.floor(vb)
        const tb = liscio(vb - jb)
        const b0 = jb * cy.gw
        const b1 = b0 + cy.gw
        const gx = cx.g
        const gy = cy.g
        const riga = y * w
        for (let x = 0; x < w; x++) {
          let i = cx.ix[x]
          let t = cx.fx[x]
          let p = gx[a0 + i]
          let q = gx[a1 + i]
          let s = p + (gx[a0 + i + 1] - p) * t
          const nx = s + (q + (gx[a1 + i + 1] - q) * t - s) * ta
          i = cy.ix[x]
          t = cy.fx[x]
          p = gy[b0 + i]
          q = gy[b1 + i]
          s = p + (gy[b0 + i + 1] - p) * t
          const ny = s + (q + (gy[b1 + i + 1] - q) * t - s) * tb
          const sx = Math.round(x + scala * (Math.abs(2 * nx - 1) - 0.5))
          const sy = Math.round(y + scala * (Math.abs(2 * ny - 1) - 0.5))
          dest[riga + x] = sx >= 0 && sx < w && sy >= 0 && sy < h ? sorgente[sy * w + sx] : 0
        }
      }
    },
  }
}
