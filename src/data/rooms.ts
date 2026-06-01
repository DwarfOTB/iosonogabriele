export type SunExpression = 'calm' | 'happy' | 'curious' | 'sleepy' | 'sad'

export interface RoomConfig {
  id: string
  label: string
  navLabel: string

  // Atmosphere
  sunExpression: SunExpression
  fogColor: string      // hex — canvas background color
  ambientTint: string   // hex — ambient light color tint
  fogDensity: number    // 0.004–0.008

  // Stage surfaces
  wallColor: string     // hex — back wall + side walls
  floorColor: string    // hex
  ceilingColor: string  // hex
  hasCeiling: boolean   // false for open-sky rooms (Live, Home exterior)

  // UI identity
  accentColor: string   // hex — RoomNav dot + Navbar active underline

  // Content references
  posterImages: string[] // filenames in public/images/posters/
}

// Fixed camera — NEVER moves between rooms.
// z=6.6 brings the POV close to the set so interiors don't read as empty.
// Live curtains/valance lowered slightly in StageRoom to stay in frame. fov 57.
export const STAGE_CAMERA = {
  position: [0, 1.6, 6.6] as [number, number, number],
  lookAt:   [0, 1.6, 0] as [number, number, number],
  fov: 57,
}

export const TOTAL_ROOMS = 5

export const ROOMS: RoomConfig[] = [
  {
    id: 'home',
    label: 'Home',
    navLabel: 'home',
    sunExpression: 'calm',
    fogColor: '#C8D8E8',
    ambientTint: '#FFF4E0',
    fogDensity: 0.004,
    wallColor: '#D6C9A0',
    floorColor: '#7A9A50',
    ceilingColor: '#87CEEB',
    hasCeiling: false,
    accentColor: '#5D8A3C',
    posterImages: [],
  },
  {
    id: 'musica',
    label: 'Studio Musica',
    navLabel: 'musica',
    sunExpression: 'curious',
    fogColor: '#F0E8D0',
    ambientTint: '#FFF8E7',
    fogDensity: 0.005,
    wallColor: '#EDE0C4',
    floorColor: '#6B4C2A',
    ceilingColor: '#D9C9A8',
    hasCeiling: true,
    accentColor: '#F7C842',
    posterImages: [],
  },
  {
    id: 'live',
    label: 'Live',
    navLabel: 'live',
    sunExpression: 'happy',
    fogColor: '#0d0905',
    ambientTint: '#1a1005',
    fogDensity: 0.008,
    wallColor: '#0d0905',
    floorColor: '#6B4C2A',
    ceilingColor: '#0d0905',
    hasCeiling: false,
    accentColor: '#D93025',
    posterImages: [],
  },
  {
    id: 'archivio',
    label: 'Archivio',
    navLabel: 'archivio',
    sunExpression: 'calm',
    fogColor: '#C19A6B',
    ambientTint: '#F5A623',
    fogDensity: 0.006,
    wallColor: '#A0784A',
    floorColor: '#8A6230',
    ceilingColor: '#8A6840',
    hasCeiling: true,
    accentColor: '#C19A6B',
    posterImages: [],
  },
  {
    id: 'merch',
    label: 'Merch',
    navLabel: 'merch',
    sunExpression: 'sleepy',
    fogColor: '#2A1E0E',
    ambientTint: '#FFF0A0',
    fogDensity: 0.007,
    wallColor: '#6B4C2A',
    floorColor: '#4A3018',
    ceilingColor: '#3A2210',
    hasCeiling: true,
    accentColor: '#F5A623',
    posterImages: [],
  },
]
