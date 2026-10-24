/**
 * Far uscire l'immagine dal sito: condivisione nativa con il file (storie IG
 * comprese, dove il sistema lo permette) oppure download. Solo nel browser,
 * da chiamare negli handler dei bottoni: la condivisione vuole il gesto
 * dell'utente ancora "caldo".
 */
'use client'

import { useSyncExternalStore } from 'react'

/** Browser dentro le app (Instagram, Facebook, LINE, TikTok): lì scaricare non funziona */
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|\bLine\/|TikTok|musical_ly|Bytedance/

export const browserInApp = (ua: string) => IN_APP.test(ua)

const nessunEvento = () => () => {}

/** True dentro un browser in-app. Sul server e al primo disegno è false */
export function useInApp(): boolean {
  return useSyncExternalStore(
    nessunEvento,
    () => browserInApp(navigator.userAgent),
    () => false,
  )
}

/** Il sistema sa condividere questo file? (Web Share livello 2) */
export function puoCondividereFile(file: File): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    )
  } catch {
    return false
  }
}

export type EsitoCondivisione = 'fatto' | 'annullato' | 'errore'

/**
 * Solo il file, senza `text` né `title`: con file + testo iOS li manda come
 * due cose separate e l'estensione di Instagram risponde "contenuto non
 * disponibile" (o le storie prendono solo il testo). Il link è già stampato
 * sull'immagine.
 */
export async function condividiFile(file: File): Promise<EsitoCondivisione> {
  try {
    await navigator.share({ files: [file] })
    return 'fatto'
  } catch (e) {
    // chiudere il pannello di condivisione non è un errore (nelle WebView non sempre è un DOMException)
    if ((e as { name?: unknown } | null)?.name === 'AbortError') return 'annullato'
    return 'errore'
  }
}

/** Download con un <a download> creato al volo */
export function salvaFile(url: string, nome: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
