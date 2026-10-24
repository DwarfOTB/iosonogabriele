'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Strozzato, type StrozzatoHandle } from '@/components/strozzato/Strozzato'
import { TornaPorte } from '@/components/torna/TornaPorte'
import { CAMPAGNA, NOME_ARTISTA } from '@/content/campagna'
import { movimentoRidotto } from '@/lib/casuale'
import { Anteprima, type Scatto } from './Anteprima'
import { Cornice } from './Cornice'
import { puoCondividereFile, useInApp } from './condividi'
import { STORIA, esportaImmagine } from './esporta'
import { parolaBloccata } from './filtro'
import { INQUADRATURA_INIZIALE, caricaFoto, liberaFoto, luceZona, type Foto, type Inquadratura } from './foto'
import { useFotocamera, type Lato } from './fotocamera'
import { Mirino, type MirinoHandle } from './Mirino'
import { misuraEm, stimaEm } from './misura'
import { maiuscola, nomeFile, pulisciParola } from './parola'
import { TINTE, ZONA_SCRITTA } from './tinte'
import s from './Generatore.module.css'

const G = CAMPAGNA.generatore

/** Tensione dello scatto dal bottone */
const T_BOTTONE = 0.8
/** Una presa troppo leggera darebbe un'immagine moscia: sotto la soglia si usa la minima */
const T_SOGLIA = 0.3
const T_MINIMA = 0.55
/** Prima di dire "questa no" si lascia finire la parola (cazzo → cazzotto) */
const ATTESA_AVVISO = 450

/** Tremito "a mano": scatti netti, niente interpolazione */
const SCOSSA: Keyframe[] = [0, -4, 3.5, -3, 2.5, -1.5, 1, 0].map((x, i) => ({
  transform: `translateX(${x}%) rotate(${i % 2 ? 1.2 : -1}deg)`,
  easing: 'steps(1, end)',
}))

/** Ogni quanto si guarda la luce della fotocamera per scegliere la tinta */
const OGNI_LUCE = 800
/** Soglie con isteresi: sul confine la scritta non lampeggia tra bianco e nero */
const LUCE_NERO = 0.64
const LUCE_BIANCO = 0.52

/** Aspetta che la carta vuota sia a schermo prima del lavoro pesante */
const dopoIlDisegno = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)))

const conIndice = (i: number) => ({ '--i': i }) as CSSProperties

/** Copia ridotta del foglio appena disegnato, da mostrare mentre il PNG si codifica */
function copiaBozza(foglio: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.round((STORIA.w * 2) / 3)
  c.height = Math.round((STORIA.h * 2) / 3)
  c.getContext('2d')?.drawImage(foglio, 0, 0, c.width, c.height)
  return c
}

/** Su iOS la memoria dei canvas è poca e il GC li rende tardi: si svuotano a mano */
function svuota(c: HTMLCanvasElement | null) {
  if (!c) return
  c.width = 0
  c.height = 0
}

/**
 * SONO ___. — una fotocamera con il titolo già sopra, come un filtro: scrivi
 * chi sei, tieni premuto il titolo per strozzarlo e al rilascio scatta e
 * diventa una storia 1080×1920. Oppure una foto dalla galleria.
 * Niente rete: video, foto e parola restano sul telefono finché non le condividi tu.
 */
