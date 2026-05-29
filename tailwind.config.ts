// Tailwind v4 is installed — primary config lives in src/app/globals.css via @theme.
// This file exists for IDE tooling reference only.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sun: { core: '#F7C842', warm: '#F5A623', deep: '#E07B2A' },
        red: { primary: '#D93025', warm: '#C0392B', muted: '#8B2E22' },
        paper: { DEFAULT: '#F4EDD8', warm: '#EDE0C4', dark: '#D9C9A8' },
        ink: { DEFAULT: '#1C1208', soft: '#3D2E1A', faint: '#7A6548' },
        wood: { DEFAULT: '#4A3018', light: '#6B4C2A' },
      },
      fontFamily: {
        handwriting: ['Caveat', 'cursive'],
        display: ['Playfair Display', 'serif'],
        body: ['Lora', 'serif'],
        mono: ['Courier Prime', 'monospace'],
      },
    },
  },
}

export default config
