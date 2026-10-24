'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import s from './Generatore.module.css'

export interface MirinoHandle {
  /** Riempie l'anello con la tensione del titolo (0..1) */
  segui: (T: number) => void
}

interface MirinoProps {
  /** Mostra le due parole "tieni premuto": dopo il primo scatto non servono più */
  parole: boolean
  className?: string
}

/**
 * Il polpastrello disegnato sotto il titolo: preme da solo ogni tanto per dire
 * "tieni premuto", e mentre si strozza l'anello si carica come un otturatore.
 * Non intercetta il tocco: sta dentro l'area del titolo, che resta la presa.
 */
export const Mirino = forwardRef<MirinoHandle, MirinoProps>(function Mirino({ parole, className }, ref) {
  const anello = useRef<SVGCircleElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      segui(T) {
        const a = anello.current
        if (a) a.style.strokeDashoffset = (1 - Math.max(0, Math.min(1, T))).toFixed(3)
      },
    }),
    [],
  )

  return (
    <span className={className ? `${s.mirino} ${className}` : s.mirino}>
      <svg className={s.disco} viewBox="0 0 64 64" aria-hidden="true">
        <circle className={s.cerchio} cx="32" cy="32" r="25" />
        <circle ref={anello} className={s.carica} cx="32" cy="32" r="25" pathLength={1} />
        <circle className={s.onda} cx="32" cy="32" r="9" />
        <circle className={s.polpastrello} cx="32" cy="32" r="9" />
      </svg>
      {parole && <span className={s.dici}>tieni premuto</span>}
    </span>
  )
})
