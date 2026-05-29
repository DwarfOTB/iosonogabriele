# PROMPTS.md — Sequenza Procedurale Claude Code
## iosonogabriele.it · Stack Three.js / React Three Fiber

**REGOLA GLOBALE:** Segui i prompt nell'ordine esatto. Verifica ogni checkpoint prima di procedere.

---

## ⚠️ CONTEXT BLOCK — Incolla questo all'inizio di OGNI sessione Claude Code

```
Stai sviluppando iosonogabriele.it — sito 3D immersivo per l'artista iosonogabriele.
Ispirazione: jesse-zhou.com — stanze isometriche 3D con camera che si muove tra ambienti.

Stack FISSO:
  Next.js 14 App Router · TypeScript strict · @react-three/fiber · @react-three/drei
  GSAP per camera animations · Zustand · Tailwind CSS per UI overlay

Colori (Three.js hex):
  paper 0xF4EDD8 · ink 0x1C1208 · red 0xD93025 · sunCore 0xF7C842 · wood 0x4A3018

PROIBITO: MeshStandardMaterial · OrbitControls · font Inter/Roboto · spinner generici
OBBLIGATORIO: MeshToonMaterial per tutti gli oggetti · GSAP per camera · outline BackSide
```

---

# SPRINT 1 — Setup Progetto

## PROMPT 1.1 — Inizializzazione

```
[INCOLLA IL CONTEXT BLOCK SOPRA]

TASK: Inizializza il progetto Next.js 14 con tutto lo stack Three.js.

ESEGUI IN ORDINE:

1. Crea progetto:
   pnpm create next-app@latest iosonogabriele \
     --typescript --tailwind --app --src-dir --import-alias "@/*"

2. Installa dipendenze 3D:
   pnpm add @react-three/fiber @react-three/drei three
   pnpm add @react-three/postprocessing
   pnpm add gsap
   pnpm add zustand
   pnpm add -D @types/three

3. Crea struttura cartelle (con .gitkeep):
   src/components/world/
   src/components/world/rooms/
   src/components/ui/
   src/store/
   src/hooks/
   src/data/
   src/lib/
   public/models/
   public/textures/
   public/hdri/

4. Crea tailwind.config.ts con custom colors:
   sun: { core: '#F7C842', warm: '#F5A623', deep: '#E07B2A' }
   red: { primary: '#D93025', warm: '#C0392B', muted: '#8B2E22' }
   paper: { DEFAULT: '#F4EDD8', warm: '#EDE0C4', dark: '#D9C9A8' }
   ink: { DEFAULT: '#1C1208', soft: '#3D2E1A', faint: '#7A6548' }
   wood: { DEFAULT: '#4A3018', light: '#6B4C2A' }
   fontFamily:
     handwriting: ['Caveat', 'cursive']
     display: ['Playfair Display', 'serif']
     body: ['Lora', 'serif']
     mono: ['Courier Prime', 'monospace']

5. Crea src/app/globals.css con Google Fonts import:
   @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Lora&family=Courier+Prime:wght@400;700&display=swap');

6. NON avviare dev server. Conferma con: find src -type d && pnpm tsc --noEmit
```

**✅ CHECKPOINT 1.1**
- [ ] pnpm install senza errori
- [ ] @react-three/fiber presente in package.json
- [ ] Struttura cartelle corretta
- [ ] tailwind.config.ts ha i colori custom

---

## PROMPT 1.2 — Store e Dati

