# CLAUDE.md — Regole di Sviluppo
## iosonogabriele.it · Stack Three.js / React Three Fiber

**Leggi ogni sezione prima di scrivere qualsiasi codice.**

---

## 1. Identità del Progetto

Stai costruendo un **sito web 3D immersivo** per l'artista iosonogabriele.
Il sito è un mondo tridimensionale navigabile, NON un sito web tradizionale.

Ispirazione tecnica: jesse-zhou.com — stanze 3D isometriche, camera orbitale, oggetti cliccabili.

**Obiettivo estetico:** Toon shading + disegno a mano in 3D. Fisicità, calore, materiali percepibili.

---

## 2. Stack Tecnologico — Obbligatorio

```
Framework:         Next.js 14 — App Router
3D Engine:         Three.js via @react-three/fiber (R3F)
3D Helpers:        @react-three/drei
Camera Animation:  GSAP (@gsap/react o gsap standalone)
Post-processing:   @react-three/postprocessing
Stato globale:     Zustand
Overlay UI:        Tailwind CSS (HTML React sopra il canvas)
TypeScript:        Sì — strict mode
Package manager:   pnpm
Deploy:            Vercel
```

**Installazione dipendenze:**
```bash
pnpm add @react-three/fiber @react-three/drei three
pnpm add @react-three/postprocessing
pnpm add gsap @gsap/react
pnpm add zustand
pnpm add @types/three -D
```

---

## 3. Struttura Cartelle

```
src/
├── app/
│   ├── layout.tsx         # Font + metadata + wrapper
│   ├── page.tsx           # Entry point → carica <World />
│   └── not-found.tsx      # 404 — scena vuota con sole triste
│
├── components/
│   ├── world/             # Tutto il 3D
│   │   ├── World.tsx      # <Canvas> R3F root — unico canvas
│   │   ├── Scene.tsx      # Lights, fog, sky, camera setup
│   │   ├── Sol.tsx        # Il Sole 3D (personaggio persistente)
│   │   ├── CameraRig.tsx  # Gestione posizione camera + GSAP lerp
│   │   │
│   │   └── rooms/
│   │       ├── HomeRoom.tsx
│   │       ├── MusicRoom.tsx
│   │       ├── StageRoom.tsx
│   │       ├── ArchiveRoom.tsx
│   │       └── MerchRoom.tsx
│   │
│   ├── ui/                # HTML overlay (React puro, NON Three.js)
│   │   ├── Navbar.tsx     # Navbar flottante sopra canvas
│   │   ├── RoomNav.tsx    # Frecce + dot indicator
│   │   ├── ContentPanel.tsx # Panel contenuto al click oggetto
│   │   ├── TrackList.tsx
│   │   ├── TourDates.tsx
│   │   └── HoverTooltip.tsx
│   │
│   └── global/
│       └── fonts.tsx      # Google Fonts loader
│
├── store/
│   ├── worldStore.ts      # Stato mondo: room corrente, panel aperto, zoom target
│   └── sunStore.ts        # Stato Sole: espressione per stanza
│
├── hooks/
│   ├── useRoomNavigation.ts   # Logica navigazione stanze
│   ├── useObjectClick.ts      # Raycasting + click handler
│   └── useReducedMotion.ts
│
├── data/
│   ├── rooms.ts           # Config stanze (posizioni, camera, oggetti interattivi)
│   ├── tracklist.ts
│   ├── tourDates.ts
│   └── singles.ts
│
└── lib/
    ├── materials.ts       # Materiali Three.js riutilizzabili (toon, outline)
    ├── geometryHelpers.ts # Funzioni per creare forme comuni
    └── utils.ts
```

---

## 4. Regole Three.js / R3F — Critiche

### 4.1 Canvas Setup

```tsx
// src/components/world/World.tsx
// UN SOLO <Canvas> per tutta l'app. Mai creare canvas multipli.

import { Canvas } from '@react-three/fiber'

export default function World() {
  return (
    <Canvas
      camera={{ position: [4, 7, 10], fov: 55 }}
      shadows
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      frameloop="always"  // 'demand' quando scena statica (ottimizzazione futura)
    >
      <Scene />
    </Canvas>
  )
}
```

### 4.2 Materiali — MeshToonMaterial Obbligatorio

