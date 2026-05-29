# PRD — iosonogabriele.it
## Sito Web 3D Immersivo · Album "Il Sole è Rosso" + Tour Estivo
**Versione:** 2.0 · Stack Three.js

---

## 1. Concept — Mondo 3D a Stanze

Il sito è un **mondo tridimensionale continuo** a cui l'utente accede e naviga come se camminasse tra stanze fisiche. Non esistono sezioni Hero, scroll verticali, o layout a colonne. Ogni "pagina" è una **stanza 3D** con ambienti, oggetti interattivi, luci proprie.

**Ispirazione diretta:** jesse-zhou.com — diorama isometrici 3D con camera orbitale, oggetti cliccabili, zoom sul contenuto.

### 1.1 Principio Fondamentale

> L'utente non naviga un sito. Esplora un posto.

La camera si muove nello spazio 3D tra le stanze. Quando clicca un oggetto, la telecamera fa uno zoom morbido verso quell'oggetto e compare un overlay HTML con il contenuto reale.

### 1.2 Le 5 Stanze

| ID | Nome | Ambiente 3D | Oggetti Interattivi |
|---|---|---|---|
| 0 | Home / Esterno | Paesaggio aperto, colline, cielo con Il Sole | Porta d'ingresso |
| 1 | Musica (Studio) | Stanza produzione: scrivania, MacBook, casse, vinili | MacBook → tracklist, Vinile → album Spotify |
| 2 | Live (Palco) | Palco buio con fari, mic, sipario | Distributore biglietti, microfono |
| 3 | Archivio (Sughero) | Parete di sughero con polaroid | Ogni polaroid → foto grande |
| 4 | Merch (Bancone) | Bancone mercato in legno grezzo | Prodotti → overlay "in arrivo" |

### 1.3 Il Sole — Elemento Persistente 3D

Il Sole è una sfera 3D nel cielo della scena, sempre visibile. Caratteristiche:
- Toon shading giallo (#F7C842) con raggi a cilindro irregolari
- Occhi 3D che cambiano espressione per stanza (sfera eye come in copertina)
- Ruota lentamente su se stesso (self-rotation)
- Fluttua verticalmente in loop sinusoidale
- Emette luce calda direzionale sulla scena

---

## 2. Architettura Tecnica

### 2.1 Layout Stanze nel Mondo 3D

Le stanze sono posizionate lungo l'asse Z in sequenza:

```
Home (z=0) → Studio (z=-18) → Palco (z=-36) → Archivio (z=-54) → Merch (z=-72)
```

La camera si muove tra posizioni predefinite con lerp smoothing.

### 2.2 Camera Positions per Stanza

```typescript
const CAMERA_CONFIGS = [
  { pos: [4, 7, 10],   lookAt: [0, 1.5, 0]    }, // Home — esterno ampio
  { pos: [-3, 6, -8],  lookAt: [0, 2, -18]    }, // Studio — vista isometrica da sinistra
  { pos: [4, 5, -26],  lookAt: [0, 2, -34]    }, // Palco — vista dalla platea
  { pos: [-3, 6, -44], lookAt: [0, 2.5, -52]  }, // Archivio — frontale alla parete
  { pos: [3, 5, -62],  lookAt: [0, 1.5, -70]  }, // Merch — vista bancone
]
```

### 2.3 Navigazione

- **Navbar** cliccabile → transizione camera alla stanza
- **Frecce laterali** (UI) → stanza precedente/successiva
- **Tasti ← →** da tastiera
- **Click su oggetti interattivi** → zoom in + overlay HTML
- **ESC** → torna alla vista stanza (zoom out)

### 2.4 Interazione Oggetti

Ogni oggetto interattivo ha:
1. Un `userData.id` sulla mesh Three.js
2. Raycasting al click del mouse
3. Cursor:pointer su hover
4. Al click: la camera fa un lerp verso `userData.zoomPos` + compare overlay React

### 2.5 Shading — Aspetto "Fatto a Mano"

Per replicare l'estetica a mano delle copertine in 3D:
- **MeshToonMaterial** per tutti gli oggetti, con gradientMap a 3 step
- **Outline technique** (BackSide mesh leggermente scalato) per i contorni neri
- **Fog esponenziale** leggero per profondità
- **Ombre** (castShadow / receiveShadow) su elementi principali

---

## 3. User Stories

| ID | Story | Priorità |
|---|---|---|
| US-01 | Come utente, voglio spostarmi tra le stanze con frecce o navbar, così da esplorare il mondo | P0 |
| US-02 | Come fan, voglio cliccare il MacBook nella stanza musica e vedere la tracklist, senza uscire dalla scena | P0 |
| US-03 | Come fan, voglio cliccare il vinile e sentire/vedere l'album su Spotify embed | P0 |
| US-04 | Come fan, voglio cliccare il distributore biglietti sul palco e vedere le date del tour | P0 |
| US-05 | Come utente mobile, voglio navigare tra le stanze con swipe orizzontale | P1 |
| US-06 | Come utente, voglio che la camera si muova smoothly tra una stanza e l'altra | P0 |
| US-07 | Come utente con motion sickness, voglio ridurre/disabilitare le animazioni | P1 |

---

## 4. Stati UI in Ambiente 3D

| Stato | Comportamento 3D | Overlay HTML |
|---|---|---|
| Navigazione normale | Camera lerpa tra stanze | Nessuno |
| Hover oggetto | Highlight luce puntuale, cursor pointer | Tooltip "clicca" |
| Click oggetto | Camera zooma verso oggetto (0.8s) | Panel contenuto appare |
| Player Spotify | Nessuna variazione 3D | Iframe embed nel panel |
| Nessuna data tour | Stage vuoto illuminato | "L'estate si sta preparando" |
| 404 | Scena vuota, solo Il Sole | "Questa stanza non esiste" |

---

## 5. Requisiti Tecnici

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| 3D Engine | Three.js via @react-three/fiber (R3F) |
| Helpers 3D | @react-three/drei (Html, useGLTF, Sparkles, etc.) |
| Camera anim | GSAP (gsap.to camera.position) |
| Post-processing | @react-three/postprocessing (Outline, Bloom) |
| Stato globale | Zustand |
| Overlay UI | React + Tailwind CSS (HTML over canvas) |
| Deploy | Vercel |

### 5.1 Performance 3D

- Geometry istanziata con InstancedMesh dove possibile
- `useMemo` per geometrie e materiali in R3F
- Texture ottimizzate (max 1024×1024)
- LOD per oggetti lontani
- `frameloop="demand"` in R3F quando scena è statica
- Lazy loading stanze non visibili

### 5.2 Mobile

- Touch swipe per navigazione stanze
- Camera FOV più stretto su mobile
- Riduzione geometria (meno poligoni) su dispositivi < GPU dedicata
- `prefers-reduced-motion`: camera jump istantaneo invece di lerp

---

## 6. Link e Asset

| Risorsa | Dettaglio |
|---|---|
| Spotify Album | `https://open.spotify.com/intl-it/album/0Ubx6rC0UAtiu2Mcl6M6F5` |
| Instagram | `https://www.instagram.com/iosngabriele` |
| YouTube | `https://youtube.com/@iosonogabriele.4u` |
| Modelli 3D | Da creare in Blender con UV map — stile low-poly toon |
| Texture | Painted a mano, max 1024px, formato WebP/KTX2 |
| HDRI sky | Custom baked warm sunset |

---

## 7. Fuori Scope v1.0

- Multiplayer / shared experience
- Audio spaziale 3D (HRTF)
- VR/AR support
- Fisica simulata (Rapier)
- Animazioni personaggio Gabriele