```
[CONTEXT BLOCK]
Progetto inizializzato. Sprint 1.1 completato.

TASK: Crea lo store Zustand e tutti i file dati.

1. Crea src/store/worldStore.ts:

'use client'
import { create } from 'zustand'

export interface WorldState {
  currentRoom: number
  activePanel: string | null
  hoveredObject: string | null
  isTransitioning: boolean
  setRoom: (i: number) => void
  nextRoom: () => void
  prevRoom: () => void
  openPanel: (id: string) => void
  closePanel: () => void
  setHovered: (id: string | null) => void
  setTransitioning: (v: boolean) => void
}

export const TOTAL_ROOMS = 5

export const useWorldStore = create<WorldState>((set, get) => ({
  currentRoom:   0,
  activePanel:   null,
  hoveredObject: null,
  isTransitioning: false,
  setRoom:      (i) => set({ currentRoom: Math.max(0, Math.min(TOTAL_ROOMS - 1, i)), activePanel: null }),
  nextRoom:     () => get().setRoom(get().currentRoom + 1),
  prevRoom:     () => get().setRoom(get().currentRoom - 1),
  openPanel:    (id) => set({ activePanel: id }),
  closePanel:   () => set({ activePanel: null }),
  setHovered:   (id) => set({ hoveredObject: id }),
  setTransitioning: (v) => set({ isTransitioning: v }),
}))

2. Crea src/data/rooms.ts:

import * as THREE from 'three'

export interface RoomConfig {
  id: string
  label: string
  navLabel: string
  zOffset: number
  cameraPos: [number, number, number]
  cameraLookAt: [number, number, number]
  sunExpression: 'calm' | 'happy' | 'curious' | 'sleepy' | 'sad'
  fogColor: string
}

export const ROOMS: RoomConfig[] = [
  { id:'home',     label:'Home',     navLabel:'home',     zOffset:0,   cameraPos:[4,7,10],   cameraLookAt:[0,1.5,0],    sunExpression:'calm',    fogColor:'#AED6F1' },
  { id:'musica',   label:'Musica',   navLabel:'musica',   zOffset:-18, cameraPos:[-3,6,-8],  cameraLookAt:[0,2,-18],    sunExpression:'curious', fogColor:'#F4EDD8' },
  { id:'live',     label:'Live',     navLabel:'live',     zOffset:-36, cameraPos:[4,5,-26],  cameraLookAt:[0,2,-34],    sunExpression:'happy',   fogColor:'#0d0905' },
  { id:'archivio', label:'Archivio', navLabel:'archivio', zOffset:-54, cameraPos:[-3,6,-44], cameraLookAt:[0,2.5,-52],  sunExpression:'calm',    fogColor:'#C19A6B' },
  { id:'merch',    label:'Merch',    navLabel:'merch',    zOffset:-72, cameraPos:[3,5,-62],  cameraLookAt:[0,1.5,-70],  sunExpression:'sleepy',  fogColor:'#4A3018' },
]

3. Crea src/data/tracklist.ts (11 tracce — da specifiche PRD)
4. Crea src/data/tourDates.ts (placeholder vuoto — da popolare)
5. Crea src/lib/materials.ts (createGradientMap + toonMaterial — da specifiche CLAUDE.md)
6. Crea src/hooks/useReducedMotion.ts
7. Crea src/hooks/useRoomNavigation.ts:
   - Keyboard listener: ArrowLeft → prevRoom, ArrowRight → nextRoom, Escape → closePanel
   - Touch: swipe left/right per nextRoom/prevRoom (touchstart/touchend delta)
   - Chiama funzioni da useWorldStore
```

**✅ CHECKPOINT 1.2**
- [ ] worldStore.ts ha tutti i metodi elencati
- [ ] ROOMS ha esattamente 5 elementi con zOffset corretti (0, -18, -36, -54, -72)
- [ ] tsc --noEmit senza errori TypeScript
- [ ] useRoomNavigation ha listener keyboard E touch

---

# SPRINT 2 — Canvas e Scena Base

## PROMPT 2.1 — World Canvas e Scena

