'use client'

import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Fortino3D } from './Fortino3D'
import { Porte3D } from './Porte3D'
import { Regia } from './Regia'
import { useMondo } from './stato'
import { Stanza } from './Stanza'

/**
 * La scena: una stanza, una camera, il fortino e le porte. Resta montata
 * cambiando pagina; quando la pagina non la usa si ferma (frameloop "never").
 */
export default function Scena({ percorso, attiva }: { percorso: string; attiva: boolean }) {
  const [dpr, setDpr] = useState(1.25)

  // cambiando pagina la porta aperta si richiude (tornando indietro la camera esce dal vano)
  useEffect(() => {
    useMondo.getState().imposta({ portaAperta: null })
  }, [percorso])

  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={dpr}
      frameloop={attiva ? 'always' : 'never'}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      camera={{ fov: 38, near: 0.1, far: 80, position: [0, 3.2, 9] }}
    >
      <Suspense fallback={null}>
        {/* passo fisso: dopo uno scatto lento la fisica recupera a piccoli passi invece di fare un salto che attraversa il pavimento */}
        <Physics gravity={[0, -9.81, 0]} paused={!attiva || percorso !== '/fortino'} timeStep={1 / 60}>
          <Stanza />
          <Fortino3D interattivo={attiva && percorso === '/fortino'} />
        </Physics>
        <Porte3D visibili={attiva && percorso !== '/fortino'} />
        <Regia percorso={percorso} />
        {/* se la GPU fatica si abbassa la risoluzione, se respira si rialza */}
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      </Suspense>
    </Canvas>
  )
}
