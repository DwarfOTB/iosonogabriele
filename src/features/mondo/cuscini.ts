/**
 * I cuscini: forme, misure e geometria. Un cuscino è una scatola suddivisa e
 * gonfiata: pieno al centro, schiacciato sulle cuciture, con gli angoli che
 * fanno la punta come quelli veri.
 */
import * as THREE from 'three'
import { STOFFE, type Stoffa } from './tessuti'

export type Forma = 'quadrato' | 'guanciale' | 'cuscinone'

/** Misure in metri: larghezza, spessore al centro, profondità */
export const MISURE: Record<Forma, [number, number, number]> = {
  quadrato: [0.6, 0.2, 0.6],
  guanciale: [0.86, 0.19, 0.5],
  cuscinone: [0.72, 0.3, 0.72],
}

export interface Cuscino {
  id: number
  forma: Forma
  stoffa: Stoffa
}

/** La sequenza dei cuscini di una partita: varia ma sempre la stessa per un dato seme */
export function sequenza(n: number, seme: number): Cuscino[] {
  const forme: Forma[] = ['quadrato', 'guanciale', 'cuscinone', 'quadrato', 'guanciale']
  let h = seme | 0
  const prossimo = () => {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) + 0x9e3779b9
    return ((h >>> 0) % 1000) / 1000
  }
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    forma: forme[Math.floor(prossimo() * forme.length)],
    stoffa: STOFFE[(i + Math.floor(prossimo() * 2)) % STOFFE.length],
  }))
}

const cacheGeo = new Map<Forma, THREE.BufferGeometry>()

export function geometriaCuscino(forma: Forma): THREE.BufferGeometry {
  const giaFatta = cacheGeo.get(forma)
  if (giaFatta) return giaFatta
  const [w, h, d] = MISURE[forma]
  const g = new THREE.BoxGeometry(w, h, d, 28, 8, 28)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const u = (2 * v.x) / w
    const t = (2 * v.z) / d
    const y = (2 * v.y) / h
    // gonfiore: pieno quasi fino al bordo, poi cala morbido verso la cucitura
    const gx = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 3.2)), 0.42)
    const gz = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 3.2)), 0.42)
    const gonfio = gx * gz
    v.y = y * (h / 2) * (0.16 + 0.84 * gonfio)
    // i fianchi si arrotondano verso fuori a metà altezza, gli angoli tirano in punta
    const pancia = (1 - Math.abs(y)) * 0.05
    const punta = Math.pow(Math.abs(u * t), 3) * 0.07
    v.x *= 1 + pancia * gz - punta * 0.3
    v.z *= 1 + pancia * gx - punta * 0.3
    // un filo di asimmetria: nessun cuscino è perfetto
    v.y += Math.sin(u * 2.3 + t * 1.7) * 0.008 * gonfio
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  cacheGeo.set(forma, g)
  return g
}