```
[CONTEXT BLOCK]
Store e dati creati. Sprint 1 completato.
File esistenti: src/store/worldStore.ts, src/data/rooms.ts, src/lib/materials.ts

TASK: Crea il canvas Three.js e la scena base con luci e Il Sole 3D.

1. Crea src/components/world/World.tsx:
   - <Canvas> R3F con camera iniziale ROOMS[0].cameraPos, fov 55
   - shadows={true}, gl={{ antialias: true, alpha: false }}
   - dpr={[1, 2]}
   - Suspense fallback={<SolLoader />} (da creare dopo)
   - Dentro Canvas: <Scene />, <CameraRig />, <Sol3D />

2. Crea src/components/world/Scene.tsx:
   - AmbientLight color #FFF8E7, intensity 0.4
   - DirectionalLight position [10, 20, 15], color #F7C842, intensity 1.2
     castShadow, shadow.mapSize.width/height 2048
   - FogExp2 color #AED6F1, density 0.006
   - <Suspense> che wrappa tutte le stanze

3. Crea src/components/world/Sol3D.tsx:
   IL SOLE 3D — il componente più importante del sito.
   
   import { useFrame } from '@react-three/fiber'
   import { useMemo, useRef } from 'react'
   import * as THREE from 'three'
   import { toonMaterial } from '@/lib/materials'
   import { useWorldStore } from '@/store/worldStore'
   import { ROOMS } from '@/data/rooms'
   
   Posizione fissa: [12, 20, -10]
   
   Composizione:
   A) Sfera glow (MeshBasicMaterial, color 0xFFF0A0, transparent opacity 0.2, scale 1.5)
   B) Corpo sole (SphereGeometry r=3, MeshToonMaterial sunCore 0xF7C842)
   C) 12 raggi a cilindro CylinderGeometry(0.12, 0.08, lunghezza_variabile, 6)
      Posizionati con angoli NON uniformi (aggiungi ±5-15deg di variazione per ogni raggio)
      Materiale toon sunDeep 0xE07B2A
   D) Occhi sinistro/destro: SphereGeometry r=0.3, materiale toon ink 0x1C1208
      La dimensione degli occhi (scaleY) varia per sunExpression:
        calm: scaleY 0.6
        happy: scaleY 1.0 (+ sfera guancia sunDeep opacity 0.3)
        curious: leftEye scaleY 0.7, rightEye scaleY 1.2
        sleepy: scaleY 0.3
        sad: scaleY 0.4 + mesh sopracciglia (box thin inclinato)
   
   useFrame((state) => {
     if (reducedMotion) return
     // Self-rotation lenta
     solRef.current.rotation.z += 0.003
     // Float sinusoidale
     solRef.current.position.y = 20 + Math.sin(state.clock.elapsedTime * 0.4) * 0.8
     // Raggi pulsano
     raysRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04)
   })
   
   La sunExpression viene da: ROOMS[currentRoom].sunExpression via useWorldStore

4. Crea src/components/world/CameraRig.tsx:
   
   import { useThree } from '@react-three/fiber'
   import { useEffect, useRef } from 'react'
   import gsap from 'gsap'
   import { useWorldStore } from '@/store/worldStore'
   import { ROOMS } from '@/data/rooms'
   
   const lookAtTarget = new THREE.Vector3()
   
   export function CameraRig() {
     const { camera } = useThree()
     const currentRoom = useWorldStore(s => s.currentRoom)
     const setTransitioning = useWorldStore(s => s.setTransitioning)
     const reducedMotion = useReducedMotion()
     const lookRef = useRef(new THREE.Vector3(...ROOMS[0].cameraLookAt))
   
     useEffect(() => {
       const cfg = ROOMS[currentRoom]
       const duration = reducedMotion ? 0 : 1.4
       
       setTransitioning(true)
       
       gsap.to(camera.position, {
         x: cfg.cameraPos[0], y: cfg.cameraPos[1], z: cfg.cameraPos[2],
         duration, ease: 'power2.inOut',
         onComplete: () => setTransitioning(false),
       })
       
       gsap.to(lookRef.current, {
         x: cfg.cameraLookAt[0], y: cfg.cameraLookAt[1], z: cfg.cameraLookAt[2],
         duration, ease: 'power2.inOut',
         onUpdate: () => camera.lookAt(lookRef.current),
       })
     }, [currentRoom])
   
     return null
   }

5. Aggiorna src/app/page.tsx:
   
   import dynamic from 'next/dynamic'
   const World = dynamic(() => import('@/components/world/World'), { ssr: false })
   
   // dynamic import OBBLIGATORIO per Three.js (no SSR)
   
   Struttura:
   <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
     <World />
     {/* UI overlay viene aggiunto in Sprint 3 */}
   </div>

6. Avvia pnpm dev e verifica che il canvas si carichi senza errori.
```

**✅ CHECKPOINT 2.1**
- [ ] Canvas renderizza senza errori in console
- [ ] Il Sole 3D è visibile in posizione [12, 20, -10]
- [ ] Il Sole ruota lentamente e fluttua
- [ ] CameraRig non genera errori TypeScript
- [ ] `dynamic` import con `ssr: false` su World.tsx

---

## PROMPT 2.2 — HomeRoom e MusicRoom