```tsx
// src/lib/materials.ts
// USA SEMPRE MeshToonMaterial per gli oggetti della scena.
// VIETATO: MeshStandardMaterial, MeshPhongMaterial per oggetti principali.

import * as THREE from 'three'

// Gradient map a 3 step per toon shading
export function createGradientMap(): THREE.DataTexture {
  const data = new Uint8Array([60, 60, 60, 255,  140, 140, 140, 255,  255, 255, 255, 255])
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat)
  tex.magFilter = tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

// Crea materiale toon — usa sempre questa funzione
export function toonMaterial(color: number, opts = {}): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: createGradientMap(),
    ...opts,
  })
}
```

### 4.3 Outline Technique (BackSide)

Per i contorni neri stile disegnato a mano, ogni mesh importante ha una copia BackSide leggermente scalata:

```tsx
// src/lib/geometryHelpers.ts
export function MeshWithOutline({ geometry, material, outlineScale = 1.04, ...props }) {
  return (
    <group {...props}>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh geometry={geometry} scale={[outlineScale, outlineScale, outlineScale]}>
        <meshBasicMaterial color={0x1C1208} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
```

### 4.4 Camera Rig — GSAP per Transizioni

```tsx
// src/components/world/CameraRig.tsx
// USA GSAP per animare la camera, NON THREE.lerp nel render loop.
// GSAP è più preciso e controllabile per transizioni definite.

import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useWorldStore } from '@/store/worldStore'

export function CameraRig() {
  const { camera } = useThree()
  const currentRoom = useWorldStore(s => s.currentRoom)
  const lookAtRef = useRef(new THREE.Vector3())

  useEffect(() => {
    const cfg = CAMERA_CONFIGS[currentRoom]
    
    // GSAP anima position
    gsap.to(camera.position, {
      x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2],
      duration: 1.4,
      ease: 'power2.inOut',
    })
    
    // GSAP anima lookAt (via oggetto intermedio)
    gsap.to(lookAtRef.current, {
      x: cfg.lookAt[0], y: cfg.lookAt[1], z: cfg.lookAt[2],
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(lookAtRef.current),
    })
  }, [currentRoom, camera])

  return null
}
```

### 4.5 Raycasting e Interazione

```tsx
// NON usare onClick direttamente su <mesh> in R3F per oggetti interattivi
// complessi. Usa useRaycaster con filterObjects esplicita.
// 
// PER oggetti semplici (un singolo mesh): onClick su <mesh> va bene.
// PER gruppi o logica complessa: custom raycaster.

// Esempio corretto:
<mesh
  onClick={(e) => {
    e.stopPropagation() // SEMPRE stopPropagation negli onClick 3D
    openPanel('tracklist')
  }}
  onPointerOver={() => setHovered('tracklist')}
  onPointerOut={() => setHovered(null)}
>
```

### 4.6 HTML Overlay (React sopra Three.js)

Gli overlay di contenuto (tracklist, date, ecc.) sono **HTML React puro**, non Three.js `<Html>` di Drei.

```tsx
// Layout: canvas 100vw/100vh in absolute, overlay HTML in absolute sopra
// 
// app/page.tsx:
// <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
//   <World />        {/* canvas assoluto */}
//   <Navbar />       {/* UI overlay assoluto */}
//   <RoomNav />      {/* frecce + dots */}
//   <ContentPanel /> {/* panel a comparsa */}
// </div>

// VIETATO usare <Html> di @react-three/drei per pannelli di contenuto grandi.
// <Html> di Drei è ok SOLO per tooltip piccoli e label 3D.
```

---

## 5. Store Zustand — Struttura

```typescript
// src/store/worldStore.ts
interface WorldState {
  currentRoom: number           // 0-4
  activePanel: string | null    // 'tracklist' | 'dates' | 'photo-X' | null
  hoveredObject: string | null  // userData.id dell'oggetto hovered
  isTransitioning: boolean      // camera in movimento
  zoomTarget: string | null     // oggetto verso cui la camera sta zoomando

  setRoom: (index: number) => void
  nextRoom: () => void
  prevRoom: () => void
  openPanel: (id: string) => void
  closePanel: () => void
  setHovered: (id: string | null) => void
  setTransitioning: (v: boolean) => void
}
```

