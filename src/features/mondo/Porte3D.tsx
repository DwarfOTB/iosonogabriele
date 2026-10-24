'use client'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PORTE, type PostoPorta } from './regole'
import { useMondo } from './stato'
import css from './Mondo.module.css'

/** Vano della porta (luce netta) e telaio */
const VANO_W = 0.9
const VANO_H = 2.05
const STIPITE = 0.11
const PROF = 0.18
/** Apertura: verso l'interno, lontano da chi guarda */
const APERTA = 1.75
/** Quanto aspetta la porta aperta prima di cambiare pagina (la camera intanto entra) */
const ATTESA_NAVIGA = 1050

/** Sfumatura a trapezio: forte sulla soglia, si allarga e svanisce allontanandosi */
function texturaPozza(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  // in alto nel canvas = sulla soglia: stretta e piena; in basso = lontano: larga e svanita
  grad.addColorStop(0, 'rgba(255,255,255,0.9)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.beginPath()
  g.moveTo(30, 0)
  g.lineTo(98, 0)
  g.lineTo(128, 256)
  g.lineTo(0, 256)
  g.closePath()
  g.fill()
  return new THREE.CanvasTexture(c)
}

function texturaTarga(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#F5F3EE'
  g.beginPath()
  g.arc(128, 128, 124, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#1B1A1F'
  g.lineWidth = 10
  g.beginPath()
  g.arc(128, 128, 112, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = '#1B1A1F'
  g.fillRect(118, 58, 20, 140)
  g.fillRect(58, 118, 140, 20)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Porte3D({ visibili }: { visibili: boolean }) {
  const targa = useMemo(() => texturaTarga(), [])
  const pozza = useMemo(() => texturaPozza(), [])
  return (
    <>
      {PORTE.map((p, i) => (
        <Porta key={p.id} porta={p} indice={i} targa={targa} pozzaLuce={pozza} visibile={visibili} />
      ))}
    </>
  )
}

/** Sotto il pavimento quando non servono: salgono dal nulla entrando nell'atrio */
const SOTTO = -2.5

interface PropsPorta {
  porta: PostoPorta
  indice: number
  targa: THREE.Texture
  pozzaLuce: THREE.Texture
  visibile: boolean
}

function Porta({ porta, indice, targa, pozzaLuce, visibile }: PropsPorta) {
  const radice = useRef<THREE.Group>(null)
  const anta = useRef<THREE.Group>(null)
  const quota = useRef(SOTTO)
  const pozza = useRef<THREE.MeshBasicMaterial>(null)
  const bagliore = useRef<THREE.MeshBasicMaterial>(null)
  const sopra = useRef(false)
  const scossa = useRef(-10)
  const daScuotere = useRef(false)
  const angolo = useRef(0)
  const router = useRouter()
  const percorso = usePathname()

  const vernice = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: porta.colore, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    [porta.colore],
  )
  const verniceScura = useMemo(() => {
    const m = vernice.clone()
    m.color.multiplyScalar(0.86)
    return m
  }, [vernice])

  useFrame((stato, dt) => {
    const aperta = useMondo.getState().portaAperta === porta.id
    const t = stato.clock.elapsedTime
    // ognuna sale con un attimo di ritardo sull'altra
    const ritardo = Math.max(0, Math.min(1, dt * (visibile ? 2.4 - indice * 0.25 : 5)))
    quota.current += ((visibile ? 0 : SOTTO) - quota.current) * ritardo
    if (radice.current) {
      radice.current.position.y = quota.current
      radice.current.visible = quota.current > SOTTO + 0.05
    }
    if (daScuotere.current) {
      daScuotere.current = false
      scossa.current = t
    }
    const obiettivo = aperta ? APERTA : sopra.current && porta.aperta ? 0.1 : 0
    angolo.current += (obiettivo - angolo.current) * Math.min(1, dt * (aperta ? 2.6 : 6))
    let a = angolo.current
    // la porta chiusa a chiave: due colpi secchi contro lo stipite
    const ds = t - scossa.current
    if (ds < 0.5) a += Math.sin(ds * 60) * 0.025 * (1 - ds / 0.5)
    if (anta.current) anta.current.rotation.y = a
    const apertura = Math.min(1, angolo.current / APERTA)
    if (pozza.current) pozza.current.opacity = apertura * 0.85
    if (bagliore.current) bagliore.current.opacity = 0.35 + apertura * 0.65
  })

  const tocca = () => {
    const s = useMondo.getState()
    if (s.portaAperta || !visibile) return
    if (!porta.aperta) {
      daScuotere.current = true
      return
    }
    s.imposta({ portaAperta: porta.id, portaFuoco: indice })
    router.prefetch(porta.href)
    window.setTimeout(() => {
      if (window.location.pathname === percorso) router.push(porta.href)
    }, ATTESA_NAVIGA)
  }

  return (
    <group ref={radice} position={[porta.x, SOTTO, porta.z]} rotation-y={porta.ry}>
      {/* telaio */}
      <mesh position={[-(VANO_W + STIPITE) / 2, (VANO_H + STIPITE) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[STIPITE, VANO_H + STIPITE, PROF]} />
        <meshStandardMaterial color="#F7F5F0" roughness={0.6} />
      </mesh>
      <mesh position={[(VANO_W + STIPITE) / 2, (VANO_H + STIPITE) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[STIPITE, VANO_H + STIPITE, PROF]} />
        <meshStandardMaterial color="#F7F5F0" roughness={0.6} />
      </mesh>
      <mesh position={[0, VANO_H + STIPITE / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[VANO_W + STIPITE * 2, STIPITE, PROF]} />
        <meshStandardMaterial color="#F7F5F0" roughness={0.6} />
      </mesh>

      {/* di là: la luce della stanza */}
      <mesh position={[0, VANO_H / 2, -PROF / 2 + 0.005]}>
        <planeGeometry args={[VANO_W, VANO_H]} />
        <meshBasicMaterial ref={bagliore} color={porta.luce} toneMapped={false} transparent opacity={0.35} />
      </mesh>
      {/* la luce che esce dalla porta aperta e si allunga sul pavimento (finta: niente luci vere, costano) */}
      <mesh position={[0, 0.003, 1.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[VANO_W * 1.6, 2.4]} />
        <meshBasicMaterial
          ref={pozza}
          map={pozzaLuce}
          color={porta.luce}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* l'anta, incernierata a sinistra */}
      <group ref={anta} position={[-VANO_W / 2, 0, PROF / 2 - 0.035]}>
        <group
          position={[VANO_W / 2, VANO_H / 2, 0]}
          onClick={(e) => {
            e.stopPropagation()
            tocca()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            sopra.current = true
            document.body.style.cursor = porta.aperta ? 'pointer' : 'not-allowed'
          }}
          onPointerOut={() => {
            sopra.current = false
            document.body.style.cursor = ''
          }}
        >
          <mesh material={vernice} castShadow receiveShadow>
            <boxGeometry args={[VANO_W - 0.01, VANO_H - 0.01, 0.05]} />
          </mesh>
          {/* due specchiature in rilievo */}
          {[0.48, -0.42].map((y, k) => (
            <mesh key={k} position={[0, y, 0.03]} material={verniceScura} castShadow>
              <boxGeometry args={[VANO_W - 0.26, k === 0 ? 0.72 : 0.84, 0.014]} />
            </mesh>
          ))}
          {/* pomello in ottone */}
          <mesh position={[VANO_W / 2 - 0.1, -0.05, 0.06]} castShadow>
            <sphereGeometry args={[0.035, 24, 16]} />
            <meshStandardMaterial color="#c49a52" metalness={0.95} roughness={0.25} />
          </mesh>
          {!porta.aperta && (
            <mesh position={[0, 0.48, 0.039]}>
              <circleGeometry args={[0.13, 48]} />
              <meshStandardMaterial map={targa} roughness={0.3} />
            </mesh>
          )}
        </group>
      </group>

      {visibile && (
        <Html position={[0, VANO_H + 0.42, 0]} center zIndexRange={[5, 0]}>
          <span className={css.etichetta} data-chiusa={!porta.aperta || undefined}>
            {porta.nome}
          </span>
        </Html>
      )}
    </group>
  )
}