```
[CONTEXT BLOCK]
Canvas funzionante con Sole 3D e CameraRig. Sprint 2.1 completato.
File: src/lib/materials.ts (toonMaterial), src/data/rooms.ts (ROOMS[0].zOffset = 0, ROOMS[1].zOffset = -18)

TASK: Crea le prime due stanze 3D.

HELPER COMUNE (crea in src/lib/geometryHelpers.tsx):

export function RoomBox({ zOffset, floorColor, wallColor, w=14, h=8, d=11 }) {
  const gradMap = useMemo(() => createGradientMap(), [])
  const floorMat = useMemo(() => new THREE.MeshToonMaterial({ color: floorColor, gradientMap: gradMap }), [floorColor])
  const wallMat  = useMemo(() => new THREE.MeshToonMaterial({ color: wallColor,  gradientMap: gradMap }), [wallColor])
  return (
    <group position={[0, 0, zOffset]}>
      {/* Floor */}
      <mesh receiveShadow position={[0, -0.075, 0]}>
        <boxGeometry args={[w, 0.15, d]} />
        <primitive object={floorMat} />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow position={[0, h/2, -d/2]}>
        <boxGeometry args={[w, h, 0.2]} />
        <primitive object={wallMat} />
      </mesh>
      {/* Left + Right walls */}
      ...
      {/* Ceiling */}
      ...
    </group>
  )
}

1. Crea src/components/world/rooms/HomeRoom.tsx:
   
   Ambiente esterno (NO RoomBox — è all'aperto):
   - Terrain: BoxGeometry [50, 0.3, 30] colore green 0x5D8A3C, position [0,-0.15,-5]
   - 5-6 colline: SphereGeometry r variabile (2.5-4.5), posizioni sparse z < -8
     Colore alternato tra greenDeep 0x3A5C20 e green 0x5D8A3C
   - Path: BoxGeometry [2, 0.05, 12], colore paper 0xF4EDD8, al centro
   - Building entrance: BoxGeometry [8, 5, 0.5], position [0, 2.5, -8], paper-warm
   - Door: BoxGeometry [1.5, 2.8, 0.6], position [0, 1.4, -8], wood 0x4A3018
   - 2 Windows on building: BoxGeometry [1.2, 1.2, 0.3], skyGolden 0xF5A623
   - 4 alberi: cylinder (tronco) + sphere (chioma greenDeep)
   
   Punto luce ambientale: PointLight color 0xFFF0A0, intensity 0.8, position [0, 5, 3]
   
   NESSUN oggetto interattivo in HomeRoom (il click porta a musica stanza).

2. Crea src/components/world/rooms/MusicRoom.tsx:
   
   Usa <RoomBox> con floor woodLight 0x6B4C2A, walls paperWarm 0xEDE0C4, zOffset=-18
   
   Oggetti:
   A) Finestra sinistra (hole nel muro sinistro):
      - Frame: BoxGeometry [2.5, 3, 0.4] wood, position [-6.9, 3.5, -19]
      - Glass: BoxGeometry [2.2, 2.7, 0.05], MeshBasicMaterial skyGolden opacity 0.6
      - PointLight warm through window: color 0xF7C842, intensity 2.5, position [-5, 4, -19]
   
   B) Scrivania: BoxGeometry [5, 0.15, 2], wood, position [0, 1.8, -18.5]
      + 4 gambe: CylinderGeometry (thin), wood
   
   C) MacBook (OGGETTO INTERATTIVO → panel 'tracklist'):
      - Base: BoxGeometry [2, 0.08, 1.4], color 0x2a2a2a
      - Screen: BoxGeometry [2, 1.3, 0.06], color 0x1a1a1a, rotazione -0.2 rad X
      - Display: BoxGeometry [1.8, 1.1, 0.01], MeshBasicMaterial 0x111111
      - Group position [−0.5, 1.88, -18.3]
      - onClick su mesh base/screen: stopPropagation, openPanel('tracklist')
      - onPointerOver: setHovered('tracklist'), cursor pointer
   
   D) Due speaker: BoxGeometry [0.8, 1.2, 0.6], color 0x1a1a1a
      + cone frontale: CylinderGeometry, 0x333333, posizioni [-2.5, 2.65, -18.5] e [2.2, 2.65, -18.5]
   
   E) Vinile sul muro (OGGETTO INTERATTIVO → panel 'album'):
      - CylinderGeometry (disc) r=0.9, height 0.05, color 0x111111
      - Centro cerchio: CylinderGeometry r=0.2, sunCore 0xF7C842
      - Position [3, 4.5, -23.3], rotation.x = π/2
      - onClick: openPanel('album')
   
   F) PointLight stanza: color 0xFFF0A0, intensity 1.5, position [0, 7, -18]
   
   G) Pianta angolo: CylinderGeometry (vaso) terracotta 0xC67A52 + Sphere r=0.8 green 0x5D8A3C
      Position [-5, 0.8, -21]
```

**✅ CHECKPOINT 2.2**
- [ ] HomeRoom visibile quando currentRoom === 0
- [ ] MusicRoom visibile quando currentRoom === 1 (navigare con freccia destra)
- [ ] MacBook è cliccabile (openPanel chiamato)
- [ ] Vinile è cliccabile
- [ ] Nessun errore TypeScript
- [ ] Luci calde nella stanza musica (finestra sinistra con luce gialla)

---

