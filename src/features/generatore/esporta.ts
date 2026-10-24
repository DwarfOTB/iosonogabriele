/**
 * Export per le storie: PNG 1080×1920. La foto scelta, con la sua
 * inquadratura, e sopra l'istante del titolo strozzato ridisegnato con la
 * stessa fisica di <Strozzato> (trasformaLettera, spaziatura, echi, elettrico).
 * Gira solo nel browser e non fa chiamate di rete: foto e testo restano sul
 * dispositivo. Il lavoro pesante è spezzato a blocchi, così l'interfaccia
 * continua a tremare mentre disegna.
 */
import { elettrico } from '@/components/strozzato/fisica'
import { LINK_GENERATORE, NOME_ARTISTA } from '@/content/campagna'
import { rng, type Rng } from '@/lib/casuale'
import { adatta, impagina, type Glifo, type Impaginazione, type Zona } from './impaginazione'
import { larghezzaDom, misuraDom } from './misura'
import { posa, type Foto, type Inquadratura } from './foto'
import { preparaSpostamento } from './rumore'
import { ZONA_SCRITTA, type Tinta } from './tinte'

/** Formato storia e fasce coperte dall'interfaccia di Instagram in alto e in basso */
export const STORIA = { w: 1080, h: 1920, margine: 250 } as const

/** Dove sta il titolo: nella metà bassa, così i visi della foto restano liberi (stessa fascia dell'anteprima) */
const ZONA: Zona = {
  x: STORIA.w * ZONA_SCRITTA.x,
  y: STORIA.h * ZONA_SCRITTA.y0,
  w: STORIA.w * ZONA_SCRITTA.w,
  h: STORIA.h * (ZONA_SCRITTA.y1 - ZONA_SCRITTA.y0),
}
/** Corpo massimo: le parole cortissime non devono diventare un muro */
const CORPO_MAX = 560
/** Corpo del titolo a schermo a cui è tarato il filtro elettrico: sull'immagine scala in proporzione */
const CORPO_RIFERIMENTO = 120

/**
 * Lo spazio della Archivo compressa è 0.11em: strozzato, la spaziatura negativa
 * lo mangia e sull'immagine "SONO STANCO." diventerebbe una parola sola.
 * Sull'immagine, che deve leggersi da sola, lo spazio tiene un po' di più.
 */
const SPAZIO_IN_PIU = 0.12

export interface RichiestaImmagine {
  testo: string
  foto: Foto
  inquadratura: Inquadratura
  tinta: Tinta
  /** Tensione da fermare (0 a riposo, 1 strozzato) */
  T: number
  /** font-family calcolata del titolo vivo: next/font usa un nome con hash */
  famiglia: string
  /** Istante della fisica (ms, stesso orologio di performance.now): tremito e onda di quel momento */
  oraMs?: number
  seme?: number
  /**
   * Chiamata con il foglio finito, prima della codifica PNG (che da sola dura
   * più di tutto il disegno): chi la usa può mostrarlo subito. Il canvas va
   * copiato dentro la chiamata, dopo viene svuotato.
   */
  onBozza?: (foglio: HTMLCanvasElement) => void
}

export async function esportaImmagine(o: RichiestaImmagine): Promise<Blob> {
  const { w: W, h: H } = STORIA
  const T = Math.max(0, Math.min(1.1, o.T))
  const ora = o.oraMs ?? 0
  const seme = o.seme ?? semeDa(o.testo, ora)

  await caricaFont(o.famiglia, o.testo)

  const foglio = nuovaTela(W, H)
  try {
    const c = contesto(foglio, { alpha: false })
    disegnaFoto(c, o.foto, o.inquadratura, W, H)
    await respiro()

    const titolo = await disegnaTitolo(o.testo, o.famiglia, o.tinta, T, ora, rng(seme ^ 0x5bd1e995))
    c.drawImage(titolo.tela, titolo.x, titolo.y)
    libera(titolo.tela)

    disegnaFirma(c, o.famiglia, o.tinta, H)
    o.onBozza?.(foglio)
    // la codifica gira a pezzi nei momenti liberi del browser: lenta ma non blocca
    return await inPng(foglio)
  } finally {
    libera(foglio)
  }
}

/* ------------------------------------------------------------------- foto */

/** La foto come la si vede nell'anteprima: stessa inquadratura, a piena risoluzione */
function disegnaFoto(c: CanvasRenderingContext2D, f: Foto, q: Inquadratura, W: number, H: number) {
  c.fillStyle = '#000'
  c.fillRect(0, 0, W, H)
  const p = posa(f, q)
  c.imageSmoothingEnabled = true
  c.imageSmoothingQuality = 'high'
  c.drawImage(f.bitmap, p.x * W, p.y * W, p.w * W, p.h * W)
}

