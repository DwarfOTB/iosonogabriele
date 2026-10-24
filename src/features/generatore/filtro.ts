/**
 * Filtro parole del generatore. Gira solo nel browser, il testo non esce mai
 * dal dispositivo. Blocca insulti, slur d'odio, bestemmie e termini sessuali
 * espliciti in italiano e inglese, anche scritti storti: maiuscole, accenti,
 * leetspeak (c4zz0), lettere ripetute (cazzzzo), spazi in mezzo (c a z z o).
 *
 * COME ESTENDERE LA LISTA
 * - Scrivi la parola normale, in minuscolo, nella categoria giusta.
 *   La normalizzazione (accenti, leet, doppie) viene applicata da sola.
 * - `radici`: pezzi abbastanza lunghi e specifici da essere cercati DENTRO le
 *   parole ("stronz" prende stronzo, stronza, stronzate).
 * - `parole`: parole corte o ambigue, bloccate solo se sono la parola intera
 *   ("figa" no, "negro" sì ma "negroni" no).
 * - Se una radice blocca una parola innocua, aggiungi la radice innocua a
 *   INNOCUE (es. "cazzott" per cazzotto): viene tolta prima del controllo.
 *   Se la parola innocua è corta e toglierla aprirebbe un buco ("fuco" dentro
 *   "fuckoff"), mettila invece in ECCEZIONI: vale solo come parola intera.
 * - Dopo ogni modifica prova le parole innocue più vicine: le doppie vengono
 *   compresse, quindi "coon" diventerebbe "con" e bloccherebbe "con te".
 */

export type Categoria = 'insulti' | 'odio' | 'bestemmie' | 'sessuale'

export interface Esito {
  bloccata: boolean
  categoria?: Categoria
}

interface Voci {
  radici: string[]
  parole: string[]
}

const LISTA: Record<Categoria, Voci> = {
  insulti: {
    radici: [
      'stronz', 'coglion', 'puttan', 'mignott', 'bastard', 'fancul', 'merd',
      'leccacul', 'rottincul', 'rottoincul', 'leccafig', 'fottut',
      'baldracc', 'bagasc', 'sgualdrin',
      'asshole', 'bitch', 'cunt', 'wanker', 'dickhead', 'whore', 'slut',
    ],
    parole: [
      'troia', 'troie', 'troja', 'zoccola', 'zoccole', 'cagna', 'cagne', 'fottiti',
      'twat', 'prick', 'skank', 'hoe', 'hoes',
    ],
  },
  odio: {
    radici: [
      // omofobi
      'froci', 'frocett', 'ricchion', 'recchion', 'culatton',
      // abilisti
      'mongoloid', 'ritardat', 'handicappat', 'retard',
      // razzisti
      'nigger', 'musogiall', 'wetback', 'raghead', 'towelhead', 'polenton',
      // nazifascismo
      'hitler', 'nazis', 'fascis', 'siegheil',
    ],
    parole: [
      'negro', 'negri', 'negra', 'negre', 'negretto', 'negretta', 'nigga', 'niggas',
      'terrone', 'terroni', 'terrona', 'zingaro', 'zingara', 'zingari', 'zingare',
      'giudeo', 'giudei', 'kike', 'spic', 'chink', 'gook', 'paki', 'beaner',
      'faggot', 'faggots', 'fag', 'fags', 'tranny', 'dyke', 'checca', 'finocchio', 'finocchi',
      'busone', 'busoni',
      'nazi', 'duce',
    ],
  },
  // le bestemmie sono combinazioni: vedi SACRI e OFFESE più sotto
  bestemmie: { radici: [], parole: [] },
  sessuale: {
    radici: [
      // "cazzi" no: compresso diventa "cazi" ed è dentro "applicazione"
      'cazzo', 'cazzon', 'minchi', 'pompin', 'bocchinar', 'sborra', 'sborrat', 'sborro',
      'scopat', 'inculat', 'incular', 'porn', 'masturb', 'segaiol', 'pedofil', 'pedopor', 'stupr',
      'fuck', 'blowjob', 'handjob', 'dildo', 'cumshot',
    ],
    parole: [
      'cazzi', 'tette',
      'dick', 'dicks', 'cock', 'cocks', 'pussy', 'tits', 'titties', 'boobs', 'anal', 'milf', 'hentai', 'rapist', 'jizz', 'boner',
    ],
  },
}

/** Nomi sacri e offese: si bloccano le coppie, non le parole da sole ("dio" e "porco" vanno bene) */
const SACRI = ['dio', 'madonna', 'cristo', 'gesu', 'gesucristo', 'padreterno']
const OFFESE = [
  'porc', 'can', 'boia', 'besti', 'maial', 'merd', 'ladr', 'lurid', 'schifos', 'infam',
  'serpent', 'bastard', 'stracan', 'puttan', 'troi', 'zoccol', 'impestat',
]