## PROMPT 2.3 — StageRoom, ArchiveRoom, MerchRoom

```
[CONTEXT BLOCK]
HomeRoom e MusicRoom funzionanti. Sprint 2.2 completato.

TASK: Crea le ultime 3 stanze. Segui gli stessi pattern di MusicRoom.

1. Crea src/components/world/rooms/StageRoom.tsx (zOffset = -36):
   
   NON usa RoomBox — ambiente aperto scuro.
   
   A) Background scuro: BoxGeometry [20, 14, 0.5], MeshBasicMaterial 0x0d0905, pos [0,7,-44]
   B) Stage platform: BoxGeometry [14, 0.8, 8], woodLight 0x6B4C2A, pos [0, 0.4, -37]
      castShadow, receiveShadow
   C) Sipari laterali: BoxGeometry [2, 10, 0.3], red-warm 0xC0392B, pos [-7.5, 5, -40] e [7.5, 5, -40]
   D) 3 spot beam (coni con MeshBasicMaterial transparent):
      Posizioni: [-4,10,-34], [0,10,-34], [4,10,-34]
      Il centrale usa color sunCore 0xF7C842 — è Il Sole come faro
      Cono: ConeGeometry r variabile, height 8, rotazione X π (punta verso il basso)
      PointLight per ogni spot
   E) Mic stand: CylinderGeometry r 0.04, height 3.5, color 0x555555, pos [0,1.75,-36]
      Mic head: SphereGeometry r=0.22, 0x666666
   F) Monitor a terra (floor monitors): 2x BoxGeometry inclinati, 0x1a1a1a
   G) OGGETTO INTERATTIVO — distributore biglietti:
      BoxGeometry [1, 0.8, 0.5], paperWarm 0xEDE0C4, pos [-4, 1.2, -37]
      onClick → openPanel('dates')
   H) PointLight minima ambient per stanza scura: 0x1a1005, intensity 0.3

2. Crea src/components/world/rooms/ArchiveRoom.tsx (zOffset = -54):
   
   Usa RoomBox floor cork 0xC19A6B, walls corkDark 0xA0784A
   
   A) 8-10 polaroid sulla parete posteriore:
      Ogni polaroid = group:
        - Frame: BoxGeometry [1.6, 2, 0.06], whiteNat 0xFDFAF4
        - Photo area: BoxGeometry [1.3, 1.3, 0.07], colore casuale dal palette
        - Pin: SphereGeometry r=0.08, red 0xD93025, position top-center
        - Rotation z casuale ±0.1 rad (diverso per ogni polaroid)
      Posizioni distribuite sulla back wall (z = -59.5)
      Ogni polaroid: onClick → openPanel('photo-N')
   
   B) Mensola: BoxGeometry [12, 0.12, 0.8], wood, pos [0, 1.5, -58.5]
      6 oggetti sopra (libri/box varicolori)
   C) PointLight warm: 0xF5A623, intensity 1.5, pos [0, 7, -54]

3. Crea src/components/world/rooms/MerchRoom.tsx (zOffset = -72):
   
   Usa RoomBox floor wood 0x4A3018, walls woodLight 0x6B4C2A
   
   A) Counter top: BoxGeometry [9, 0.2, 2], wood, pos [0, 1.5, -72]
   B) Counter body: BoxGeometry [9, 1.5, 2], woodLight, pos [0, 0.75, -72]
   C) 5 product boxes sul counter (colori dal palette, altezze diverse)
      onClick → openPanel('merch')
   D) Insegna sopra: BoxGeometry [5, 1, 0.15], paper, pos [0, 5, -77]
      2 corde: CylinderGeometry thin, inkFaint
   E) PointLight warm: 0xFFF0A0, intensity 1.8, pos [0, 7, -72]
   F) Il Sole che fa capolino da una fessura nel soffitto (punto luce sunCore)

4. Aggiorna src/components/world/Scene.tsx:
   
   Importa e renderizza TUTTE le 5 stanze:
   <HomeRoom />
   <MusicRoom />
   <StageRoom />
   <ArchiveRoom />
   <MerchRoom />
```

**✅ CHECKPOINT 2.3**
- [ ] Tutte e 5 le stanze sono navigabili
- [ ] Stage ha l'atmosfera buia con fari colorati
- [ ] Archivio ha le polaroid sulla parete con pin rosso
- [ ] Merch ha il bancone di legno
- [ ] Tutti gli oggetti interattivi chiamano openPanel correttamente
- [ ] pnpm build senza errori

---

# SPRINT 3 — UI Overlay

## PROMPT 3.1 — Navbar e Navigazione

