/**
 * La fotocamera dentro la pagina: il flusso dal vivo nella storia e lo scatto
 * di un fotogramma. Si spegne da sola quando non serve (foto scelta, pagina
 * nascosta, uscita): la lucina della fotocamera non resta accesa.
 * Niente rete: il video non lascia mai il telefono.
 */
'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { fotoDaVideo, type Foto } from './foto'

export type Lato = 'user' | 'environment'

/**
 * spenta: non serve (o pagina nascosta) · apre: si chiede il flusso (o è
 * sospeso: una chiamata, un'altra app) · viva: si vede · ferma: c'è, ma il
 * browser vuole un tocco per farla partire · negata: permesso rifiutato ·
 * occupata: la usa un'altra app · assente: niente fotocamera usabile
 */
export type StatoFotocamera = 'spenta' | 'apre' | 'viva' | 'ferma' | 'negata' | 'occupata' | 'assente'

type Esito = { stato: Exclude<StatoFotocamera, 'spenta' | 'apre'>; specchio: boolean }

const nome = (e: unknown) => (e as { name?: unknown } | null)?.name

function suVisibilita(avvisa: () => void) {
  document.addEventListener('visibilitychange', avvisa)
  return () => document.removeEventListener('visibilitychange', avvisa)
}

/** In background iOS spegne comunque la fotocamera: si chiude prima noi e si riapre al ritorno */
const useVisibile = () =>
  useSyncExternalStore(
    suVisibilita,
    () => document.visibilityState === 'visible',
    () => false,
  )

const attendi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function apri(lato: Lato, ritenta = true): Promise<MediaStream> {
  const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined
  // senza HTTPS, o in qualche browser delle app, mediaDevices non c'è proprio
  if (!md?.getUserMedia) throw new DOMException('fotocamera non disponibile', 'NotFoundError')
  const misura = { width: { ideal: 1920 }, height: { ideal: 1080 } }
  try {
    return await md.getUserMedia({ audio: false, video: { ...misura, facingMode: { exact: lato } } })
  } catch (e) {
    // girandola, la fotocamera di prima a volte non è ancora libera: un secondo tentativo poco dopo
    if (ritenta && (nome(e) === 'NotReadableError' || nome(e) === 'AbortError')) {
      await attendi(400)
      return apri(lato, false)
    }
    // le webcam dei computer non dicono da che parte guardano: si prende quella che c'è
    if (nome(e) !== 'OverconstrainedError' && nome(e) !== 'NotFoundError') throw e
    return md.getUserMedia({ audio: false, video: misura })
  }
}

function chiudi(f: MediaStream | null) {
  f?.getTracks().forEach((t) => t.stop())
}

function perche(e: unknown): Esito['stato'] {
  if (nome(e) === 'NotAllowedError' || nome(e) === 'SecurityError') return 'negata'
  if (nome(e) === 'NotReadableError' || nome(e) === 'AbortError') return 'occupata'
  return 'assente'
}

export interface Fotocamera {
  /** Da passare al <video> (muted, playsInline): deve esistere finché la fotocamera è attiva */
  video: RefObject<HTMLVideoElement | null>
  stato: StatoFotocamera
  /** La frontale si mostra a specchio, come in ogni app fotocamera */
  specchio: boolean
  /** Più di una fotocamera: ha senso il bottone per girarla */
  piuDiUna: boolean
  /** Per lo stato "ferma": il tocco che fa partire il video */
  riprendi: () => void
  /** Si richiede la fotocamera da capo (dopo "occupata" o "assente") */
  riprova: () => void
  /** Il fotogramma di adesso, come foto */
  cattura: () => Promise<Foto>
}

export function useFotocamera(attiva: boolean, lato: Lato): Fotocamera {
  const video = useRef<HTMLVideoElement>(null)
  const visibile = useVisibile()
  const [esito, setEsito] = useState<Esito | null>(null)
  const [piuDiUna, setPiuDiUna] = useState(false)
  /** Cambiarlo riapre la fotocamera: "riprova", o un flusso che si è chiuso da solo */
  const [tentativo, setTentativo] = useState(0)
  const accesa = attiva && visibile

  useEffect(() => {
    const v = video.current
    if (!accesa || !v) return
    let viva = true
    let flusso: MediaStream | null = null

    apri(lato).then(
      async (f) => {
        if (!viva) return chiudi(f)
        flusso = f
        const traccia = f.getVideoTracks()[0]
        const specchio = traccia?.getSettings().facingMode !== 'environment'
        if (traccia) {
          // una chiamata o un'altra app la sospende: niente scatti su un fotogramma fermo o nero
          traccia.onmute = () => viva && setEsito(null)
          traccia.onunmute = () => viva && setEsito({ stato: 'viva', specchio })
          // chiusa da fuori (permesso tolto, fotocamera presa da altri): si riapre
          traccia.onended = () => viva && setTentativo((n) => n + 1)
        }
        v.srcObject = f
        try {
          await v.play()
          // ancora sospesa: resta "apre" finché non arriva il primo fotogramma (onunmute)
          if (viva && !traccia?.muted) setEsito({ stato: 'viva', specchio })
        } catch {
          // risparmio energetico su iOS o autoplay bloccato: serve un tocco
          if (viva) setEsito({ stato: 'ferma', specchio })
        }
        // solo dopo il permesso il browser dice quante fotocamere ci sono
        navigator.mediaDevices.enumerateDevices().then(
          (d) => viva && setPiuDiUna(d.filter((x) => x.kind === 'videoinput').length > 1),
          () => {},
        )
      },
      (e) => {
        if (viva) setEsito({ stato: perche(e), specchio: false })
      },
    )

    return () => {
      viva = false
      // prima si ferma la vecchia, poi si apre la nuova: iOS non ne tiene due insieme
      chiudi(flusso)
      v.srcObject = null
      setEsito(null)
    }
  }, [accesa, lato, tentativo])

  const riprendi = useCallback(() => {
    video.current?.play().then(
      () => setEsito((e) => e && { ...e, stato: 'viva' }),
      () => {},
    )
  }, [])

  const riprova = useCallback(() => setTentativo((n) => n + 1), [])

  const specchio = esito?.specchio ?? false
  const cattura = useCallback(() => {
    const v = video.current
    if (!v) return Promise.reject(new Error('fotocamera spenta'))
    return fotoDaVideo(v, specchio)
  }, [specchio])

  const stato: StatoFotocamera = !accesa ? 'spenta' : (esito?.stato ?? 'apre')
  return { video, stato, specchio, piuDiUna, riprendi, riprova, cattura }
}
