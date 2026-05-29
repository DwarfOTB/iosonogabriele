# SETUP.md — Configurazione VS Code e Claude Code
## iosonogabriele.it · Stack Three.js / React Three Fiber

---

## 1. Prerequisiti

```bash
# Node.js (richiede ≥ 18.0)
node --version

# pnpm
npm install -g pnpm
pnpm --version   # deve essere ≥ 8.0

# Git
git --version
git config --global user.name "Il Tuo Nome"
git config --global user.email "email@example.com"
```

---

## 2. VS Code — Estensioni Necessarie

Installa da `View → Extensions` (Ctrl+Shift+X):

| Estensione | Autore | Perché |
|---|---|---|
| **Claude Code** | Anthropic | Il nostro strumento principale |
| **Three.js Snippets** | satorumurmur | Autocompletion Three.js |
| **Tailwind CSS IntelliSense** | Tailwind Labs | Classi CSS autocomplete |
| **Prettier** | Prettier | Formattazione automatica |
| **TypeScript Error Translator** | mattpocock | Errori TS leggibili |
| **GitLens** | Eric Amodio | Storia commit |

Crea `.vscode/settings.json` nella cartella del progetto:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    ".next": true,
    "node_modules": true
  }
}
```

---

## 3. Login Claude Code

1. Clicca icona **C** (Claude) nella sidebar VS Code
2. Clicca **"Sign in"**
3. Browser → accedi con account claude.ai
4. Torna a VS Code — sei connesso

Modello da usare: **claude-sonnet-4-6** (equilibrio qualità/velocità per questo progetto)

---

## 4. Setup Cartella Progetto

```bash
mkdir -p ~/dev/iosonogabriele
cd ~/dev/iosonogabriele

# Crea cartella docs con i file della documentazione
mkdir docs
# Copia qui: PRD.md, DESIGN.md, CLAUDE.md, PROMPTS.md, SETUP.md

git init

code .   # Apre VS Code nella cartella
```

---

## 5. Primo Prompt — Avvio Sviluppo

Nel terminale integrato di VS Code (`` Ctrl+` ``):

```bash
# Verifica di essere nella cartella giusta
pwd   # deve mostrare ~/dev/iosonogabriele

# Apri PROMPTS.md in VS Code per tenerlo di riferimento
# File → Open → docs/PROMPTS.md
```

Poi:
1. Apri il sidebar **Claude Code** (icona C)
2. Copia il **CONTEXT BLOCK** dall'inizio di PROMPTS.md
3. Copia il **PROMPT 1.1** subito sotto
4. Incolla entrambi in Claude Code → Enter

---

## 6. Comandi Frequenti

```bash
pnpm dev          # Dev server (tieni sempre aperto)
pnpm build        # Build di produzione (verifica prima di ogni deploy)
pnpm tsc --noEmit # Verifica TypeScript senza compilare
pnpm lint         # Linting ESLint

# Git
git add .
git commit -m "Sprint 2.1 — Canvas + Sole 3D"

# Se la scena Three.js non aggiorna dopo modifiche:
# Svuota .next/ e riavvia
rm -rf .next && pnpm dev
```

---

## 7. Debug Three.js in VS Code

### 7.1 Three.js Inspector (Browser)

Installa **Three.js devtools** da Chrome Web Store.
Apre un pannello per ispezionare la scena 3D (mesh, materiali, luci, camera) in tempo reale.

### 7.2 Stats.js per Performance

```tsx
// Aggiungi temporaneamente in World.tsx durante sviluppo:
import { Stats } from '@react-three/drei'

// Dentro <Canvas>:
<Stats />
```
Mostra FPS, MS per frame, MB memoria — rimuovi prima del deploy.

### 7.3 Errori Comuni Three.js

| Errore | Causa | Fix |
|---|---|---|
| "Cannot read properties of undefined (reading 'geometry')" | Mesh non ancora caricata | Wrappa in `<Suspense>` |
| "WebGL: INVALID_VALUE: uniform1i: no current program" | Materiale usato prima del mount | `useMemo` per materiali |
| Canvas bianco / nero | Nessuna luce o camera puntata male | Verifica `camera.lookAt` |
| FPS < 30 | Troppe shadow o geometrie | `castShadow` solo sugli oggetti principali |
| "ssr: false" warning | Three.js importato in server component | `dynamic(() => import(...), { ssr: false })` |

---

## 8. Workflow Sessione Tipo

```
1. Apri VS Code nella cartella progetto
2. Terminale → pnpm dev (lascia aperto in background)
3. Apri docs/PROMPTS.md in una tab VS Code
4. Apri Claude Code sidebar
5. Incolla CONTEXT BLOCK + prompt corrente
6. Attendi che Claude Code crei/modifichi i file
7. Verifica nel browser (localhost:3000) e in console
8. Leggi i CHECKPOINT del prompt — verifica tutti
9. git add . && git commit -m "Sprint X.Y — descrizione"
10. Procedi al prompt successivo
```

---

## 9. Checklist Pre-Deploy

```
[ ] pnpm build completa senza errori
[ ] pnpm tsc --noEmit senza errori TypeScript
[ ] Three.js Stats.js RIMOSSO (se era stato aggiunto)
[ ] console.log rimossi dal codice
[ ] Lighthouse: Performance ≥ 80, Accessibility = 100
[ ] Test su mobile reale (touch swipe tra stanze)
[ ] Tutti i link Spotify/Instagram/YouTube corretti
[ ] .env.local NON committato (.gitignore include .env*.local)
```

---

## 10. Deploy Vercel

```bash
# Installa Vercel CLI
npm i -g vercel

# Prima volta (autentica):
vercel login

# Deploy da cartella progetto:
vercel --prod

# Oppure: push su GitHub → importa su vercel.com
# Framework: Next.js (auto-detect)
# Build Command: pnpm build
```

---

*SETUP.md v2.0 — Stack Three.js · iosonogabriele.it*
