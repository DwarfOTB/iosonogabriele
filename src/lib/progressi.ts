'use client'

import { useSyncExternalStore } from 'react'
import { CAMPAGNA } from '@/content/campagna'
import type { CuscinoSalvato } from '@/features/mondo/stato'

/**
 * Progressi del visitatore, salvati solo nel suo browser.
 * Quando arriverà un backend (classifiche, conteggi condivisi) basterà
 * sostituire `leggi`/`scrivi` mantenendo la stessa forma dei dati.
 */
export interface Progressi {
  /** Il minigioco della campagna è stato completato almeno una volta */
  completato: boolean
  /** Il fortino finito, cuscino per cuscino: si ritrova com'era alla visita dopo */
  fortino: CuscinoSalvato[] | null
  /** Ha già visto la spiegazione del fortino */
  introVista: boolean
}

const CHIAVE = `iosonogabriele:${CAMPAGNA.id}:v2`
const VUOTO: Progressi = { completato: false, fortino: null, introVista: false }

let cache: Progressi | null = null
const ascoltatori = new Set<() => void>()

function leggi(): Progressi {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(CHIAVE)
    cache = raw ? { ...VUOTO, ...(JSON.parse(raw) as Partial<Progressi>) } : VUOTO
  } catch {
    cache = VUOTO
  }
  return cache
}

function scrivi(p: Progressi) {
  cache = p
  try {
    window.localStorage.setItem(CHIAVE, JSON.stringify(p))
  } catch {
    /* modalità privata o storage bloccato: i progressi restano per questa sessione */
  }
  ascoltatori.forEach((fn) => fn())
}

/** Fortino chiuso: si segna il completamento e si salva com'è venuto */
export function salvaFortino(fortino: CuscinoSalvato[]) {
  // rilegge dallo storage: un'altra scheda potrebbe aver scritto nel frattempo
  cache = null
  const p = leggi()
  scrivi({ ...p, completato: true, fortino })
}

export function segnaIntroVista() {
  cache = null
  scrivi({ ...leggi(), introVista: true })
}

/** Leggibile anche fuori da React (dal mondo 3D) */
export function progressiOra(): Progressi {
  return typeof window === 'undefined' ? VUOTO : leggi()
}

export function azzeraProgressi() {
  scrivi(VUOTO)
}

function iscrivi(fn: () => void) {
  ascoltatori.add(fn)
  const suStorage = (e: StorageEvent) => {
    if (e.key === CHIAVE) {
      cache = null
      fn()
    }
  }
  window.addEventListener('storage', suStorage)
  return () => {
    ascoltatori.delete(fn)
    window.removeEventListener('storage', suStorage)
  }
}

/** Progressi reattivi. Sul server (e al primo render) restituisce lo stato vuoto. */
export function useProgressi(): Progressi {
  return useSyncExternalStore(iscrivi, leggi, () => VUOTO)
}
