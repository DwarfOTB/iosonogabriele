/**
 * Le stoffe dei cuscini, dipinte su canvas: fantasia (colore) e trama
 * (rilievo del tessuto). Sono segnaposto fatti bene: quando i grafici
 * scansionano le stoffe vere si sostituisce solo `dipingi` con una texture.
 */
import * as THREE from 'three'
import { rng } from '@/lib/casuale'

export type Stoffa = 'rigatino' | 'trapunta' | 'velluto' | 'fiori' | 'notte' | 'lino'
export const STOFFE: readonly Stoffa[] = ['rigatino', 'velluto', 'fiori', 'trapunta', 'lino', 'notte']

const LATO = 512

interface Finitura {
  /** Lucentezza radente del tessuto (MeshPhysicalMaterial.sheen) */
  sheen: number
  sheenColor: string
  roughness: number
  /** Quanto si sente la trama */
  rilievo: number
}

export const FINITURE: Record<Stoffa, Finitura> = {
  rigatino: { sheen: 0.4, sheenColor: '#ffffff', roughness: 0.85, rilievo: 0.012 },
  trapunta: { sheen: 0.5, sheenColor: '#fff4e0', roughness: 0.8, rilievo: 0.03 },
  velluto: { sheen: 1, sheenColor: '#ffc27a', roughness: 0.7, rilievo: 0.006 },
  fiori: { sheen: 0.35, sheenColor: '#ffffff', roughness: 0.9, rilievo: 0.01 },
  notte: { sheen: 0.8, sheenColor: '#8fa4ff', roughness: 0.75, rilievo: 0.008 },
  lino: { sheen: 0.3, sheenColor: '#ffffff', roughness: 0.95, rilievo: 0.016 },
}

function tela(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = LATO
  c.height = LATO
  const g = c.getContext('2d')
  if (!g) throw new Error('canvas 2d non disponibile')
  return [c, g]
}

/** Un fiorellino a cinque petali, un po' storto: dipinto, non stampato */
function fiore(g: CanvasRenderingContext2D, r: () => number, x: number, y: number, s: number, colore: string) {
  g.save()
  g.translate(x, y)
  g.rotate(r() * Math.PI)
  g.fillStyle = colore
  for (let i = 0; i < 5; i++) {
    g.rotate((Math.PI * 2) / 5)
    g.beginPath()
    g.ellipse(0, -s * (0.9 + r() * 0.2), s * 0.55, s * (0.85 + r() * 0.2), 0, 0, Math.PI * 2)
    g.fill()
  }
  g.fillStyle = '#F2B33D'
  g.beginPath()
  g.arc(0, 0, s * 0.45, 0, Math.PI * 2)
  g.fill()
  g.restore()
}

function dipingi(stoffa: Stoffa, g: CanvasRenderingContext2D) {
  const r = rng(stoffa.length * 977)
  const L = LATO
  switch (stoffa) {
    case 'rigatino': {
      // il rigatino da materasso: righe blu fitte e larghe alternate su écru
      g.fillStyle = '#EFEBE1'
      g.fillRect(0, 0, L, L)
      g.fillStyle = '#2F4E9A'
      const passo = L / 8
      for (let i = 0; i < 8; i++) {
        const x = i * passo
        g.globalAlpha = 0.95
        g.fillRect(x + passo * 0.08, 0, passo * 0.22, L)
        g.globalAlpha = 0.8
        g.fillRect(x + passo * 0.42, 0, passo * 0.05, L)
        g.fillRect(x + passo * 0.52, 0, passo * 0.05, L)
      }
      g.globalAlpha = 1
      break
    }
    case 'trapunta': {
      g.fillStyle = '#E9E2D2'
      g.fillRect(0, 0, L, L)
      // impunture a losanghe
      g.strokeStyle = 'rgba(90,70,40,0.35)'
      g.lineWidth = 2
      g.setLineDash([7, 5])
      const p = L / 4
      for (let i = -4; i <= 8; i++) {
        g.beginPath()
        g.moveTo(i * p, 0)
        g.lineTo(i * p + L, L)
        g.stroke()
        g.beginPath()
        g.moveTo(i * p, L)
        g.lineTo(i * p + L, 0)
        g.stroke()
      }
      g.setLineDash([])
      break
    }
    case 'velluto': {
      // ocra elettrico come i capelli della cover
      const grad = g.createLinearGradient(0, 0, L, L)
      grad.addColorStop(0, '#E2582A')
      grad.addColorStop(0.5, '#E86A30')
      grad.addColorStop(1, '#D9502A')
      g.fillStyle = grad
      g.fillRect(0, 0, L, L)
      break
    }
    case 'fiori': {
      // il campo di fiori del video
      g.fillStyle = '#F4F1E8'
      g.fillRect(0, 0, L, L)
      const colori = ['#E2582A', '#2F4E9A', '#C9A2D8', '#E2582A']
      for (let i = 0; i < 46; i++) {
        const x = r() * L
        const y = r() * L
        const s = 7 + r() * 9
        // ripetuto ai bordi: la texture si ripete senza cuciture
        for (const dx of [-L, 0, L]) for (const dy of [-L, 0, L]) fiore(g, rng(i * 31 + 7), x + dx, y + dy, s, colori[i % colori.length])
      }
      break
    }
    case 'notte': {
      g.fillStyle = '#1A2142'
      g.fillRect(0, 0, L, L)
      g.fillStyle = '#F2B33D'
      for (let i = 0; i < 70; i++) {
        const x = r() * L
        const y = r() * L
        const s = 1.5 + r() * 3
        g.globalAlpha = 0.6 + r() * 0.4
        g.beginPath()
        g.arc(x, y, s, 0, Math.PI * 2)
        g.fill()
      }
      g.globalAlpha = 1
      break
    }
    case 'lino': {
      g.fillStyle = '#D9CCB4'
      g.fillRect(0, 0, L, L)
      break
    }
  }
}

