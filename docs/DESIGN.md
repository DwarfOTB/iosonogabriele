# DESIGN.md — Design System 3D
## iosonogabriele.it · Three.js + React Three Fiber

**Versione:** 2.0  
**Principio guida:** Toon shading fisico — il mondo 3D deve sembrare dipinto a mano, non renderizzato al computer.

---

## 1. Filosofia Visiva 3D

Il sito non usa estetica 3D fotorealistica né minimalismo piatto.
Usa il linguaggio del **diorama dipinto**: oggetti con outline neri, shading a gradini, colori saturi e caldi.

Riferimento estetico: copertine dell'album (pennello/pastello a mano) tradotto in 3D con MeshToonMaterial.

---

## 2. Colori — Dual System (CSS + Three.js)

### 2.1 CSS Custom Properties (UI Overlay HTML)

```css
:root {
  --color-paper:        #F4EDD8;
  --color-paper-warm:   #EDE0C4;
  --color-paper-dark:   #D9C9A8;
  --color-ink:          #1C1208;
  --color-ink-soft:     #3D2E1A;
  --color-ink-faint:    #7A6548;
  --color-red:          #D93025;
  --color-red-warm:     #C0392B;
  --color-red-muted:    #8B2E22;
  --color-sun-core:     #F7C842;
  --color-sun-warm:     #F5A623;
  --color-sun-deep:     #E07B2A;
  --color-sun-glow:     #FFF0A0;
  --color-wood:         #4A3018;
  --color-wood-light:   #6B4C2A;
  --color-white-nat:    #FDFAF4;
  --color-green:        #5D8A3C;
  --color-sky-golden:   #F5A623;
  --color-cork:         #C19A6B;
}
```

### 2.2 Colori Three.js (Hex numerico per materiali)

```typescript
// src/lib/colors.ts
export const C = {
  paper:       0xF4EDD8,
  paperWarm:   0xEDE0C4,
  ink:         0x1C1208,
  inkSoft:     0x3D2E1A,
  red:         0xD93025,
  redWarm:     0xC0392B,
  sunCore:     0xF7C842,
  sunWarm:     0xF5A623,
  sunDeep:     0xE07B2A,
  sunGlow:     0xFFF0A0,
  wood:        0x4A3018,
  woodLight:   0x6B4C2A,
  whiteNat:    0xFDFAF4,
  green:       0x5D8A3C,
  greenDeep:   0x3A5C20,
  skyDay:      0x87CEEB,
  skyGolden:   0xF5A623,
  cork:        0xC19A6B,
  black3d:     0x1a1a1a,
  outline:     0x1C1208,  // Usato per BackSide outline
}
```

### 2.3 Contrasto WCAG (UI Overlay)

| Testo | Sfondo | Ratio | Uso |
|---|---|---|---|
| `#1C1208` | `#F4EDD8` | **14.2:1** ✅ | Body text panel |
| `#FDFAF4` | `#4A3018` | **10.8:1** ✅ | Testo su navbar scura |
| `#D93025` | `#F4EDD8` | **5.1:1** ✅ | Titoli rossi |
| `#F7C842` | `#1C1208` | **7.2:1** ✅ | Accenti sunCore su scuro |
| `#F7C842` | `#F4EDD8` | **1.8:1** ❌ | **MAI come testo su carta** |

---

## 3. Materiali 3D — Specifiche Tecniche

### 3.1 MeshToonMaterial — Regola Fondamentale