/* ----------------------------------------------------------------- titolo */

interface TitoloDisegnato {
  tela: HTMLCanvasElement
  x: number
  y: number
}

async function disegnaTitolo(
  testo: string,
  famiglia: string,
  tinta: Tinta,
  T: number,
  ora: number,
  r: Rng,
): Promise<TitoloDisegnato> {
  const caratteri = Array.from(testo)
  const dom = misuraDom(caratteri, famiglia)

  // il canvas misura l'inchiostro in verticale; in orizzontale comanda il DOM
  const metro = contesto(nuovaTela(4, 4))
  impostaFont(metro, 100, 900, famiglia)
  const kx: number[] = []
  const glifi: Glifo[] = caratteri.map((ch, i) => {
    const vuoto = ch.trim() === ''
    const m = metro.measureText(ch)
    const avanzamento = dom.avanzamenti[i] ?? 0
    // se il canvas non comprime (niente fontStretch) si stringe la lettera fino alla larghezza vera
    kx.push(m.width > 0 && avanzamento > 0 ? (avanzamento * 100) / m.width : 1)
    return {
      avanzamento: vuoto ? avanzamento + SPAZIO_IN_PIU : avanzamento,
      sopra: vuoto ? 0 : m.actualBoundingBoxAscent / 100,
      sotto: vuoto ? 0 : m.actualBoundingBoxDescent / 100,
      vuoto,
    }
  })

  const imp = impagina(glifi, dom.fondo, T, ora)
  const { F, ax, by } = adatta(imp.riquadro, ZONA, CORPO_MAX)

  const e = elettrico(T)
  const k = F / CORPO_RIFERIMENTO
  const scala = e.attivo ? e.scala * k : 0
  const margine = Math.ceil(scala / 2 + 14)
  const R = imp.riquadro
  const x0 = Math.floor(ax + R.x0 * F) - margine
  const y0 = Math.floor(by + R.y0 * F) - margine
  const w = Math.ceil((R.x1 - R.x0) * F) + 2 * margine
  const h = Math.ceil((R.y1 - R.y0) * F) + 2 * margine

  const tela = nuovaTela(w, h)
  const c = contesto(tela)
  c.translate(-x0, -y0)
  impostaFont(c, F, 900, famiglia)
  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'

  // prima gli echi, dal più lontano al più vicino, poi le lettere sopra
  for (let n = imp.echi.length - 1; n >= 0; n--) {
    const eco = imp.echi[n]
    c.fillStyle = eco.colore === 'ink' ? tinta.testo : tinta.eco
    c.globalAlpha = eco.alfa
    scriviLettere(c, imp, caratteri, kx, F, ax, by, eco.dy)
  }
  c.globalAlpha = 1
  c.fillStyle = tinta.testo
  scriviLettere(c, imp, caratteri, kx, F, ax, by, 0)
  libera(metro.canvas)

  if (e.attivo) await elettrizza(c, w, h, k / e.frequenza, scala, r)
  return { tela, x: x0, y: y0 }
}

/**
 * Scrive ogni lettera con la sua trasformazione, come lo span di <Strozzato>:
 * origine al centro in basso dello span, poi traslazione e scala.
 * `dy` sposta in verticale prima della trasformazione (gli echi sono text-shadow).
 */
function scriviLettere(
  c: CanvasRenderingContext2D,
  imp: Impaginazione,
  caratteri: string[],
  kx: number[],
  F: number,
  ax: number,
  by: number,
  dy: number,
) {
  const fondo = imp.fondo
  imp.lettere.forEach((l, i) => {
    if (l.glifo.vuoto) return
    c.save()
    c.translate(ax + (l.ox + l.t.tx) * F, by + (fondo + l.t.ty) * F)
    c.scale(l.t.sx, l.t.sy)
    c.translate((l.x - l.ox) * F, (dy - fondo) * F)
    c.scale(kx[i], 1)
    c.fillText(caratteri[i], 0, 0)
    c.restore()
  })
}

/**
 * Bordi elettrici: ogni pixel prende il colore di un vicino scelto da un campo
 * di rumore, come feTurbulence + feDisplacementMap sullo schermo.
 * A blocchi di righe, cedendo il passo ogni ~10 ms.
 */