export default function Generatore() {
  const titolo = useRef<StrozzatoHandle>(null)
  const palco = useRef<HTMLDivElement>(null)
  const scossa = useRef<HTMLDivElement>(null)
  const mirino = useRef<MirinoHandle>(null)
  const lampo = useRef<HTMLDivElement>(null)
  const bottone = useRef<HTMLButtonElement>(null)
  const daBottone = useRef(false)
  const occupato = useRef(false)
  const giro = useRef(0)
  const componendo = useRef(false)
  const bozzaViva = useRef<HTMLCanvasElement | null>(null)
  const idCampo = useId()
  const idFoto = useId()
  const fotoViva = useRef<Foto | null>(null)
  const smontato = useRef(false)

  const [grezzo, setGrezzo] = useState('')
  const [scatto, setScatto] = useState<Scatto>({ fase: 'chiuso' })
  const [avvisoPer, setAvvisoPer] = useState<string | null>(null)
  const [imparato, setImparato] = useState(false)
  const [foto, setFoto] = useState<Foto | null>(null)
  const [inquadratura, setInquadratura] = useState<Inquadratura>(INQUADRATURA_INIZIALE)
  const [tinta, setTinta] = useState(0)
  /** Toccato il campione, la tinta non la sceglie più la luce */
  const [tintaScelta, setTintaScelta] = useState(false)
  const [caricando, setCaricando] = useState(false)
  const [lato, setLato] = useState<Lato>('user')
  const inApp = useInApp()
  // senza foto la storia è la fotocamera
  const { video: videoCam, stato: statoCam, specchio, piuDiUna, riprendi, riprova, cattura } = useFotocamera(!foto, lato)
  const diretta = !foto && statoCam === 'viva'
  // mentre si accende (o si gira) il titolo resta: la fotocamera arriva sotto
  const conCamera = !foto && (statoCam === 'viva' || statoCam === 'apre')
  const senzaCamera = !foto && (statoCam === 'negata' || statoCam === 'occupata' || statoCam === 'assente')
  const conTitolo = !!foto || conCamera
  const perche =
    !senzaCamera
      ? ''
      : inApp && statoCam !== 'occupata'
        ? 'Qui dentro la fotocamera non va: apri nel browser ↗ o scegli una foto.'
        : statoCam === 'negata'
          ? 'La fotocamera è bloccata: sbloccala dalle impostazioni del browser, o scegli una foto.'
          : statoCam === 'occupata'
            ? "La fotocamera la sta usando un'altra app: chiudila e riprova, o scegli una foto."
            : 'Qui la fotocamera non si apre: scegli una foto.'

  const parola = pulisciParola(grezzo, G.maxLen)
  const scritta = maiuscola(parola) || G.esempio
  const testo = `${G.prefisso} ${scritta}${G.suffisso}`
  const bloccata = parolaBloccata(parola)
  const avviso = bloccata && avvisoPer === parola
  const aperta = scatto.fase !== 'chiuso'
  // mentre una foto della galleria si apre non si scatta: le due foto si pesterebbero i piedi
  const pronta = (!!foto || diretta) && !caricando

  const scuoti = useCallback(() => {
    const el = scossa.current
    if (!el || movimentoRidotto()) return
    el.animate(SCOSSA, { duration: 440 })
  }, [])

  // la foto vive finché non se ne sceglie un'altra o si esce
  useEffect(
    () => () => {
      smontato.current = true
      liberaFoto(fotoViva.current)
      fotoViva.current = null
    },
    [],
  )

  const scegliFoto = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    setCaricando(true)
    try {
      const nuova = await caricaFoto(file)
      // usciti dalla pagina, o scattato nel frattempo: questa foto non serve più
      if (smontato.current || occupato.current) return liberaFoto(nuova)
      liberaFoto(fotoViva.current)
      fotoViva.current = nuova
      setFoto(nuova)
      setInquadratura(INQUADRATURA_INIZIALE)
      // la tinta che si legge meglio su quella fascia della foto
      if (!tintaScelta) {
        const luce = luceZona(nuova.bitmap, nuova, INQUADRATURA_INIZIALE, ZONA_SCRITTA.y0, ZONA_SCRITTA.y1)
        setTinta(luce > 0.6 ? 1 : 0)
      }
    } catch {
      scuoti()
    } finally {
      setCaricando(false)
    }
  }

  /** Il fuoco su SCATTA quando il bottone toccato sparisce (✕, INQUADRA): non cade sul body */
  const fuocoSuScatta = () => requestAnimationFrame(() => bottone.current?.focus({ preventScroll: true }))

  /** Via la foto: si torna alla fotocamera dal vivo */
  const tornaAllaFotocamera = () => {
    liberaFoto(fotoViva.current)
    fotoViva.current = null
    setFoto(null)
    setInquadratura(INQUADRATURA_INIZIALE)
    fuocoSuScatta()
  }

  // dal vivo la tinta segue la luce della fascia dove cade la scritta, finché non la scegli tu
  useEffect(() => {
    if (!diretta || tintaScelta) return
    const id = window.setInterval(() => {
      const v = videoCam.current
      if (!v?.videoWidth) return
      const luce = luceZona(v, { iw: v.videoWidth, ih: v.videoHeight }, INQUADRATURA_INIZIALE, ZONA_SCRITTA.y0, ZONA_SCRITTA.y1)
      setTinta((t) => (t === 0 && luce > LUCE_NERO ? 1 : t === 1 && luce < LUCE_BIANCO ? 0 : t))
    }, OGNI_LUCE)
    return () => window.clearInterval(id)
  }, [diretta, tintaScelta, videoCam])

  // il titolo deve stare sempre nella foto: si misura la sua larghezza vera in em
  useLayoutEffect(() => {
    const p = palco.current
    const h1 = p?.querySelector('h1')
    if (!p || !h1) return
    let vivo = true
    const misura = () => {
      if (!vivo) return
      const em = misuraEm(testo, getComputedStyle(h1).fontFamily)
      if (em > 0) p.style.setProperty('--em', em.toFixed(4))
    }
    misura()
    document.fonts?.ready.then(misura, () => {})
    // se il font arriva dopo (rete lenta), si rimisura: altrimenti il titolo può uscire dallo schermo
    document.fonts?.addEventListener('loadingdone', misura)
    return () => {
      vivo = false
      document.fonts?.removeEventListener('loadingdone', misura)
    }
  }, [testo, conTitolo])

  // parola bloccata: dopo una pausa il titolo trema forte una volta e compare la ✕
  useEffect(() => {
    if (!bloccata) return
    const t = window.setTimeout(() => {
      setAvvisoPer(parola)
      scuoti()
    }, ATTESA_AVVISO)
    return () => window.clearTimeout(t)
  }, [bloccata, parola, scuoti])

  // l'URL dell'immagine vive quanto l'anteprima
  useEffect(() => {
    if (scatto.fase !== 'pronto') return
    const url = scatto.url
    return () => URL.revokeObjectURL(url)
  }, [scatto])

  // uscendo dalla pagina a metà scatto: l'export in corso non crea URL che nessuno revocherebbe
  useEffect(
    () => () => {
      giro.current++
      svuota(bozzaViva.current)
      bozzaViva.current = null
    },
    [],
  )

  // sotto il foglio la pagina non scorre
  useEffect(() => {
    if (!aperta) return
    const html = document.documentElement
    const prima = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prima
    }
  }, [aperta])

  const scatta = async (Tpicco: number, dalBottone = false) => {
    if (bloccata) {
      setAvvisoPer(parola)
      scuoti()
      return
    }
    const h1 = palco.current?.querySelector('h1')
    if (occupato.current || !h1 || !pronta) return
    occupato.current = true
    daBottone.current = dalBottone
    const id = ++giro.current
    const T = Tpicco < T_SOGLIA ? T_MINIMA : Math.min(1.1, Tpicco)
    // l'istante del rilascio: la fisica del titolo si ferma qui, anche se la cattura chiede qualche ms
    const ora = performance.now()
    const famiglia = getComputedStyle(h1).fontFamily
    const frase = testo
    const nome = nomeFile(G.prefisso, scritta)

    if (!movimentoRidotto()) lampo.current?.animate([{ opacity: 0.92 }, { opacity: 0 }], { duration: 320, easing: 'ease-out' })

    // dal vivo il rilascio è l'otturatore: si ferma questo fotogramma e diventa la foto
    let sorgente = foto
    let q = inquadratura
    if (!sorgente) {
      try {
        sorgente = await cattura()
      } catch {
        if (giro.current === id) occupato.current = false
        scuoti()
        return
      }
      // usciti dalla pagina durante la cattura (nessuno libererebbe la foto), o arrivata una foto dalla galleria
      if (giro.current !== id || fotoViva.current) {
        if (giro.current === id) occupato.current = false
        return liberaFoto(sorgente)
      }
      fotoViva.current = sorgente
      q = INQUADRATURA_INIZIALE
      setFoto(sorgente)
      setInquadratura(q)
    }

    setImparato(true)
    setScatto({ fase: 'disegna', id })

    try {
      await dopoIlDisegno()
      let bozza: HTMLCanvasElement | undefined
      const blob = await esportaImmagine({
        testo: frase,
        foto: sorgente,
        inquadratura: q,
        tinta: TINTE[tinta],
        T,
        famiglia,
        oraMs: ora,
        onBozza: (foglio) => {
          if (giro.current !== id) return
          bozza = copiaBozza(foglio)
          bozzaViva.current = bozza
          setScatto({ fase: 'disegna', id, bozza })
        },
      })
      if (giro.current !== id) return
      const file = new File([blob], nome, { type: 'image/png' })
      setScatto({ fase: 'pronto', id, bozza, url: URL.createObjectURL(blob), file, condivisibile: puoCondividereFile(file) })
    } catch {
      if (giro.current === id) setScatto({ fase: 'errore', id })
    }
  }

  const rifai = useCallback(() => {
    giro.current++
    occupato.current = false
    svuota(bozzaViva.current)
    bozzaViva.current = null
    setScatto({ fase: 'chiuso' })
    // il fuoco torna dov'era, ma senza riaprire la tastiera del telefono
    const dove = daBottone.current ? bottone.current : palco.current?.querySelector('h1')
    requestAnimationFrame(() => dove?.focus({ preventScroll: true }))
  }, [])

  return (
    <div className={s.radice} data-inapp={inApp || undefined}>
      {inApp && (
        <p className={s.striscia}>
          apri nel browser per salvarla <span aria-hidden="true">↗</span>
        </p>
      )}

      <main className={s.pagina} inert={aperta}>
        <header className={s.testa}>
          <TornaPorte />
          <span className={`${s.firma} entra`}>{NOME_ARTISTA}</span>
        </header>

        <div
          ref={palco}
          className={`${s.palco} entra`}
          style={{ ...conIndice(1), '--em': stimaEm(testo).toFixed(4) } as CSSProperties}
        >
          <Cornice
            foto={foto}
            inquadratura={inquadratura}
            onInquadra={setInquadratura}
            diretta={!senzaCamera}
            vuota={
              <>
                {/* sempre montato senza foto: la fotocamera ci attacca il flusso appena c'è */}
                <video
                  ref={videoCam}
                  className={s.video}
                  data-specchio={specchio || undefined}
                  data-viva={statoCam === 'viva' || undefined}
                  muted
                  playsInline
                  autoPlay
                  aria-hidden="true"
                />
                {statoCam === 'apre' && <p className={s.accendo}>accendo la fotocamera…</p>}
                {statoCam === 'ferma' && (
                  <div className={s.centro}>
                    <button
                      type="button"
                      className="bottone"
                      onClick={() => {
                        riprendi()
                        fuocoSuScatta()
                      }}
                    >
                      INQUADRA
                    </button>
                  </div>
                )}
                {senzaCamera && (
                  <div className={s.scegli}>
                    <label htmlFor={idFoto} className={s.piuGrande} aria-busy={caricando || undefined}>
                      <span aria-hidden="true">+</span>
                      <span className={s.nascosto}>Scegli una foto</span>
                    </label>
                    <p className={s.motivo}>{perche}</p>
                    {/* dopo un no il browser non richiede: riprovare serve solo se la fotocamera era occupata o non partita */}
                    {statoCam !== 'negata' && (
                      <button type="button" className="bottone bottone--carta" onClick={riprova}>
                        RIPROVA
                      </button>
                    )}
                  </div>
                )}
              </>
            }
          >
            {foto ? (
              <button
                type="button"
                className={`simbolo ${s.angolo}`}
                data-presa
                aria-label="Torna alla fotocamera"
                onClick={tornaAllaFotocamera}
              >
                ✕
              </button>
            ) : (
              piuDiUna &&
              statoCam !== 'negata' && (
                <button
                  type="button"
                  className={`simbolo ${s.angolo}`}
                  data-presa
                  aria-label="Gira la fotocamera"
                  onClick={() => setLato((l) => (l === 'user' ? 'environment' : 'user'))}
                >
                  ⟲
                </button>
              )
            )}
            {conTitolo && (
              <div
                ref={scossa}
                className={s.scritta}
                data-presa
                style={
                  {
                    '--ink': TINTE[tinta].testo,
                    '--ticking': TINTE[tinta].eco,
                    '--ombra': TINTE[tinta].ombra,
                  } as CSSProperties
                }
              >
                <Strozzato
                  ref={titolo}
                  testo={testo}
                  entraStrozzato
                  spasmo={!aperta && !bloccata}
                  className={s.h1}
                  style={{ fontSize: 'var(--fs)', color: avviso ? 'var(--ink-soft)' : 'var(--ink)' }}
                  onRilascio={(T) => void scatta(T)}
                  onTensione={(T) => mirino.current?.segui(T)}
                />
                {!avviso && <Mirino ref={mirino} parole={!imparato} />}
              </div>
            )}
          </Cornice>
          <input
            id={idFoto}
            className={s.nascosto}
            type="file"
            accept="image/*"
            onChange={(e) => {
              void scegliFoto(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        <div className={s.comandi}>
          <div className={`${s.riga} entra`} style={conIndice(2)}>
            <label htmlFor={idCampo} className={s.nascosto}>
              Scrivi chi sei
            </label>
            <span className={s.fisso} aria-hidden="true">
              {G.prefisso}
            </span>
            <span className={s.campo}>
              <input
                id={idCampo}
                className={s.input}
                type="text"
                value={grezzo}
                placeholder={G.esempio}
                maxLength={G.maxLen}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                enterKeyHint="done"
                aria-invalid={avviso || undefined}
                onChange={(e) => {
                  const v = e.target.value
                  // durante la composizione (tastiere Android, accenti) non si tocca il testo
                  setGrezzo(componendo.current ? v : pulisciParola(v, G.maxLen))
                }}
                onCompositionStart={() => {
                  componendo.current = true
                }}
                onCompositionEnd={(e) => {
                  componendo.current = false
                  setGrezzo(pulisciParola(e.currentTarget.value, G.maxLen))
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
                  e.preventDefault()
                  // col mouse Invio scatta, sul telefono chiude la tastiera e lascia vedere il titolo
                  if (pronta && window.matchMedia('(pointer: fine)').matches) void scatta(T_BOTTONE, true)
                  else e.currentTarget.blur()
                }}
              />
              <span className={s.tratto} aria-hidden="true" />
              <svg className={s.no} data-acceso={avviso || undefined} viewBox="0 0 40 40" aria-hidden="true">
                <path d="M9 8 L32 33" />
                <path d="M31 7 L8 32" />
              </svg>
            </span>
            <span className={s.fisso} aria-hidden="true">
              {G.suffisso}
            </span>
          </div>
          <p className={s.nascosto} role="status">
            {avviso ? 'Questa no.' : perche}
          </p>
          <div className={`${s.azioni} entra`} style={conIndice(3)}>
            {/* la galleria, sempre in basso a sinistra come in ogni fotocamera */}
            <label
              htmlFor={idFoto}
              className="simbolo"
              aria-label={foto ? 'Cambia foto dalla galleria' : 'Scegli dalla galleria'}
              aria-busy={caricando || undefined}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.currentTarget.click()
                }
              }}
            >
              +
            </label>
            <button
              ref={bottone}
              type="button"
              className="bottone"
              // aria-disabled e non disabled: resta focalizzabile mentre la fotocamera si accende
              aria-disabled={bloccata || !pronta || undefined}
              onClick={() => pronta && void scatta(T_BOTTONE, true)}
            >
              SCATTA
            </button>
            <button
              type="button"
              className={`simbolo ${s.tinta}`}
              aria-label={`Colore della scritta: ${TINTE[tinta].id}`}
              disabled={!pronta}
              style={{ '--campione': TINTE[tinta].testo, '--bordo': TINTE[tinta].eco } as CSSProperties}
              onClick={() => {
                setTintaScelta(true)
                setTinta((t) => (t + 1) % TINTE.length)
              }}
            />
          </div>
        </div>
      </main>

      <div ref={lampo} className={s.lampo} aria-hidden="true" />
      {scatto.fase !== 'chiuso' && <Anteprima scatto={scatto} testo={testo} onRifai={rifai} />}
    </div>
  )
}