/** Radici innocue che contengono una radice bloccata */
const INNOCUE = [
  'cazzott', 'scazz', 'incazz', 'cazzimm', 'cazziat',
  // "fuck" compresso è "fuc"
  'fucil', 'fucin', 'fucsi', 'fuchsi',
  // "puttan" compresso è "putan": i verbi in -putare. Forme intere, così "disputtana" resta bloccata
  'disputand', 'disputano', 'computand', 'computano', 'imputand', 'imputano',
  'reputand', 'reputano', 'deputano', 'amputand', 'amputano',
  // "dio" + "can" a cavallo di due parole
  'radiocan', 'audiocan', 'studiocan',
  // "summer dream"
  'summerd',
  'ritardatari',
  'antifascis', 'antinazis',
  'nigeri',
  'orecchion',
  'bastardin',
  'puttanesc',
]

/** Parole innocue corte, valide solo intere (come sottostringhe aprirebbero buchi) */
const ECCEZIONI = ['fuco', 'fuchi']

/** Sigle d'odio controllate sul testo grezzo, prima di ogni sostituzione: "kkk" solo intera ("okkk" va bene) */
const SIGLE_INTERE = ['kkk']
const SIGLE_DENTRO = ['1488']

/* ------------------------------------------------------------------ */

const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
  '@': 'a', '$': 's', '€': 'e', '!': 'i', '+': 't',
  // la k delle chat ("kazzo", "fuk") vale come c
  k: 'c',
}

/** Minuscolo, senza accenti, leet tradotto, solo lettere a-z (senza comprimere le doppie) */
function base(s: string): string {
  // NFKD: anche le lettere a larghezza piena e quelle "matematiche" (𝐜𝐚𝐳𝐳𝐨) tornano a-z
  const senzaAccenti = s.normalize('NFKD').toLowerCase().replace(/[̀-ͯ]/g, '')
  let r = ''
  for (const ch of senzaAccenti) {
    const c = LEET[ch] ?? ch
    if (c >= 'a' && c <= 'z') r += c
  }
  return r
}

/** Lettere ripetute compresse: "cazzzzo" → "cazo" */
const comprimi = (s: string) => s.replace(/(.)\1+/g, '$1')

/** Normalizzazione completa, la stessa per il testo e per la lista */
export const normalizza = (s: string) => comprimi(base(s))

const ESATTE = new Map<string, Categoria>()
const RADICI: [string, Categoria][] = []
for (const cat of Object.keys(LISTA) as Categoria[]) {
  for (const p of LISTA[cat].parole) ESATTE.set(normalizza(p), cat)
  for (const r of LISTA[cat].radici) RADICI.push([normalizza(r), cat])
}
for (const s of SACRI.map(normalizza)) {
  for (const o of OFFESE.map(normalizza)) RADICI.push([s + o, 'bestemmie'])
  // "porco dio", "porca madonna": l'ordine inverso vale solo per porco/porca
  for (const v of ['', 'o', 'a', 'i', 'e']) RADICI.push(['porc' + v + s, 'bestemmie'])
}
const INNOCUE_N = INNOCUE.map(normalizza).sort((a, b) => b.length - a.length)
const ECCEZIONI_N = new Set(ECCEZIONI.map(normalizza))

/** Toglie le radici innocue lasciando un separatore, così non si saldano i pezzi intorno */
function senzaInnocue(s: string): string {
  let r = s
  for (const inn of INNOCUE_N) if (r.includes(inn)) r = r.split(inn).join('|')
  return r
}

/**
 * Controlla la parola scritta dall'utente (solo la parte variabile, senza "SONO").
 * Guarda ogni parola da sola e anche tutto attaccato, per prendere "c a z z o".
 */
export function verifica(testo: string): Esito {
  const pezzi = testo.normalize('NFKC').toLowerCase().split(/[\s'’]+/).filter(Boolean)
  const grezzi = pezzi.length > 1 ? [...pezzi, pezzi.join('')] : pezzi
  if (grezzi.some((g) => SIGLE_INTERE.includes(g) || SIGLE_DENTRO.some((s) => g.includes(s)))) {
    return { bloccata: true, categoria: 'odio' }
  }

  const basi = testo.split(/[\s'’]+/).map(base).filter(Boolean)
  if (!basi.length) return { bloccata: false }
  const parole = basi.map(comprimi)
  const intero = comprimi(basi.join(''))
  const candidati = parole.length > 1 ? [...parole, intero] : parole

  for (const c of candidati) {
    const cat = ESATTE.get(c)
    if (cat) return { bloccata: true, categoria: cat }
  }
  for (const c of candidati) {
    if (ECCEZIONI_N.has(c)) continue
    const pulito = senzaInnocue(c)
    for (const [radice, cat] of RADICI) if (pulito.includes(radice)) return { bloccata: true, categoria: cat }
  }
  return { bloccata: false }
}

export const parolaBloccata = (testo: string) => verifica(testo).bloccata
