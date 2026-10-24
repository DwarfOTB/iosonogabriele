/**
 * La foto scelta dal rullino e come sta dentro la storia 9:16.
 * Tutto in unità della storia (larghezza = 1, altezza = 16/9), così la stessa
 * inquadratura vale per l'anteprima a schermo e per l'export a 1080×1920.
 */

export const ASPETTO = 16 / 9
/** Oltre questo lato la foto si riduce subito: le foto da 48MP finirebbero la memoria su iOS */
const LATO_MAX = 2600
export const ZOOM_MAX = 4

export interface Foto {
  bitmap: ImageBitmap
  /** Per l'<img> dell'anteprima: si revoca quando la foto cambia */
  url: string
  iw: number
  ih: number
}

/** Centro dell'inquadratura in coordinate normalizzate della foto (0..1) e ingrandimento (≥ 1) */
export interface Inquadratura {
  cx: number
  cy: number
  z: number
}

export const INQUADRATURA_INIZIALE: Inquadratura = { cx: 0.5, cy: 0.5, z: 1 }

export async function caricaFoto(file: File): Promise<Foto> {
  // l'orientamento EXIF lo applica già il browser (imageOrientation: 'from-image' è il default)
  let bitmap = await createImageBitmap(file)
  const lato = Math.max(bitmap.width, bitmap.height)
  if (lato > LATO_MAX) {
    const k = LATO_MAX / lato
    const ridotta = await createImageBitmap(bitmap, {
      resizeWidth: Math.round(bitmap.width * k),
      resizeHeight: Math.round(bitmap.height * k),
      resizeQuality: 'high',
    })
    bitmap.close()
    bitmap = ridotta
  }
  return { bitmap, url: URL.createObjectURL(file), iw: bitmap.width, ih: bitmap.height }
}

export function liberaFoto(f: Foto | null) {
  if (!f) return
  f.bitmap.close()
  URL.revokeObjectURL(f.url)
}

/** Dimensioni e posizione della foto nella storia (unità: larghezza della storia) */
export function posa(f: Pick<Foto, 'iw' | 'ih'>, q: Inquadratura) {
  const base = Math.max(1 / f.iw, ASPETTO / f.ih)
  const w = f.iw * base * q.z
  const h = f.ih * base * q.z
  return { w, h, x: 0.5 - q.cx * w, y: ASPETTO / 2 - q.cy * h }
}

/** Tiene la foto sempre a coprire tutta la storia: niente bordi vuoti */
export function blocca(f: Pick<Foto, 'iw' | 'ih'>, q: Inquadratura): Inquadratura {
  const z = Math.min(ZOOM_MAX, Math.max(1, q.z))
  const { w, h } = posa(f, { ...q, z })
  const mx = 0.5 / w
  const my = ASPETTO / 2 / h
  return {
    z,
    cx: Math.min(1 - mx, Math.max(mx, q.cx)),
    cy: Math.min(1 - my, Math.max(my, q.cy)),
  }
}

/**
 * Luminosità media della fascia dove cade la scritta (0 nero, 1 bianco):
 * serve a scegliere da sola la tinta che si legge.
 */
export function luceZona(f: Foto, q: Inquadratura, y0: number, y1: number): number {
  const N = 48
  const c = document.createElement('canvas')
  c.width = N
  c.height = Math.round(N * ASPETTO)
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return 0.5
  const p = posa(f, q)
  g.drawImage(f.bitmap, p.x * N, p.y * N, p.w * N, p.h * N)
  const a = Math.floor(y0 * c.height)
  const b = Math.max(a + 1, Math.floor(y1 * c.height))
  const px = g.getImageData(0, a, N, b - a).data
  let somma = 0
  for (let i = 0; i < px.length; i += 4) somma += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
  c.width = 0
  c.height = 0
  return somma / (px.length / 4) / 255
}
