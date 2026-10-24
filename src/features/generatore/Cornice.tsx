'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { ASPETTO, blocca, posa, type Foto, type Inquadratura } from './foto'
import s from './Generatore.module.css'

interface CorniceProps {
  foto: Foto | null
  inquadratura: Inquadratura
  onInquadra: (q: Inquadratura) => void
  /** La scritta e i bottoni sopra la foto: dentro elementi con data-presa, che non spostano la foto */
  children?: ReactNode
  /** Cosa c'è senza foto: la fotocamera dal vivo, o il "+" per sceglierne una */
  vuota?: ReactNode
  /** Senza foto si vede la fotocamera: fondo scuro come un mirino, non carta */
  diretta?: boolean
}

/**
 * La storia 9:16 a schermo. Con un dito si sposta la foto, con due (o con la
 * rotella) si ingrandisce. Il titolo sopra resta la presa per strozzare.
 */
export function Cornice({ foto, inquadratura, onInquadra, children, vuota, diretta }: CorniceProps) {
  const box = useRef<HTMLDivElement>(null)
  const dita = useRef(new Map<number, { x: number; y: number }>())
  const ultima = useRef(inquadratura)
  useEffect(() => {
    ultima.current = inquadratura
  }, [inquadratura])

  // la rotella va ascoltata non passiva, sennò la pagina scorre insieme allo zoom
  useEffect(() => {
    const el = box.current
    if (!el || !foto) return
    const suRotella = (e: WheelEvent) => {
      e.preventDefault()
      const q = ultima.current
      onInquadra(blocca(foto, { ...q, z: q.z * Math.exp(-e.deltaY * 0.0015) }))
    }
    el.addEventListener('wheel', suRotella, { passive: false })
    return () => el.removeEventListener('wheel', suRotella)
  }, [foto, onInquadra])

  const p = foto ? posa(foto, inquadratura) : null

  const sposta = (dx: number, dy: number, scala: number) => {
    const el = box.current
    if (!el || !foto) return
    const q = ultima.current
    const { w, h } = posa(foto, q)
    const L = el.clientWidth
    const nuova = blocca(foto, { cx: q.cx - dx / L / w, cy: q.cy - dy / L / h, z: q.z * scala })
    ultima.current = nuova
    onInquadra(nuova)
  }

  return (
    <div
      ref={box}
      className={s.storia}
      data-vuota={(!foto && !diretta) || undefined}
      data-diretta={(!foto && diretta) || undefined}
      onPointerDown={(e) => {
        if (!foto || (e.target as Element).closest('[data-presa]')) return
        e.currentTarget.setPointerCapture(e.pointerId)
        dita.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      }}
      onPointerMove={(e) => {
        const d = dita.current
        const prima = d.get(e.pointerId)
        if (!prima) return
        const ora = { x: e.clientX, y: e.clientY }
        if (d.size === 1) {
          sposta(ora.x - prima.x, ora.y - prima.y, 1)
        } else {
          const altro = [...d.entries()].find(([id]) => id !== e.pointerId)?.[1]
          if (altro) {
            const prima2 = Math.hypot(prima.x - altro.x, prima.y - altro.y)
            const dopo = Math.hypot(ora.x - altro.x, ora.y - altro.y)
            sposta((ora.x - prima.x) / 2, (ora.y - prima.y) / 2, prima2 > 0 ? dopo / prima2 : 1)
          }
        }
        d.set(e.pointerId, ora)
      }}
      onPointerUp={(e) => dita.current.delete(e.pointerId)}
      onPointerCancel={(e) => dita.current.delete(e.pointerId)}
      onLostPointerCapture={(e) => dita.current.delete(e.pointerId)}
    >
      {foto && p ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto locale dal rullino, niente ottimizzazione
        <img
          className={s.immagine}
          src={foto.url}
          alt=""
          draggable={false}
          style={{
            width: `${p.w * 100}%`,
            left: `${p.x * 100}%`,
            top: `${(p.y / ASPETTO) * 100}%`,
          }}
        />
      ) : (
        vuota
      )}
      {children}
    </div>
  )
}
