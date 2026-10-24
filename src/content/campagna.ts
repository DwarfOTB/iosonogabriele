/**
 * La campagna in corso. È l'unico posto da toccare a ogni nuova uscita:
 * il minigioco dello spazio bianco, la frase del generatore e quali stanze
 * dell'atrio sono aperte dipendono da qui, non dal codice delle pagine.
 */

export type MinigiocoId = 'fortino'
export type StanzaId = 'fortino' | 'sono' | 'balconi' | 'studio'

export interface Stanza {
  id: StanzaId
  /** Nome breve, scritto grande e compresso sulla porta */
  nome: string
  href: string
  aperta: boolean
}

export interface ModelloGeneratore {
  /** Prima parte fissa, es. "SONO" */
  prefisso: string
  /** Chiusura fissa, es. "." */
  suffisso: string
  /** Parola mostrata prima che l'utente scriva */
  esempio: string
  /** Lunghezza massima della parte scritta dall'utente */
  maxLen: number
}

export interface Campagna {
  id: string
  /** Titolo dell'uscita, scritto nello spazio bianco */
  titolo: string
  minigioco: MinigiocoId
  generatore: ModelloGeneratore
  stanze: Stanza[]
}

export const CAMPAGNA: Campagna = {
  id: 'sono-io',
  titolo: 'SONO IO.',
  minigioco: 'fortino',
  generatore: { prefisso: 'SONO', suffisso: '.', esempio: 'IO', maxLen: 14 },
  stanze: [
    { id: 'fortino', nome: 'IL FORTINO', href: '/', aperta: true },
    { id: 'sono', nome: 'SONO ___.', href: '/sono', aperta: true },
    { id: 'balconi', nome: 'I BALCONI', href: '/balconi', aperta: false },
    { id: 'studio', nome: 'LO STUDIO', href: '/studio', aperta: false },
  ],
}

/** Indirizzo stampato sulle immagini del generatore */
export const LINK_GENERATORE = 'iosonogabriele.it/sono'
export const NOME_ARTISTA = 'iosonogabriele'
