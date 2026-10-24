'use client'

import { useFrame, useThree } from '@react-three/fiber'
import type { RapierRigidBody } from '@react-three/rapier'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { progressiOra, salvaFortino } from '@/lib/progressi'
import { CorpoCuscino, GRUPPO_TUTTI } from './CorpoCuscino'
import { MISURE, sequenza, type Cuscino } from './cuscini'
import { Lampada } from './Lampada'
import {
  ALTEZZA_LAMPADA,
  ATTESA_FERMO_MS,
  ATTESA_MAX_MS,
  CUSCINI,
  FERMO_ANG,
  FERMO_LIN,
  MINIMO_SUL_TAPPETO,
  RAGGIO_MANO,
  RAGGIO_TAPPETO,
  SOSPESO,
} from './regole'
import { useMondo, vivo, type CuscinoSalvato } from './stato'

const _q = new THREE.Quaternion()
const _e = new THREE.Euler()
const _m = new THREE.Matrix4()
const _v = new THREE.Vector3()
const _piano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const _ray = new THREE.Raycaster()
const _ndc = new THREE.Vector2()

/** Metà dell'altezza occupata da un cuscino ruotato così (proiezione dei semiassi sulla verticale) */
function mezzaAltezza(c: Cuscino, q: THREE.Quaternion): number {
  const [w, h, d] = MISURE[c.forma]
  _m.makeRotationFromQuaternion(q)
  const e = _m.elements
  return 0.5 * (Math.abs(e[1]) * w + Math.abs(e[5]) * h + Math.abs(e[9]) * d)
}

function rotazioneMano(giro: number, inPiedi: boolean, q: THREE.Quaternion) {
  _e.set(inPiedi ? Math.PI / 2 : 0, (giro * Math.PI) / 4, 0, 'YXZ')
  return q.setFromEuler(_e)
}

/**
 * Il fortino: un cuscino alla volta, lo sposti sopra al tappeto e lo lasci.
 * Quando la cima tocca la lampada, la lampada si accende.
 */
export function Fortino3D({ interattivo }: { interattivo: boolean }) {
  const partita = useMondo((s) => s.partita)
  return <Partita key={partita} partita={partita} interattivo={interattivo} />
}