```
[CONTEXT BLOCK]
Tutte e 5 le stanze create. Sprint 2 completato.
Store: useWorldStore con setRoom, nextRoom, prevRoom.

TASK: Crea l'UI HTML React sopra il canvas 3D.

NON modificare nessun file in src/components/world/.

1. Crea src/components/ui/Navbar.tsx:
   
   - Position: fixed, top 16px, left 50%, transform translateX(-50%)
   - Background: #F4EDD8 opaco (NO trasparenza)
   - Border-radius asimmetrico: "1px 4px 3px 2px / 3px 1px 4px 2px"
   - box-shadow: 0 4px 20px rgba(0,0,0,0.35), 0 1px 0 #D9C9A8
   - Font: Caveat per tutti i link
   - Link attivo: color #D93025, border-bottom 2px solid #D93025
   - Hover: color #D93025
   - onClick su link → useWorldStore().setRoom(index)
   - z-index: 50

2. Crea src/components/ui/RoomNav.tsx:
   
   - Position: fixed, bottom 32px, left 50%, transform translateX(-50%)
   - Bottone ← (disabled se currentRoom === 0)
   - Dot indicators: 5 pill, quella attiva allargata e gialla con glow
   - Bottone → (disabled se currentRoom === 4)
   - Font frecce: Caveat, background carta, border-radius 50%
   - z-index: 50

3. Crea src/components/ui/RoomLabel.tsx:
   
   - Position: fixed, top 90px, left 40px
   - Numero stanza: Courier Prime, 0.7rem, rgba(244,237,216,0.5)
   - Nome stanza: Caveat Bold, 2rem, #FDFAF4, text-shadow per leggibilità
   - Fade: opacity 0 durante isTransitioning, opacity 1 dopo
   - z-index: 50

4. Crea src/components/ui/KeyboardHint.tsx:
   
   - Position: fixed, bottom 90px, right 24px
   - Testo: "← → naviga · click interagisci · esc chiudi"
   - Font: Courier Prime, 0.65rem, rgba(244,237,216,0.3)
   - z-index: 50

5. Aggiorna src/app/page.tsx per includere tutti i componenti UI:
   
   <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
     <World />
     <Navbar />
     <RoomNav />
     <RoomLabel />
     <KeyboardHint />
     <ContentPanel /> {/* aggiunto in Sprint 4 */}
   </div>

6. Aggiungi il keyboard listener (da useRoomNavigation.ts) in un useEffect nella page.tsx.
```

**✅ CHECKPOINT 3.1**
- [ ] Navbar visibile e cliccabile (navigazione funziona)
- [ ] Dots indicator aggiornano con la stanza
- [ ] Frecce ← → disabilitate ai bordi
- [ ] RoomLabel cambia con la stanza
- [ ] Frecce tastiera funzionano (← →)
- [ ] UI non copre oggetti interattivi importanti

---

# SPRINT 4 — Content Panels

## PROMPT 4.1 — Panel Tracklist e Album

```
[CONTEXT BLOCK]
UI overlay base funzionante. Sprint 3 completato.
Store: activePanel (string|null). Dati: tracklist.ts, ALBUM object.

TASK: Crea i pannelli di contenuto per musica.

1. Crea src/components/ui/ContentPanel.tsx:
   
   Shell del panel — wrappa tutti i content specifici.
   
   - Si mostra quando activePanel !== null
   - Backdrop: position fixed, inset 0, bg rgba(28,18,8,0.7), backdrop-filter blur(4px)
   - Click backdrop → closePanel()
   - Panel card: bg #F4EDD8, max-width min(560px,92vw), max-height 85vh, overflow-y auto
   - Border-radius asimmetrico, box-shadow dramatico
   - Header: bg #1C1208, titolo Caveat Bold sunCore, bottone ✕
   - Body: padding 28px
   - Al mount: focus sul bottone ✕ (accessibilità)
   - ESC key → closePanel()
   - aria-modal="true", role="dialog", aria-label={PANEL_TITLES[activePanel]}
   - Render child basato su activePanel:
     'tracklist' | 'album' → <TracklistPanel />
     'dates'               → <TourDatesPanel />
     'merch'               → <MerchPanel />
     'photo-N'             → <PhotoPanel id={activePanel} />

2. Crea src/components/ui/panels/TracklistPanel.tsx:
   
   - Copertina album (placeholder div giallo/arancio con Sole SVG inline se immagine manca)
   - Nome album: Playfair Display Bold
   - CTA Spotify: button verde #1DB954, apre in nuova tab
     href: "https://open.spotify.com/intl-it/album/0Ubx6rC0UAtiu2Mcl6M6F5"
   - Lista 11 tracce da tracklist.ts
   - Stile righe identico a specifiche DESIGN.md:
     numero Courier Prime inkFaint, titolo Caveat, highlight rossa per traccia 7
   - La traccia 7 ("Il Sole è Rosso") ha transform rotate(-0.5deg) + color #D93025

3. Crea src/components/ui/panels/SpotifyEmbed.tsx:
   
   - iframe Spotify album embed
   - src: "https://open.spotify.com/embed/album/0Ubx6rC0UAtiu2Mcl6M6F5?utm_source=generator&theme=0"
   - loading="lazy", title="Ascolta Il Sole è Rosso"
   - Fallback se non carica: "Oggi il giradischi è rotto. → Apri su Spotify"
```

