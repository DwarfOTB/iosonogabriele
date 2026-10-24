'use client'

import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody, interactionGroups, type RapierRigidBody } from '@react-three/rapier'
import { forwardRef, useRef } from 'react'
import * as THREE from 'three'
import { MISURE, geometriaCuscino, type Cuscino } from './cuscini'
import { FINITURE, tessuto, type Stoffa } from './tessuti'

/** Il cuscino in mano non tocca niente: non deve spingere il fortino mentre lo sposti */
export const GRUPPO_MANO = interactionGroups(1, [])
export const GRUPPO_TUTTI = interactionGroups(0, [0, 1])

const materiali = new Map<Stoffa, THREE.MeshPhysicalMaterial>()

function materiale(stoffa: Stoffa): THREE.MeshPhysicalMaterial {
  const fatto = materiali.get(stoffa)
  if (fatto) return fatto
  const { map, bump } = tessuto(stoffa)
  const f = FINITURE[stoffa]
  const m = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap: bump,
    bumpScale: f.rilievo * 40,
    roughness: f.roughness,
    sheen: f.sheen,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(f.sheenColor),
  })
  materiali.set(stoffa, m)
  return m
}

interface Props {
  dati: Cuscino
  tipo: 'kinematicPosition' | 'dynamic' | 'fixed'
  posizione: [number, number, number]
  rotazione?: [number, number, number, number]
  /** Il cuscino in mano non si vede fuori dal fortino (nell'atrio resterebbe sospeso a mezz'aria) */
  nascosto?: boolean
}

/**
 * Un cuscino con la sua fisica. Rimbalzo quasi nullo e attrito alto: si
 * appoggia invece di scivolare. All'impatto si schiaccia (solo a vista).
 */
export const CorpoCuscino = forwardRef<RapierRigidBody, Props>(function CorpoCuscino(
  { dati, tipo, posizione, rotazione, nascosto = false },
  ref,
) {
  const pelle = useRef<THREE.Mesh>(null)
  const [w, h, d] = MISURE[dati.forma]
  const molla = useRef({ s: 0, v: 0 })

  useFrame((_, dt) => {
    const m = molla.current
    if (Math.abs(m.s) < 1e-4 && Math.abs(m.v) < 1e-4) return
    const h = Math.min(dt, 1 / 30)
    // smorzamento critico: si schiaccia e torna, senza ballare
    m.v += (-220 * m.s - 30 * m.v) * h
    m.s += m.v * h
    const p = pelle.current
    if (p) p.scale.set(1 + m.s * 0.5, 1 - m.s, 1 + m.s * 0.5)
  })

  return (
    <RigidBody
      ref={ref}
      type={tipo}
      colliders={false}
      ccd
      position={posizione}
      quaternion={rotazione}
      linearDamping={0.6}
      angularDamping={2.4}
      onCollisionEnter={({ target }) => {
        const v = target.rigidBody?.linvel()
        if (!v) return
        const urto = Math.min(0.14, Math.hypot(v.x, v.y, v.z) * 0.05)
        if (urto > 0.015) molla.current.v += urto * 9
      }}
    >
      {/*
        Collisione a scatola, non a forma di cuscino: il fondo bombato faceva
        dondolare i cuscini come una barca. Un cuscino vero sotto il peso si
        appiattisce, quindi la scatola un po' più bassa del centro è più vera.
      */}
      <CuboidCollider args={[(w / 2) * 0.94, (h / 2) * 0.86, (d / 2) * 0.94]} friction={1.25}
        restitution={0.02}
        collisionGroups={tipo === 'kinematicPosition' ? GRUPPO_MANO : GRUPPO_TUTTI}
      />
      <mesh ref={pelle} visible={!nascosto} geometry={geometriaCuscino(dati.forma)} material={materiale(dati.stoffa)} castShadow receiveShadow />
    </RigidBody>
  )
})