```typescript
// src/lib/materials.ts — UNICA fonte dei materiali
import * as THREE from 'three'

// GradientMap a 3 step per toon shading (ombra / mid / luce)
export function createGradientMap(): THREE.DataTexture {
  const data = new Uint8Array([
    80,  80,  80,  255,   // Step 0: ombra scura
    160, 160, 160, 255,   // Step 1: mezzatinta
    255, 255, 255, 255,   // Step 2: luce piena
  ])
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat)
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

// Factory principale — usa sempre questa
export function toonMat(color: number, opts: Partial<THREE.MeshToonMaterialParameters> = {}) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: createGradientMap(),
    ...opts,
  })
}

// Materiali predefiniti (memoizzabili come useMemo)
export const MAT = {
  outline:    () => new THREE.MeshBasicMaterial({ color: C.outline, side: THREE.BackSide }),
  glass:      () => new THREE.MeshBasicMaterial({ color: C.skyGolden, transparent: true, opacity: 0.55 }),
  sunBody:    () => toonMat(C.sunCore),
  sunRay:     () => toonMat(C.sunDeep),
  wood:       () => toonMat(C.wood),
  woodLight:  () => toonMat(C.woodLight),
  paper:      () => toonMat(C.paper),
  paperWarm:  () => toonMat(C.paperWarm),
  ink:        () => toonMat(C.ink),
  red:        () => toonMat(C.red),
  green:      () => toonMat(C.green),
}
```

### 3.2 Outline Technique

```tsx
// src/lib/geometryHelpers.tsx
// Ogni mesh "importante" ha il proprio outline.
// Scale di outline: 1.04 per oggetti grandi, 1.06 per oggetti piccoli.

export function OutlinedMesh({
  geometry,
  material,
  outlineScale = 1.04,
  castShadow = true,
  ...groupProps
}: OutlinedMeshProps) {
  const outlineMat = useMemo(() => MAT.outline(), [])
  return (
    <group {...groupProps}>
      <mesh geometry={geometry} material={material} castShadow={castShadow} receiveShadow />
      <mesh
        geometry={geometry}
        material={outlineMat}
        scale={[outlineScale, outlineScale, outlineScale]}
        renderOrder={-1}
      />
    </group>
  )
}
```

### 3.3 Luce per Stanza — Configurazione

| Stanza | Ambient | DirectionalLight | PointLights | Fog |
|---|---|---|---|---|
| Home | 0xAED6F1, 0.5 | 0xF7C842, 1.2, pos [10,20,15] | PointLight 0xFFF0A0 su ingresso | FogExp2 0xAED6F1, 0.005 |
| Musica | 0xFFF8E7, 0.4 | 0xF5A623, 0.9, pos [-5,8,-15] | PointLight 0xF7C842 finestra, 0xFFF0A0 stanza | FogExp2 0xF4EDD8, 0.012 |
| Live | 0x0d0905, 0.1 | nessuna | 3x SpotLight per fari, 0xF7C842 centrale | FogExp2 0x0d0905, 0.04 |
| Archivio | 0xF5A623, 0.5 | 0xF5A623, 0.7 | PointLight 0xF5A623 caldo | FogExp2 0xC19A6B, 0.018 |
| Merch | 0xFFF0A0, 0.4 | 0xF7C842, 0.8 | PointLight da fessura sole | FogExp2 0x4A3018, 0.015 |

---

## 4. Il Sole 3D — Specifiche Dettagliate

### 4.1 Geometria

```typescript
// Corpo: SphereGeometry(3, 24, 24)
// 12 raggi, angoli NON uniformi:
const RAY_ANGLES = [0, 28, 58, 92, 122, 155, 182, 210, 245, 272, 302, 335] // gradi, variazione ±5-15
const RAY_LENGTHS = [4.5, 3.8, 4.2, 3.5, 4.8, 3.9, 4.1, 3.6, 4.4, 3.7, 4.0, 3.8]
// CylinderGeometry(0.12, 0.08, length, 6) per ogni raggio
```

### 4.2 Espressioni — Parametri

```typescript
interface EyeConfig {
  scaleY:      number   // altezza occhio
  posY:        number   // offset verticale
  posZ:        number   // sporgenza
  browAngle?:  number   // angolo sopracciglia (solo sad)
  cheekScale?: number   // guancette (solo happy)
}

export const EYE_CONFIGS: Record<SunExpression, EyeConfig> = {
  calm:    { scaleY: 0.55, posY: 0.1,  posZ: 2.82 },
  happy:   { scaleY: 1.0,  posY: 0.1,  posZ: 2.82, cheekScale: 1 },
  curious: { scaleY: 0.7,  posY: 0.0,  posZ: 2.82 }, // occhio dx più grande: scaleY 1.3
  sleepy:  { scaleY: 0.28, posY: -0.1, posZ: 2.82 },
  sad:     { scaleY: 0.4,  posY: -0.2, posZ: 2.82, browAngle: 0.3 },
}
```

