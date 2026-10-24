'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
import { RAGGIO_TAPPETO } from './regole'
import { texturaPavimento, texturaTappeto } from './tessuti'

export const BIANCO = '#F3F1EC'
const ALTEZZA_TAPPETO = 0.012

/**
 * La stanza bianca senza pareti: pavimento a piastrelle enormi che sfuma
 * nella nebbia, luce dall'alto come in uno studio fotografico, il tappeto.
 */
export function Stanza() {
  const pavimento = useMemo(() => {
    const t = texturaPavimento()
    t.repeat.set(60, 60)
    return t
  }, [])
  const tappeto = useMemo(() => texturaTappeto(), [])

  return (
    <>
      <color attach="background" args={[BIANCO]} />
      <fog attach="fog" args={[BIANCO, 14, 42]} />
      <hemisphereLight args={['#ffffff', '#d9cfbd', 0.32]} />
      {/* luce quasi a picco: l'ombra cade sotto il cuscino e dice dove atterrerà */}
      <directionalLight
        position={[0.9, 9, 1.3]}
        intensity={2.7}
        color="#fff8ee"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
      />
      {/* riflessi morbidi sui tessuti: softbox bianchi, niente HDRI da scaricare */}
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 2, -2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#ffd9a8" position={[0, 1, 7]} scale={[10, 3, 1]} />
      </Environment>

      <RigidBody type="fixed" colliders={false}>
        {/* pavimento spesso due metri: niente può attraversarlo */}
        {/* la superficie fisica coincide col sopra del tappeto: i cuscini ci si appoggiano, non ci affondano */}
        <CuboidCollider args={[40, 2, 40]} position={[0, -2 + ALTEZZA_TAPPETO, 0]} friction={1.4} restitution={0} />
      </RigidBody>

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={pavimento} color="#ebe9e5" roughness={0.85} metalness={0} />
      </mesh>

      <mesh position-y={ALTEZZA_TAPPETO / 2} receiveShadow>
        <cylinderGeometry args={[RAGGIO_TAPPETO, RAGGIO_TAPPETO, ALTEZZA_TAPPETO, 96]} />
        <meshStandardMaterial map={tappeto} roughness={1} />
      </mesh>
    </>
  )
}