function Partita({ partita, interattivo }: { partita: number; interattivo: boolean }) {
  // il fortino salvato si ritrova solo alla prima partita della visita: "ricomincia" riparte da zero
  const [salvato] = useState<CuscinoSalvato[] | null>(() => (partita === 0 ? progressiOra().fortino : null))
  const cuscini = useMemo(() => sequenza(CUSCINI, partita * 7919 + 13), [partita])
  const [lasciati, setLasciati] = useState(0)
  const [inMano, setInMano] = useState(!salvato)
  const [accesa, setAccesa] = useState(!!salvato)
  // dove compare ogni cuscino: fissato alla nascita, così il render non lo sposta più
  const [nascite, setNascite] = useState<[number, number, number][]>([[0.35, 1.1, 0.25]])

  const corpi = useRef<(RapierRigidBody | null)[]>([])
  const mano = useRef({ x: 0.35, z: 0.25, y: 1.1, q: new THREE.Quaternion() })
  const attesa = useRef<{ da: number; fermoDa: number } | null>(null)
  // camera e tela si leggono al momento (dentro gli effetti), non si catturano dal render
  const leggiTre = useThree((s) => s.get)
  const imposta = useMondo((s) => s.imposta)

  useEffect(() => {
    imposta(salvato ? { fase: 'completo', rimasti: 0 } : { fase: 'gioco', rimasti: CUSCINI })
    vivo.cima = 0
  }, [salvato, imposta])

  const lascia = useCallback(() => {
    if (!inMano) return
    const b = corpi.current[lasciati]
    if (b) {
      // il cuscino parte esattamente da dove lo si vede adesso sopra il punto indicato
      const m = mano.current
      const t = b.translation()
      b.setTranslation({ x: m.x, y: t.y, z: m.z }, true)
      // da cinematico a dinamico subito, senza aspettare il render: parte da fermo
      b.setBodyType(0, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      b.setAngvel({ x: 0, y: 0, z: 0 }, true)
      for (let k = 0; k < b.numColliders(); k++) b.collider(k).setCollisionGroups(GRUPPO_TUTTI)
    }
    setInMano(false)
    setLasciati((n) => n + 1)
    attesa.current = { da: performance.now(), fermoDa: 0 }
    useMondo.getState().imposta({ rimasti: CUSCINI - lasciati - 1 })
  }, [inMano, lasciati])

  // ---------------------------------------------------------------- comandi
  useEffect(() => {
    if (!interattivo || !inMano) return
    const { camera, gl } = leggiTre()
    const tela = gl.domElement
    let tocco: { id: number; x: number; y: number; t: number; mosso: boolean; px: number; py: number } | null = null

    /** Il puntatore sul piano della cima: si indica dove atterrare, il cuscino sta sopra quel punto */
    const colpisci = (cx: number, cy: number, out: THREE.Vector3) => {
      const r = tela.getBoundingClientRect()
      _ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
      _ray.setFromCamera(_ndc, camera)
      _piano.constant = -vivo.cima
      return _ray.ray.intersectPlane(_piano, out)
    }
    const porta = (x: number, z: number) => {
      const d = Math.hypot(x, z)
      const k = d > RAGGIO_MANO ? RAGGIO_MANO / d : 1
      mano.current.x = x * k
      mano.current.z = z * k
    }
    const a = new THREE.Vector3()
    const b = new THREE.Vector3()

    const giu = (e: PointerEvent) => {
      if (e.button !== 0) return
      tocco = { id: e.pointerId, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t: performance.now(), mosso: false }
      try {
        tela.setPointerCapture(e.pointerId)
      } catch {
        /* già catturato */
      }
    }
    const muovi = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !tocco) {
        // col mouse il cuscino sta sotto al puntatore
        if (colpisci(e.clientX, e.clientY, a)) porta(a.x, a.z)
        return
      }
      if (!tocco || tocco.id !== e.pointerId) return
      if (Math.hypot(e.clientX - tocco.x, e.clientY - tocco.y) > 8) tocco.mosso = true
      if (e.pointerType === 'mouse') {
        if (colpisci(e.clientX, e.clientY, a)) porta(a.x, a.z)
      } else if (colpisci(tocco.px, tocco.py, a) && colpisci(e.clientX, e.clientY, b)) {
        // col dito si trascina di quanto ci si sposta: il dito non copre il cuscino
        porta(mano.current.x + (b.x - a.x) * 1.15, mano.current.z + (b.z - a.z) * 1.15)
      }
      tocco.px = e.clientX
      tocco.py = e.clientY
    }
    const su = (e: PointerEvent) => {
      if (!tocco || tocco.id !== e.pointerId) return
      const breve = performance.now() - tocco.t < 350
      // un tocco secco lascia il cuscino; col mouse anche il clic dopo averlo trascinato
      if (e.pointerType === 'mouse') {
        // col mouse si lascia dove si clicca
        if (colpisci(e.clientX, e.clientY, a)) porta(a.x, a.z)
        lascia()
      } else if (!tocco.mosso && breve) lascia()
      tocco = null
    }
    const annulla = () => {
      tocco = null
    }
    let ultimaRotella = 0
    const rotella = (e: WheelEvent) => {
      e.preventDefault()
      const ora = performance.now()
      if (ora - ultimaRotella < 140) return
      ultimaRotella = ora
      useMondo.getState().gira(e.deltaY > 0 ? 1 : -1)
    }
    const tasto = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      const s = useMondo.getState()
      // frecce relative alla camera: "su" allontana dallo spettatore
      const avanti = new THREE.Vector3()
      camera.getWorldDirection(avanti)
      avanti.y = 0
      avanti.normalize()
      const destra = new THREE.Vector3(-avanti.z, 0, avanti.x)
      const passo = 0.12
      const m = mano.current
      switch (e.key) {
        case 'ArrowUp':
          porta(m.x + avanti.x * passo, m.z + avanti.z * passo)
          break
        case 'ArrowDown':
          porta(m.x - avanti.x * passo, m.z - avanti.z * passo)
          break
        case 'ArrowLeft':
          porta(m.x - destra.x * passo, m.z - destra.z * passo)
          break
        case 'ArrowRight':
          porta(m.x + destra.x * passo, m.z + destra.z * passo)
          break
        case 'q':
        case 'Q':
          s.gira(-1)
          break
        case 'e':
        case 'E':
          s.gira(1)
          break
        case 'z':
        case 'Z':
          s.alza()
          break
        case ' ':
        case 'Enter':
          if (e.target !== document.body && e.target !== tela) return
          lascia()
          break
        default:
          return
      }
      e.preventDefault()
    }

    tela.addEventListener('pointerdown', giu)
    window.addEventListener('pointermove', muovi)
    window.addEventListener('pointerup', su)
    window.addEventListener('pointercancel', annulla)
    tela.addEventListener('wheel', rotella, { passive: false })
    window.addEventListener('keydown', tasto)
    tela.style.cursor = 'grab'
    return () => {
      tela.removeEventListener('pointerdown', giu)
      window.removeEventListener('pointermove', muovi)
      window.removeEventListener('pointerup', su)
      window.removeEventListener('pointercancel', annulla)
      tela.removeEventListener('wheel', rotella)
      window.removeEventListener('keydown', tasto)
      tela.style.cursor = ''
    }
  }, [interattivo, inMano, leggiTre, lascia])

  // ----------------------------------------------------------------- ciclo
  useFrame((stato, dt) => {
    const ora = performance.now()
    const mondo = useMondo.getState()

    // la cima del fortino: il punto più alto dei cuscini lasciati
    let cima = 0
    let tuttiFermi = true
    let sulTappeto = 0
    for (let i = 0; i < lasciati; i++) {
      const b = corpi.current[i]
      if (!b) continue
      const t = b.translation()
      const r = b.rotation()
      _q.set(r.x, r.y, r.z, r.w)
      cima = Math.max(cima, t.y + mezzaAltezza(cuscini[i], _q))
      if (Math.hypot(t.x, t.z) < RAGGIO_TAPPETO) sulTappeto++
      if (!b.isSleeping()) {
        const lv = b.linvel()
        const av = b.angvel()
        if (Math.hypot(lv.x, lv.y, lv.z) > FERMO_LIN || Math.hypot(av.x, av.y, av.z) > FERMO_ANG) tuttiFermi = false
      }
    }
    vivo.cima += (cima - vivo.cima) * Math.min(1, dt * 3)

    // il cuscino in mano: segue il puntatore, sospeso sopra la cima
    if (inMano) {
      const b = corpi.current[lasciati]
      const m = mano.current
      rotazioneMano(mondo.giro, mondo.inPiedi, _q)
      m.q.slerp(_q, Math.min(1, dt * 12))
      const yObiettivo = Math.max(0.6, cima + SOSPESO) + mezzaAltezza(cuscini[lasciati], m.q)
      m.y += (yObiettivo - m.y) * Math.min(1, dt * 6)
      if (b) {
        const t = b.translation()
        const k = Math.min(1, dt * 14)
        _v.set(t.x + (m.x - t.x) * k, m.y + Math.sin(stato.clock.elapsedTime * 2.1) * 0.012, t.z + (m.z - t.z) * k)
        b.setNextKinematicTranslation(_v)
        b.setNextKinematicRotation(m.q)
      }
    }

    // dopo averlo lasciato: si aspetta che tutto si fermi
    const a = attesa.current
    if (!a) return
    if (tuttiFermi) {
      if (!a.fermoDa) a.fermoDa = ora
    } else a.fermoDa = 0
    const fermo = a.fermoDa && ora - a.fermoDa > ATTESA_FERMO_MS
    if (!fermo && ora - a.da < ATTESA_MAX_MS) return
    attesa.current = null

    if (fortinoRegge(cima, tuttiFermi, sulTappeto)) {
      setAccesa(true)
      mondo.imposta({ fase: 'completo', rimasti: 0 })
      salvaFortino(
        cuscini.slice(0, lasciati).flatMap((c, i) => {
          const b = corpi.current[i]
          if (!b) return []
          const t = b.translation()
          const r = b.rotation()
          return [{ forma: c.forma, stoffa: c.stoffa, p: [t.x, t.y, t.z], q: [r.x, r.y, r.z, r.w] } as CuscinoSalvato]
        }),
      )
      return
    }
    if (lasciati >= CUSCINI) {
      mondo.imposta({ fase: 'finiti' })
      return
    }
    // il prossimo cuscino compare dove si era lasciato l'ultimo, un po' più su
    const m = mano.current
    m.y = Math.max(m.y, cima + SOSPESO + 0.4)
    setNascite((n) => [...n, [m.x, m.y, m.z]])
    setInMano(true)
  })

  if (salvato) {
    return (
      <>
        {salvato.map((c, i) => (
          <CorpoCuscino key={i} dati={{ id: i, forma: c.forma, stoffa: c.stoffa }} tipo="fixed" posizione={c.p} rotazione={c.q} />
        ))}
        <Lampada accesa filo={interattivo} />
      </>
    )
  }

  const visibili = inMano ? lasciati + 1 : lasciati
  return (
    <>
      {cuscini.slice(0, visibili).map((c, i) => (
        <CorpoCuscino
          key={c.id}
          ref={(b) => {
            corpi.current[i] = b
          }}
          dati={c}
          tipo={i < lasciati ? 'dynamic' : 'kinematicPosition'}
          posizione={nascite[i] ?? nascite[nascite.length - 1]}
          nascosto={i >= lasciati && !interattivo}
        />
      ))}
      <Lampada accesa={accesa} filo={interattivo} />
    </>
  )
}

/**
 * Quando il fortino è "chiuso" e la lampada si accende. Si chiama solo quando
 * l'ultimo cuscino lasciato si è fermato (o dopo ATTESA_MAX_MS).
 * Tre condizioni insieme:
 * - la cima arriva alla lampada;
 * - è tutto fermo: se qualcosa scivola ancora, il fortino non regge;
 * - sul tappeto ci sono almeno MINIMO_SUL_TAPPETO cuscini: due cuscini in piedi
 *   uno sull'altro toccherebbero la lampada, ma sono una torre, non un rifugio.
 *   Con 12 cuscini restano margini per sbagliare (quelli caduti fuori non contano).
 */
function fortinoRegge(cima: number, tuttiFermi: boolean, sulTappeto: number): boolean {
  return tuttiFermi && cima >= ALTEZZA_LAMPADA && sulTappeto >= MINIMO_SUL_TAPPETO
}