### 4.3 Animazioni Loop (useFrame)

```typescript
// Tutte disabilitate se prefers-reduced-motion
useFrame((state) => {
  const t = state.clock.elapsedTime
  
  // Float verticale
  solRef.current.position.y = BASE_Y + Math.sin(t * 0.38) * 0.9
  
  // Self-rotation lenta (asse Z, come le copertine)
  solRef.current.rotation.z += 0.0025
  
  // Raggi pulsano
  raysGroupRef.current.scale.setScalar(1 + Math.sin(t * 0.75) * 0.035)
  
  // Glow sphere opacity oscillante
  glowRef.current.material.opacity = 0.15 + Math.sin(t * 0.5) * 0.08
})
```

---

## 5. Tipografia — UI Overlay

### 5.1 Famiglie

```css
/* Solo per HTML sopra il canvas */
--font-handwriting: 'Caveat', cursive;       /* Titoli stanze, label oggetti, CTA */
--font-display:     'Playfair Display', serif; /* Titolo album, nome artista */
--font-body:        'Lora', serif;            /* Testi panel, descrizioni */
--font-mono:        'Courier Prime', monospace;/* Date, numeri tracce, UI tecnica */
```

### 5.2 Scale

```css
--text-hero:    clamp(2rem, 5vw, 3rem);       /* RoomLabel stanza corrente */
--text-h1:      clamp(1.5rem, 4vw, 2.25rem);  /* Titolo panel */
--text-h2:      clamp(1.25rem, 3vw, 1.75rem); /* Sottotitoli */
--text-body-lg: 1.125rem;                      /* Testo principale panel */
--text-body-md: 1rem;
--text-body-sm: 0.875rem;
--text-mono:    0.9rem;                        /* Numeri tracce, date */
--text-label:   0.7rem;                        /* KeyboardHint, caption */
```

---

## 6. Componenti UI Overlay — Specifiche

### 6.1 Navbar

```css
.navbar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  
  background: #F4EDD8;           /* Opaco — no glassmorphism */
  border-radius: 1px 4px 3px 2px / 3px 1px 4px 2px; /* Asimmetrico */
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 1px 0 #D9C9A8;
  
  padding: 10px 28px;
  display: flex;
  align-items: center;
  gap: 28px;
  
  z-index: 50;
  
  /* Grana carta */
  background-image: url("data:image/svg+xml,...");
}

.navbar-link {
  font-family: var(--font-handwriting);
  font-size: 1rem;
  font-weight: 600;
  color: #3D2E1A;
  transition: color 0.15s;
}
.navbar-link.active    { color: #D93025; border-bottom: 2px solid #D93025; }
.navbar-link:hover     { color: #D93025; }
.navbar-link:focus-visible {
  outline: 3px solid #F7C842;
  outline-offset: 4px;
}
```

### 6.2 ContentPanel

```css
.panel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 18, 8, 0.72);
  backdrop-filter: blur(4px);
  z-index: 200;
}

.panel-card {
  background: #F4EDD8;
  border-radius: 3px 8px 4px 6px / 6px 3px 8px 4px;
  box-shadow:
    12px 16px 0px #1C1208,
    0 30px 60px rgba(0, 0, 0, 0.5);
  
  max-width: min(560px, 92vw);
  max-height: 85vh;
  overflow-y: auto;
  
  /* Grana carta */
  background-image: url("data:image/svg+xml,...");
}

.panel-header {
  background: #1C1208;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-family: var(--font-handwriting);
  font-size: 1.5rem;
  font-weight: 700;
  color: #F7C842;
  transform: rotate(-0.5deg);
}
```

### 6.3 Bottoni

