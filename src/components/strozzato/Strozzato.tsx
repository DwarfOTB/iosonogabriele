'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type Ref,
} from 'react'
import {
  type Molla,
  type ParametriLettera,
  echi,
  elettrico,
  parametriLettera,
  passoMolla,
  spaziatura,
  staRimbalzando,
  tensioneTenuta,
  trasformaLettera,
} from './fisica'

export interface StrozzatoHandle {
  /** Strozza al massimo e sfuma: da usare prima di cambiare pagina */
  strozza: () => Promise<void>
  /** Annulla `strozza()`: il titolo torna visibile e a riposo (es. tornando indietro) */
  riprendi: () => void
  /** Tensione attuale */
  tensione: () => number
}

export interface StrozzatoProps {
  testo: string
  as?: 'h1' | 'h2' | 'p' | 'span' | 'div'
  className?: string
  style?: CSSProperties
  /** Si può tenere premuto per strozzarlo (default sì) */
  interattivo?: boolean
  /** Ogni 7 secondi ha da solo un piccolo spasmo: dice "toccami" senza scriverlo */
  spasmo?: boolean
  /** Entra già strozzato e si rilascia: l'altra metà della transizione tra pagine */
  entraStrozzato?: boolean
  /** Chiamato al rilascio con la tensione massima raggiunta durante la presa */
  onRilascio?: (piccoTensione: number) => void
  /** Chiamato a ogni fotogramma con la tensione (per chi deve seguirla, es. un'anteprima) */
  onTensione?: (T: number) => void
}

const attendi = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Testo che si strozza. Tenendolo premuto si allunga, si stringe, trema a
 * scatti, i bordi si elettrizzano e compaiono gli echi. Al rilascio torna
 * giù con un rimbalzo. Un tocco veloce su una lettera la schiaccia come un cuscino.
 */