**✅ CHECKPOINT 4.1**
- [ ] Click sul MacBook → apre TracklistPanel
- [ ] 11 tracce nell'ordine corretto
- [ ] Traccia 7 è evidenziata in rosso
- [ ] Link Spotify URL corretto
- [ ] ESC chiude il panel
- [ ] Focus va sul ✕ al mount del panel
- [ ] Click fuori dal panel (sul backdrop) chiude

---

## PROMPT 4.2 — Panel Tour Dates, Merch, Foto

```
[CONTEXT BLOCK]
TracklistPanel funzionante. Sprint 4.1 completato.
Dati: tourDates.ts (placeholder vuoto, hasDates = false).

TASK: Crea i rimanenti pannelli di contenuto.

1. Crea src/components/ui/panels/TourDatesPanel.tsx:
   
   Se hasDates === true:
     Lista date con TicketCard component (stile biglietto fisico)
     TicketCard layout: [DATA] | [CITTÀ — VENUE] | [Biglietti →]
     Separatore dashed tra colonne
     Stato soldOut: timbro ESAURITO ruotato -12deg, border rosso
   
   Se hasDates === false:
     Testo grande Caveat: "L'estate si sta preparando."
     SVG inline del palco vuoto con faro acceso (solo il centro, nessuna sagoma)
     NewsletterForm (vedi sotto)
   
   NewsletterForm:
     React Hook Form + Zod validation
     Input email con label associata (id + htmlFor)
     Errori con role="alert"
     Success: "Ti faremo sapere." + Sole SVG che sorride
     Per ora: submit fa solo console.log (integrazione newsletter futura)

2. Crea src/components/ui/panels/MerchPanel.tsx:
   
   - Sole SVG inline grande, sleepy expression
   - Titolo Caveat: "In arrivo."
   - Descrizione Lora: "Qualcosa di fisico sta arrivando..."
   - NewsletterForm (riusa componente)
   - NON mostrare prodotti immaginari, prezzi, o mockup

3. Crea src/components/ui/panels/PhotoPanel.tsx:
   
   Props: { id: string } (es. "photo-3")
   
   - Simula una foto polaroid ingrandita
   - Background della foto: colore placeholder basato sull'id
   - Caption: Caveat, scritta a mano
   - Navigazione: bottone prev/next tra le foto (cambia activePanel)
   - Contatore: "3 di 8" — Courier Prime
   - Al prev/next: il panel si aggiorna (no close/reopen)
```

**✅ CHECKPOINT 4.2**
- [ ] TourDatesPanel mostra stato vuoto con "L'estate si sta preparando."
- [ ] TicketCard ha layout griglia 3 colonne
- [ ] ESAURITO appare inclinato con border rosso
- [ ] MerchPanel NON ha prodotti immaginari
- [ ] PhotoPanel naviga tra le foto con prev/next
- [ ] Tutti i form hanno label associate e role="alert" sugli errori

---

# SPRINT 5 — Loader, SEO, Deploy

## PROMPT 5.1 — Loader e 404