---

## 6. Dati — Struttura Room Config

```typescript
// src/data/rooms.ts
export interface RoomConfig {
  id: string
  label: string
  zOffset: number          // Posizione Z nel mondo 3D
  cameraPos: [number, number, number]
  cameraLookAt: [number, number, number]
  sunExpression: 'calm' | 'happy' | 'curious' | 'sleepy' | 'sad'
  ambientColor: number     // THREE hex color
  fogColor: number
}

export const ROOMS: RoomConfig[] = [
  { id: 'home',     label: 'Home',    zOffset: 0,   cameraPos: [4,-3,6,-8], ... },
  { id: 'musica',   label: 'Musica',  zOffset: -18, ... },
  { id: 'live',     label: 'Live',    zOffset: -36, ... },
  { id: 'archivio', label: 'Archivio',zOffset: -54, ... },
  { id: 'merch',    label: 'Merch',   zOffset: -72, ... },
]
```

---

## 7. Performance — Regole

```
✅ useMemo per tutti i materiali e geometrie in componenti R3F
✅ useRef invece di useState per valori che cambiano ogni frame
✅ Separate geometrie condivise (stessa ref)
✅ castShadow/receiveShadow SOLO sugli oggetti che ne hanno bisogno
✅ Fog esponenziale: FogExp2 (non Fog lineare)
✅ dpr={[1, 2]} sul Canvas (non sopra 2)
✅ Dispose di geometry e material onUnmount

❌ MAI creare new THREE.Geometry() nel render loop
❌ MAI usare useState per posizioni 3D (usa useRef + mutation diretta)
❌ MAI importare tutto Three.js: import { ... } from 'three' (tree-shaking)
❌ MAI texture > 1024px senza compressione KTX2
```

---

## 8. Cosa NON Fare — Lista Proibiti

```
❌ MeshStandardMaterial per oggetti principali (usa MeshToonMaterial)
❌ Luci PointLight con shadow (costoso — usa DirectionalLight con shadow)
❌ onClick su <group> — mettilo su <mesh> singole o usa raycaster custom
❌ Creare il canvas fuori da World.tsx (un solo canvas)
❌ Animare con useFrame quando GSAP è sufficiente (performativamente)
❌ useFrame per logica non-rendering (usa eventi o Zustand)
❌ THREE.OrbitControls — implementare camera navigation custom con GSAP
❌ Font Inter/Roboto/Arial nell'overlay HTML (usa Caveat, Playfair, Lora)
❌ Glassmorphism nella navbar (background carta opaca)
❌ Spinner loading generici (il loader è parte dell'esperienza)
```

---

## 9. Loader — L'Esperienza di Caricamento

Il loader non è uno spinner. È narrativo:

```tsx
// Mentre la scena carica (Suspense fallback):
// - Il Sole SVG 2D (non Three.js) sorge lentamente
// - Testo: "il sole sta sorgendo..." in Caveat
// - Barra di progresso stile crack/raggi di sole
// - Transizione smooth a scena 3D quando pronta
```

---

## 10. Accessibilità in Ambiente 3D

```
✅ Ogni stanza ha un h1 visibile nell'overlay (per screen reader)
✅ aria-live="polite" sul pannello contenuto quando si apre
✅ Navigazione keyboard: ← → per stanze, Tab per elementi panel, Escape per chiudere
✅ Focus management: quando panel si apre, focus va al primo elemento interattivo
✅ prefers-reduced-motion: camera jump istantaneo (no lerp), sole statico
✅ Canvas ha aria-label="Mondo 3D interattivo di iosonogabriele"
✅ Alt text su immagini nell'overlay HTML
```

---

## 11. Checklist Pre-Commit

```
[ ] Nessun new THREE.* nel render loop o in componenti non-memoizzati
[ ] Tutti i materiali usano MeshToonMaterial
[ ] Camera transitions via GSAP (non lerp nel useFrame)
[ ] stopPropagation su tutti gli onClick 3D
[ ] prefers-reduced-motion gestito in CameraRig
[ ] Panel overlay ha aria-live e focus management
[ ] nessun console.log nel codice
[ ] pnpm build completa senza errori TypeScript
```

---

*CLAUDE.md v2.0 — Stack Three.js · iosonogabriele.it*
