'use client'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import s from './Hotspot.module.css'

interface HotspotProps {
  position: [number, number, number]
  onActivate: () => void
  label: string
}

// Pulsing touch affordance anchored to an interactive 3D object.
// Visible only on touch/coarse-pointer devices (hidden on desktop hover) so
// mobile users can discover & tap small clickable objects.
export function Hotspot({ position, onActivate, label }: HotspotProps) {
  return (
    <Html position={position} center zIndexRange={[120, 0]} className={s.wrap}>
      <button
        className={s.dot}
        aria-label={label}
        onClick={(e) => { e.stopPropagation(); onActivate() }}
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
      >
        <span className={s.pulse} />
        +
      </button>
    </Html>
  )
}

// Helper for room components: build the R3F click handler reuse.
export type HotspotActivate = (e?: ThreeEvent<MouseEvent>) => void