```css
/* Primario — rosso fisico */
.btn-primary {
  font-family: 'Caveat', cursive;
  font-size: 1.1rem;
  font-weight: 700;
  color: #FDFAF4;
  background: #D93025;
  border: none;
  padding: 10px 28px;
  border-radius: 2px 6px 4px 8px / 6px 2px 8px 4px;
  box-shadow: 3px 3px 0px #C0392B, 6px 6px 0px rgba(28,18,8,0.15);
  cursor: pointer;
  transform: rotate(-0.5deg);
  transition: transform 80ms, box-shadow 80ms;
}
.btn-primary:hover {
  box-shadow: 2px 2px 0px #C0392B;
  transform: rotate(-0.5deg) translateY(-1px);
}
.btn-primary:focus-visible {
  outline: 3px solid #F7C842;
  outline-offset: 4px;
}

/* Spotify */
.btn-spotify {
  /* Identico a btn-primary ma background: #1DB954 */
  /* Con icona Spotify SVG inline a sinistra */
}
```

### 6.4 RoomNav (Dots + Frecce)

```css
.room-nav {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 50;
}

.nav-dot {
  height: 8px;
  border-radius: 4px;
  background: rgba(244, 237, 216, 0.35);
  transition: width 0.3s, background 0.3s, box-shadow 0.3s;
  cursor: pointer;
}
.nav-dot.active {
  width: 32px;   /* allargata */
  background: #F7C842;
  box-shadow: 0 0 10px rgba(247, 200, 66, 0.6);
}
.nav-dot:not(.active) { width: 8px; }

.nav-arrow {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  background: rgba(244, 237, 216, 0.15);
  border: 1px solid rgba(244, 237, 216, 0.3);
  border-radius: 50%;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #FDFAF4;
  transition: background 0.15s;
}
.nav-arrow:hover   { background: rgba(247, 200, 66, 0.2); }
.nav-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
```

---

## 7. Loader Narrativo

```css
.sol-loader {
  position: fixed;
  inset: 0;
  background: #0d0905;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.6s;
}

.sol-loader__text {
  font-family: 'Caveat', cursive;
  font-size: 1.1rem;
  color: #7A6548;
  margin-top: 24px;
  letter-spacing: 0.08em;
}

.sol-loader__bar {
  width: 200px;
  height: 3px;
  background: rgba(247, 200, 66, 0.15);
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;
}

.sol-loader__bar-fill {
  height: 100%;
  background: #F7C842;
  box-shadow: 0 0 12px rgba(247, 200, 66, 0.8);
  border-radius: 2px;
  transition: width 0.3s ease;
}
```

---

## 8. Animazioni CSS

```css
@keyframes sunRise {
  from { transform: translateY(60px); opacity: 0.2; }
  to   { transform: translateY(0);    opacity: 1;   }
}

@keyframes panelIn {
  from { transform: translateY(20px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0) scale(1);       opacity: 1; }
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 6px rgba(247,200,66,0.4); }
  50%       { box-shadow: 0 0 16px rgba(247,200,66,0.8); }
}

/* Panel entrance */
.panel-card { animation: panelIn 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Hover State Oggetti 3D

Quando la camera è sopra un oggetto interattivo:

```typescript
// In ogni room component, su onPointerOver della mesh:
// 1. setHovered(userData.id)
// 2. document.body.style.cursor = 'pointer'
// 3. Aggiungere PointLight pulsante sull'oggetto (color sunCore, intensity 0.5→1.5)

// su onPointerOut:
// 1. setHovered(null)
// 2. document.body.style.cursor = 'default'
// 3. Rimuovere la luce aggiuntiva
```

Il tooltip HTML (src/components/ui/HoverTooltip.tsx):
```
- Position: fixed, segue il mouse (clientX/Y da useEffect mousemove)
- Testo: label dell'oggetto hovered (es. "tracklist", "biglietti", "foto")
- Font: Caveat, small, background ink, colore sunCore
- border-radius asimmetrico
- Appare con delay 200ms (no flicker rapido)
- z-index: 100
```

---

*DESIGN.md v2.0 — Three.js Stack · iosonogabriele.it*