export const Strozzato = forwardRef<StrozzatoHandle, StrozzatoProps>(function Strozzato(
  {
    testo,
    as = 'h1',
    className,
    style,
    interattivo = true,
    spasmo = false,
    entraStrozzato = false,
    onRilascio,
    onTensione,
  },
  ref,
) {
  // un solo tipo per il JSX: i tag ammessi hanno tutti gli stessi attributi usati qui
  const Tag = as as 'h1'
  const idFiltro = 'elettrico-' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const el = useRef<HTMLElement>(null)
  const turb = useRef<SVGFETurbulenceElement>(null)
  const disp = useRef<SVGFEDisplacementMapElement>(null)
  const lettere = useRef<(HTMLSpanElement | null)[]>([])
  const parametri = useRef<ParametriLettera[]>([])

  const stato = useRef({
    molla: { T: entraStrozzato ? 1.05 : 0, v: 0 } as Molla,
    tenuto: false,
    t0: 0,
    y0: 0,
    dy: 0,
    forzata: null as number | null,
    hover: false,
    elettricoAcceso: false,
    sporco: true,
    picco: 0,
    toccata: null as ParametriLettera | null,
    ridotto: false,
    seme: 1,
    sfuma: null as Animation | null,
  })

  const caratteri = Array.from(testo)
  if (parametri.current.length !== caratteri.length) {
    parametri.current = caratteri.map((_, i) => parametriLettera(i))
    lettere.current.length = caratteri.length
  }

  // callback sempre aggiornate senza riavviare il ciclo
  const cb = useRef({ onRilascio, onTensione })
  cb.current = { onRilascio, onTensione }

  useEffect(() => {
    stato.current.sporco = true
  }, [testo])

  useEffect(() => {
    const s = stato.current
    s.ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ultimo = performance.now()
    let raf = 0

    const ciclo = (ora: number) => {
      const dt = Math.min(0.05, (ora - ultimo) / 1000)
      ultimo = ora
      const spasmoOra = spasmo && !s.ridotto && ora % 7000 < 420 ? 0.24 : 0
      const obiettivo =
        s.forzata != null
          ? s.forzata
          : s.tenuto
            ? tensioneTenuta(ora - s.t0, -s.dy)
            : Math.max(s.hover ? 0.08 : 0, spasmoOra)

      s.molla = passoMolla(s.molla, obiettivo, dt, s.tenuto || s.forzata != null)
      const T = s.molla.T
      if (s.tenuto) s.picco = Math.max(s.picco, T)

      const rimbalzo = parametri.current.some((p) => staRimbalzando(p, ora))
      if (s.sporco || rimbalzo || Math.abs(T) > 0.002 || Math.abs(s.molla.v) > 0.002) {
        s.sporco = false
        const nodo = el.current
        if (nodo) {
          const e = elettrico(T)
          if (e.attivo !== s.elettricoAcceso) {
            nodo.style.filter = e.attivo ? `url(#${idFiltro})` : ''
            s.elettricoAcceso = e.attivo
          }
          if (e.attivo) {
            turb.current?.setAttribute('baseFrequency', e.frequenza.toFixed(3))
            disp.current?.setAttribute('scale', e.scala.toFixed(2))
          }
          nodo.style.letterSpacing = spaziatura(T).toFixed(3) + 'em'
          const ombre = echi(T).map(
            (o) =>
              `0 ${o.dy.toFixed(3)}em 0 color-mix(in srgb, var(--${o.colore}) ${Math.round(o.alfa * 100)}%, transparent)`,
          )
          nodo.style.textShadow = ombre.length ? ombre.join(',') : 'none'
        }
        lettere.current.forEach((sp, i) => {
          const p = parametri.current[i]
          if (!sp || !p) return
          const t = trasformaLettera(T, i, ora, p, s.ridotto)
          sp.style.transform = `translate(${t.tx.toFixed(3)}em,${t.ty.toFixed(3)}em) scale(${t.sx.toFixed(3)},${t.sy.toFixed(3)})`
        })
        cb.current.onTensione?.(T)
      }
      if (!s.ridotto && s.elettricoAcceso) {
        const q = (Math.floor(ora / 125) % 3) + 1
        if (q !== s.seme) {
          s.seme = q
          turb.current?.setAttribute('seed', String(q))
        }
      }
      raf = requestAnimationFrame(ciclo)
    }
    raf = requestAnimationFrame(ciclo)
    return () => cancelAnimationFrame(raf)
  }, [idFiltro, spasmo])

  // tornando indietro dalla bfcache il titolo potrebbe essere rimasto strozzato e invisibile
  useEffect(() => {
    const suPageshow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      const s = stato.current
      s.forzata = null
      s.sfuma?.cancel()
      s.sfuma = null
      s.sporco = true
    }
    window.addEventListener('pageshow', suPageshow)
    return () => window.removeEventListener('pageshow', suPageshow)
  }, [])

  const premi = useCallback((y: number) => {
    const s = stato.current
    s.tenuto = true
    s.t0 = performance.now()
    s.y0 = y
    s.dy = 0
    s.picco = 0
  }, [])

  const rilascia = useCallback(() => {
    const s = stato.current
    if (!s.tenuto) return
    s.tenuto = false
    const durata = performance.now() - s.t0
    if (durata < 180 && s.toccata) s.toccata.tocco = performance.now()
    else cb.current.onRilascio?.(s.picco)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      async strozza() {
        const s = stato.current
        if (s.ridotto) return
        s.forzata = 1
        await attendi(260)
        const nodo = el.current
        if (nodo) {
          const a = nodo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' })
          s.sfuma = a
          try {
            await a.finished
          } catch {
            /* annullata da riprendi() */
          }
        }
      },
      riprendi() {
        const s = stato.current
        s.forzata = null
        s.sfuma?.cancel()
        s.sfuma = null
        s.sporco = true
      },
      tensione: () => stato.current.molla.T,
    }),
    [],
  )

  const eventi = interattivo
    ? {
        tabIndex: 0,
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          e.preventDefault()
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            /* evento sintetico: niente cattura */
          }
          const i = Number((e.target as HTMLElement).closest<HTMLElement>('[data-i]')?.dataset.i)
          stato.current.toccata = Number.isFinite(i) ? (parametri.current[i] ?? null) : null
          premi(e.clientY)
        },
        onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
          if (stato.current.tenuto) stato.current.dy = e.clientY - stato.current.y0
        },
        onPointerUp: rilascia,
        onPointerCancel: rilascia,
        onLostPointerCapture: rilascia,
        onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
          if (e.pointerType === 'mouse') stato.current.hover = true
        },
        onPointerLeave: () => {
          stato.current.hover = false
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault()
            stato.current.toccata = null
            premi(0)
          }
        },
        onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === ' ' || e.key === 'Enter') rilascia()
        },
      }
    : {}

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id={idFiltro} x="-6%" y="-40%" width="112%" height="150%">
          <feTurbulence ref={turb} type="turbulence" baseFrequency="0.05" numOctaves={1} seed={1} />
          <feDisplacementMap ref={disp} in="SourceGraphic" scale={2} />
        </filter>
      </svg>
      <Tag
        ref={el as Ref<HTMLHeadingElement>}
        className={className}
        aria-label={testo}
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 900,
          fontVariationSettings: '"wdth" 62',
          lineHeight: 0.8,
          whiteSpace: 'nowrap',
          margin: 0,
          paddingTop: '0.72em',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: interattivo ? 'none' : undefined,
          cursor: interattivo ? 'grab' : undefined,
          outlineOffset: 8,
          ...style,
        }}
        {...eventi}
      >
        {caratteri.map((c, i) => (
          <span
            key={i}
            data-i={i}
            aria-hidden="true"
            ref={(n) => {
              lettere.current[i] = n
            }}
            style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
          >
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </Tag>
    </>
  )
})
