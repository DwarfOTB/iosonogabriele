'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ALTEZZA_LAMPADA } from './regole'

const CALDA = new THREE.Color('#FFB85C')
const SPENTA = new THREE.Color('#d8d4cc')

/**
 * La lampadina che pende dal nulla sopra al tappeto: è il traguardo.
 * Spenta finché il fortino non ci arriva, poi si accende e scalda la stanza.
 */
export function Lampada({ accesa, filo: conFilo = true }: { accesa: boolean; filo?: boolean }) {
  const gruppo = useRef<THREE.Group>(null)
  const vetro = useRef<THREE.MeshStandardMaterial>(null)
  const luce = useRef<THREE.PointLight>(null)
  const bagliore = useRef<THREE.SpriteMaterial>(null)
  const livello = useRef(0)

  useFrame((stato, dt) => {
    const t = stato.clock.elapsedTime
    // oscilla appena, come appesa a un filo lunghissimo
    if (gruppo.current) {
      gruppo.current.rotation.z = Math.sin(t * 0.7) * 0.012
      gruppo.current.rotation.x = Math.sin(t * 0.53 + 1) * 0.01
    }
    const obiettivo = accesa ? 1 : 0
    // accensione con un paio di sfarfallii, spegnimento morbido
    livello.current += (obiettivo - livello.current) * Math.min(1, dt * (accesa ? 2.2 : 4))
    let l = livello.current
    if (accesa && l < 0.9) l *= 0.75 + 0.25 * Math.sin(t * 47) * Math.sin(t * 13)
    if (vetro.current) {
      vetro.current.emissiveIntensity = l * 6
      vetro.current.color.copy(SPENTA).lerp(CALDA, l)
    }
    if (luce.current) luce.current.intensity = l * 9
    if (bagliore.current) bagliore.current.opacity = l * 0.9
  })

  const yBulbo = ALTEZZA_LAMPADA + 0.32
  const filo = 6
  // il filo sparisce salendo: pende dal nulla, non da un soffitto
  const sfuma = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0, '#000')
    grad.addColorStop(0.7, '#fff')
    g.fillStyle = grad
    g.fillRect(0, 0, 4, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  const alone = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,214,150,1)')
    grad.addColorStop(0.25, 'rgba(255,190,110,0.45)')
    grad.addColorStop(1, 'rgba(255,170,90,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  return (
    <group ref={gruppo} position={[0, yBulbo + filo, 0]}>
      <mesh position-y={-filo / 2} visible={conFilo}>
        <cylinderGeometry args={[0.005, 0.005, filo, 6]} />
        <meshBasicMaterial color="#1B1A1F" alphaMap={sfuma} transparent depthWrite={false} />
      </mesh>
      {/* portalampada in ottone */}
      <mesh position-y={-filo + 0.05} castShadow>
        <cylinderGeometry args={[0.028, 0.032, 0.09, 24]} />
        <meshStandardMaterial color="#b08a4a" metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh position-y={-filo - 0.05}>
        <sphereGeometry args={[0.07, 32, 24]} />
        <meshStandardMaterial ref={vetro} color={SPENTA} emissive={CALDA} emissiveIntensity={0} roughness={0.15} />
      </mesh>
      <sprite position-y={-filo - 0.05} scale={0.55}>
        <spriteMaterial ref={bagliore} map={alone} blending={THREE.AdditiveBlending} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </sprite>
      <pointLight ref={luce} position-y={-filo - 0.12} color="#FFB061" intensity={0} distance={7} decay={1.6} />
    </group>
  )
}