async function elettrizza(c: CanvasRenderingContext2D, w: number, h: number, cella: number, scala: number, r: Rng) {
  const sorgente = c.getImageData(0, 0, w, h)
  const destinazione = c.createImageData(w, h)
  const da = new Uint32Array(sorgente.data.buffer)
  const a = new Uint32Array(destinazione.data.buffer)
  const sp = preparaSpostamento(w, h, cella, scala, r)
  const BLOCCO = 32
  let inizio = performance.now()
  for (let y = 0; y < h; y += BLOCCO) {
    sp.righe(da, a, y, Math.min(h, y + BLOCCO))
    if (performance.now() - inizio > 10) {
      await respiro()
      inizio = performance.now()
    }
  }
  c.putImageData(destinazione, 0, 0)
}

/* ------------------------------------------------------------------ firma */

function disegnaFirma(c: CanvasRenderingContext2D, famiglia: string, tinta: Tinta, H: number) {
  const sx = STORIA.w * 0.07
  const dx = STORIA.w * 0.93
  const y = H - STORIA.margine + 20
  c.save()
  // un'ombra corta: la firma resta leggibile anche dove la foto è uguale alla tinta
  c.shadowColor = tinta.ombra
  c.shadowBlur = 18
  c.fillStyle = tinta.testo
  c.globalAlpha = 0.92
  scrivi(c, NOME_ARTISTA, sx, y, 40, 900, famiglia, 'sinistra')
  scrivi(c, LINK_GENERATORE, dx, y, 40, 600, famiglia, 'destra')
  c.restore()
}

/** Una riga compressa: larghezza presa dal DOM (wdth 62), il canvas si adegua */
function scrivi(
  c: CanvasRenderingContext2D,
  testo: string,
  x: number,
  y: number,
  px: number,
  peso: number,
  famiglia: string,
  lato: 'sinistra' | 'destra',
) {
  impostaFont(c, px, peso, famiglia)
  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'
  const larga = larghezzaDom(testo, famiglia, peso) * px
  const kx = larga / Math.max(1, c.measureText(testo).width)
  c.save()
  c.translate(lato === 'destra' ? x - larga : x, y)
  c.scale(kx, 1)
  c.fillText(testo, 0, 0)
  c.restore()
}

/* ---------------------------------------------------------------- servizi */

function impostaFont(c: CanvasRenderingContext2D, px: number, peso: number, famiglia: string) {
  c.font = `${peso} ${px}px ${famiglia}`
  // la Archivo variabile copre wdth 62–125: dove il canvas lo supporta prende l'asse vero
  if ('fontStretch' in c) c.fontStretch = 'extra-condensed'
}

async function caricaFont(famiglia: string, testo: string) {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined
  if (!fonts) return
  try {
    await Promise.race([
      Promise.all([
        fonts.load(`900 100px ${famiglia}`, testo),
        fonts.load(`600 100px ${famiglia}`, LINK_GENERATORE),
      ]),
      attendi(2500),
    ])
  } catch {
    // si disegna con quello che c'è
  }
}

function nuovaTela(w: number, h: number): HTMLCanvasElement {
  const t = document.createElement('canvas')
  t.width = Math.max(1, Math.round(w))
  t.height = Math.max(1, Math.round(h))
  return t
}

/**
 * Contesti sempre in memoria (willReadFrequently): migliaia di tratti sottili
 * la CPU li disegna in decine di ms, la GPU in secondi. E un canvas su GPU usato
 * come motivo costringerebbe a svuotare tutta la coda della GPU alla prima lettura.
 */
function contesto(t: HTMLCanvasElement, opzioni: CanvasRenderingContext2DSettings = {}): CanvasRenderingContext2D {
  const c = t.getContext('2d', { willReadFrequently: true, ...opzioni })
  if (!c) throw new Error('canvas 2d non disponibile')
  return c
}

/** Su iOS la memoria dei canvas è poca: si svuotano appena finiti */
function libera(t: HTMLCanvasElement) {
  t.width = 0
  t.height = 0
}

function inPng(t: HTMLCanvasElement): Promise<Blob> {
  return new Promise((ok, ko) => {
    t.toBlob((b) => (b ? ok(b) : ko(new Error('png non generato'))), 'image/png')
  })
}

const attendi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Cede il passo al browser tra un blocco di lavoro e l'altro */
function respiro(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  if (typeof s?.yield === 'function') return s.yield()
  return attendi(0)
}

function semeDa(testo: string, ora: number): number {
  let h = Math.floor(ora) | 0
  for (const ch of testo) h = Math.imul(h ^ (ch.codePointAt(0) ?? 0), 0x9e3779b1)
  return h ^ (h >>> 15)
}
