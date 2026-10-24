/**
 * La parola scritta dall'utente: cosa si può scrivere e come diventa testo.
 * Ammessi: lettere dell'alfabeto latino (anche accentate), cifre 0-9, spazio, apostrofo.
 * Niente cirillico o greco: lettere uguali a vista ("сazzo" con la с russa)
 * passerebbero il filtro, e il font non le ha comunque.
 */

// costruite con RegExp: le classi Unicode \p{} non passano il controllo di TS con target ES2017
const NON_AMMESSI = new RegExp("[^\\p{Script=Latin}0-9 ']", 'gu')
const APOSTROFI = /[’‘`´ʼ]/g

/** Pulisce quello che arriva dal campo, tagliando a `maxLen` caratteri */
export function pulisciParola(s: string, maxLen: number): string {
  const r = s
    .replace(APOSTROFI, "'")
    // NFKC: lettere a larghezza piena, "matematiche" e legature tornano normali
    .normalize('NFKC')
    .replace(/\s/g, ' ')
    .replace(NON_AMMESSI, '')
    .replace(/ {2,}/g, ' ')
    .replace(/'{2,}/g, "'")
    .replace(/^[ ']+/, '')
  return Array.from(r).slice(0, maxLen).join('')
}

/** La parola come appare scritta grande: senza spazi ai bordi, maiuscola */
export const maiuscola = (s: string) => s.trim().toLocaleUpperCase('it-IT')

/** Nome del file salvato: sono-stanco.png */
export function nomeFile(prefisso: string, parola: string): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  return `${slug(prefisso) || 'sono'}-${slug(parola) || 'io'}.png`
}