/** Trama del tessuto in scala di grigi: fili orizzontali e verticali con nodi irregolari */
function trama(g: CanvasRenderingContext2D, seme: number, fitta: number) {
  const r = rng(seme)
  const L = LATO
  g.fillStyle = '#808080'
  g.fillRect(0, 0, L, L)
  const passo = L / fitta
  for (let i = 0; i < fitta; i++) {
    const v = 110 + r() * 60
    g.fillStyle = `rgb(${v},${v},${v})`
    g.fillRect(0, i * passo, L, passo * 0.55)
    const u = 110 + r() * 60
    g.fillStyle = `rgba(${u},${u},${u},0.6)`
    g.fillRect(i * passo, 0, passo * 0.55, L)
  }
  // fiammature del filo
  for (let i = 0; i < 900; i++) {
    const v = r() > 0.5 ? 200 : 60
    g.fillStyle = `rgba(${v},${v},${v},0.25)`
    g.fillRect(r() * L, r() * L, 2 + r() * 10, 1.5)
  }
}

interface Tessuto {
  map: THREE.CanvasTexture
  bump: THREE.CanvasTexture
}

const cache = new Map<Stoffa, Tessuto>()

export function tessuto(stoffa: Stoffa): Tessuto {
  const giaFatto = cache.get(stoffa)
  if (giaFatto) return giaFatto
  const [c1, g1] = tela()
  dipingi(stoffa, g1)
  const [c2, g2] = tela()
  trama(g2, stoffa.length * 131, stoffa === 'lino' ? 180 : stoffa === 'velluto' ? 256 : 140)
  if (stoffa === 'trapunta') {
    // le impunture affondano: solchi scuri sulla trama
    g2.strokeStyle = '#202020'
    g2.lineWidth = 5
    const p = LATO / 4
    for (let i = -4; i <= 8; i++) {
      g2.beginPath()
      g2.moveTo(i * p, 0)
      g2.lineTo(i * p + LATO, LATO)
      g2.moveTo(i * p, LATO)
      g2.lineTo(i * p + LATO, 0)
      g2.stroke()
    }
  }
  const map = new THREE.CanvasTexture(c1)
  map.colorSpace = THREE.SRGBColorSpace
  const bump = new THREE.CanvasTexture(c2)
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 8
  }
  const fatto = { map, bump }
  cache.set(stoffa, fatto)
  return fatto
}

/** Il tappeto tondo sotto al fortino: anelli tessuti a mano */
export function texturaTappeto(): THREE.CanvasTexture {
  const [c, g] = tela()
  const L = LATO
  const r = rng(4242)
  // lana grezza color avena, con due fili sottili di colore verso il bordo
  g.fillStyle = '#D8CDB8'
  g.fillRect(0, 0, L, L)
  const fili: [number, number, string][] = [
    [0.5, 0.012, '#B9AC95'],
    [0.47, 0.008, '#E2582A'],
    [0.455, 0.004, '#B9AC95'],
    [0.43, 0.006, '#2F4E9A'],
  ]
  for (const [raggio, spessore, colore] of fili) {
    g.strokeStyle = colore
    g.lineWidth = spessore * L
    g.beginPath()
    g.arc(L / 2, L / 2, raggio * L - spessore * L, 0, Math.PI * 2)
    g.stroke()
  }
  // la spirale della treccia: il tappeto è un'unica corda arrotolata
  g.strokeStyle = 'rgba(120,105,80,0.22)'
  g.lineWidth = 2
  g.beginPath()
  for (let a = 0; a < Math.PI * 2 * 34; a += 0.05) {
    const rr = (a / (Math.PI * 2 * 34)) * L * 0.42
    const x = L / 2 + Math.cos(a) * rr
    const y = L / 2 + Math.sin(a) * rr
    if (a === 0) g.moveTo(x, y)
    else g.lineTo(x, y)
  }
  g.stroke()
  // trama annodata
  for (let k = 0; k < 6000; k++) {
    const v = r() > 0.5 ? 255 : 0
    g.fillStyle = `rgba(${v},${v},${v},0.08)`
    g.fillRect(r() * L, r() * L, 2, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Il pavimento della stanza bianca: piastrelle enormi, fughe appena visibili */
export function texturaPavimento(): THREE.CanvasTexture {
  const [c, g] = tela()
  const L = LATO
  g.fillStyle = '#F4F2ED'
  g.fillRect(0, 0, L, L)
  const r = rng(77)
  for (let k = 0; k < 4000; k++) {
    const v = 225 + r() * 30
    g.fillStyle = `rgba(${v},${v},${v},0.25)`
    g.fillRect(r() * L, r() * L, 3, 3)
  }
  g.strokeStyle = 'rgba(150,145,135,0.22)'
  g.lineWidth = 2
  g.strokeRect(0, 0, L, L)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}