```
[CONTEXT BLOCK]
Tutte le stanze e panel funzionanti. Sprint 4 completato.

TASK: Crea il loader narrativo e la pagina 404.

1. Crea src/components/ui/SolLoader.tsx:
   
   Il loader è parte dell'esperienza narrativa, NON uno spinner.
   
   - Full-screen, background #0d0905 (quasi-nero)
   - Al centro: Il Sole SVG 2D (non Three.js) con occhi calmi
     Animazione CSS: sunRise (sale da sotto) 1.5s ease-out
   - Testo sotto: "il sole sta sorgendo..." — Caveat, color #7A6548
   - Barra di progresso: linea orizzontale che si riempie come un raggio di sole
     Color #F7C842, border-radius pill, shadow glow giallo
   - Quando caricamento completo: opacity 0 → 1 del canvas, opacity 1 → 0 del loader (crossfade)
   - Minimo 1.5s di display (anche se caricamento più rapido — per l'esperienza)

2. Crea src/app/not-found.tsx:
   
   - Full-screen, background #F4EDD8
   - Il Sole SVG 2D grande (180px), espressione 'sad' (occhi abbassati, sopracciglia)
   - Testo principale Caveat Bold: "Questa stanza non esiste ancora."
   - Testo secondario Lora: "Forse ti sei perso nel buio."
   - CTA btn-primary: "Torna alla luce →" → href="/"
   - NON usare Three.js qui (solo SVG 2D) — evita hydration errors
   - aria-label sul CTA: "Torna alla home di iosonogabriele"

3. Aggiorna src/app/layout.tsx con metadata:
   
   export const metadata: Metadata = {
     title: { default: 'iosonogabriele', template: '%s — iosonogabriele' },
     description: 'Il Sole è Rosso — album e tour estivo 2025. Entra nel mondo 3D di iosonogabriele.',
     openGraph: {
       type: 'website', locale: 'it_IT',
       url: 'https://iosonogabriele.it', siteName: 'iosonogabriele',
       images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
     },
   }
```

**✅ CHECKPOINT 5.1**
- [ ] Loader appare durante il caricamento Three.js
- [ ] Loader non dura meno di 1.5s
- [ ] Crossfade loader → scena 3D
- [ ] 404 non usa Three.js
- [ ] Metadata esportati da layout.tsx

---

## PROMPT 5.2 — Ottimizzazione e Deploy

```
[CONTEXT BLOCK]
Tutto funzionante. Pronto per ottimizzazione finale.

TASK: Verifica performance e deploya.

1. pnpm build — correggi tutti gli errori prima di procedere.

2. Lighthouse audit (Chrome DevTools) su http://localhost:3000:
   Target: Performance ≥ 80, Accessibility = 100, SEO ≥ 90
   
   Problemi comuni Three.js + fix:
   - Texture grandi → usare KTX2 o WebP max 1024px
   - Bundle size → verificare tree-shaking: import { ... } from 'three'
   - FCP lenta → il SolLoader deve apparire < 0.5s (è HTML/CSS puro, non 3D)

3. Verifica accessibilità keyboard:
   [ ] Tab dalla cima della pagina: Navbar riceve focus
   [ ] ← → da tastiera navigano le stanze
   [ ] Click su oggetto 3D (o Tab quando panel aperto): focus va al panel
   [ ] ESC chiude panel e riporta focus sull'elemento canvas
   [ ] Tutti i bottoni del panel sono raggiungibili con Tab

4. Crea .env.example:
   NEXT_PUBLIC_SITE_URL=https://iosonogabriele.it

5. Deploy Vercel:
   vercel --prod
   (oppure push su GitHub + import su vercel.com)
   
   Settings Vercel:
   - Framework: Next.js (auto-detect)
   - Build: pnpm build
   - Output: .next
   - Node: 18.x
```

**✅ CHECKPOINT FINALE**
- [ ] pnpm build senza errori
- [ ] Sito live su URL Vercel
- [ ] Navigazione 3D funziona su mobile reale
- [ ] Tutti e 5 i panel si aprono e chiudono
- [ ] Lighthouse Accessibility = 100

---

# APPENDICE — Prompt Manutenzione

## PROMPT M.1 — Aggiungere Modelli 3D da Blender

```
[CONTEXT BLOCK]
Sito live. L'illustratore ha consegnato i modelli .glb da Blender.

TASK: Sostituisci la geometria procedurale con modelli GLTF.

1. Copia i .glb in public/models/
2. Usa useGLTF di @react-three/drei:
   const { scene } = useGLTF('/models/music-studio.glb')
3. Assicurati che i materiali del modello usino MeshToonMaterial
   (Se i materiali del modello sono MeshStandardMaterial, sostituiscili al load)
4. userData sulle mesh interattive deve corrispondere agli id esistenti nel worldStore
5. Testa click/hover dopo sostituzione
```

## PROMPT M.2 — Aggiungere Date Tour Reali

```
Aggiorna src/data/tourDates.ts con le date confermate.
Formato ISO 8601. isAnnounced: true per date visibili.
Verifica che hasDates diventi true e TourDatesPanel mostri le card.
```

---

*PROMPTS.md v2.0 — Stack Three.js · iosonogabriele.it*
