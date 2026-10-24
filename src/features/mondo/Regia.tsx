'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { PORTE, portaDi, type PostoPorta } from './regole'
import { useMondo, vivo } from './stato'

const P = new THREE.Vector3()
const T = new THREE.Vector3()
const N = new THREE.Vector3()

function davanti(p: PostoPorta, distanza: number, altezza: number, out: THREE.Vector3) {
  N.set(Math.sin(p.ry), 0, Math.cos(p.ry))
  return out.set(p.x, altezza, p.z).addScaledVector(N, distanza)
}

/**
 * La camera: una sola, che si sposta nella stessa stanza da una pagina
 * all'altra. Niente tagli: ogni cambio è un movimento di macchina.
 */
export function Regia({ percorso }: { percorso: string }) {
  const pos = useRef(new THREE.Vector3(0, 3.2, 9))
  const mira = useRef(new THREE.Vector3(0, 0.8, 0))

  useFrame((stato, dt) => {
    const camera = stato.camera as THREE.PerspectiveCamera
    const size = stato.size
    const aspetto = size.width / Math.max(1, size.height)
    const stretto = aspetto < 0.85
    const fov = stretto ? 50 : 38
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    const s = useMondo.getState()
    const t = stato.clock.elapsedTime
    const entra = portaDi(s.portaAperta)
    let rapidita = 2.2

    if (entra) {
      // si entra dalla porta: la camera attraversa il vano
      davanti(entra, -2.5, 1.05, T)
      davanti(entra, 0.15, 1.12, P)
      rapidita = 1.5
    } else if (percorso === '/') {
      if (aspetto < 1.15) {
        const p = PORTE[Math.min(PORTE.length - 1, Math.max(0, s.portaFuoco))]
        davanti(p, 0, 1.15, T)
        davanti(p, stretto ? 4.6 : 4, 1.55, P)
      } else {
        T.set(0, 1.05, -7)
        P.set(0, 2.6, 4.4 * Math.max(1, 1.7 / aspetto))
      }
    } else if (percorso === '/balconi' || percorso === '/studio') {
      const p = portaDi(percorso.slice(1)) ?? PORTE[0]
      davanti(p, 0, 1.15, T)
      davanti(p, 3.1, 1.4, P)
    } else {
      // /fortino: il tappeto sta tutto nell'inquadratura, la camera sale con la cima
      const cima = vivo.cima
      const semiLargo = stretto ? 1.15 : 1.9
      const tanH = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspetto
      const d = Math.max(4.4, semiLargo / tanH) + cima * 0.6
      const az = Math.sin(t * 0.11) * 0.2
      const el = 0.52
      // la mira sta un po' sopra la cima: il tappeto scende verso il basso, la lampada resta in vista
      T.set(0, 0.7 + cima * 0.45, 0)
      P.set(Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d + T.y * 0.6, Math.cos(az) * Math.cos(el) * d)
    }

    const k = 1 - Math.exp(-dt * rapidita)
    pos.current.lerp(P, k)
    mira.current.lerp(T, k)
    camera.position.copy(pos.current)
    camera.lookAt(mira.current)
  })

  return null
}
