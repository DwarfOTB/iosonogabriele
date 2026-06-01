// ─── Responsive 3D framing + shared screen projection ──────────────────────
// The Three.js camera uses a fixed VERTICAL fov, so on narrow (portrait)
// viewports the horizontal axis gets cropped. We instead "contain-fit" each
// room: guarantee a per-room world half-width (halfW) stays visible at any
// aspect by widening the fov (and, past a cap, pulling the camera back).
//
// The SAME math powers the transition overlay (Scenografi), so carried set
// pieces project to exactly where their real 3D objects sit, on every screen.

export interface RoomFrame {
  camZ: number      // baseline camera Z (desktop look)
  fov: number       // baseline vertical fov (desktop look)
  halfW: number     // world half-width that must stay visible
  contentZ: number  // representative depth used to map the width→fov
}

// Camera stays horizontal at y=1.6 looking to z=0 (matches the tuned desktop
// view). Only fov / camZ adapt to aspect.
export const CAM_Y = 1.6
export const LOOK_Y = 1.6
export const LOOK_Z = 0
const FOV_MAX = 78
// Portrait fill bias: <1 zooms in a touch so narrow screens aren't mostly
// empty (trims only the non-essential outer edges). 1 = strict contain.
const FILL = 0.86

export const ROOM_FRAMES: RoomFrame[] = [
  { camZ: 6.6, fov: 57, halfW: 7.4, contentZ: -2.5 }, // 0 Home
  { camZ: 6.6, fov: 57, halfW: 6.8, contentZ: -2.5 }, // 1 Music
  { camZ: 6.6, fov: 57, halfW: 7.0, contentZ: -3.0 }, // 2 Live
  { camZ: 6.6, fov: 57, halfW: 6.2, contentZ: -3.5 }, // 3 Archive
  { camZ: 6.6, fov: 57, halfW: 6.2, contentZ: -2.8 }, // 4 Merch
]

export interface CameraFit {
  fov: number
  camZ: number
  camY: number
  lookY: number
  lookZ: number
}

const d2r = (d: number) => (d * Math.PI) / 180
const r2d = (r: number) => (r * 180) / Math.PI

/** Contain-fit the room frame for a given viewport aspect (w/h). */
export function computeFit(room: number, aspect: number): CameraFit {
  const f = ROOM_FRAMES[room] ?? ROOM_FRAMES[0]
  const D = f.camZ - f.contentZ
  const baseHalfH = Math.tan(d2r(f.fov) / 2) * D
  // Vertical half-extent needed so the world half-width fits horizontally.
  const reqHalfH = Math.max(baseHalfH, (f.halfW * FILL) / Math.max(aspect, 0.0001))

  let fov = r2d(2 * Math.atan(reqHalfH / D))
  let camZ = f.camZ
  if (fov > FOV_MAX) {
    // Too wide → cap fov, pull the camera back to still fit everything.
    fov = FOV_MAX
    const Dneed = reqHalfH / Math.tan(d2r(FOV_MAX) / 2)
    camZ = f.contentZ + Dneed
  }
  return { fov, camZ, camY: CAM_Y, lookY: LOOK_Y, lookZ: LOOK_Z }
}

/** Project a world point to screen percentage (vw, vh). */
export function projectToScreen(
  x: number, y: number, z: number, fit: CameraFit, aspect: number
): { x: number; y: number } {
  const d = fit.camZ - z
  const k = Math.tan(d2r(fit.fov) / 2) * d
  const ndcX = x / (k * aspect)
  const ndcY = (y - fit.camY) / k
  return { x: 50 + 50 * ndcX, y: 50 - 50 * ndcY }
}

/** Project a world size to screen percentage (vw width, vh height) at depth z. */
export function projectSize(
  w: number, h: number, z: number, fit: CameraFit, aspect: number
): { w: number; h: number } {
  const d = fit.camZ - z
  const k = Math.tan(d2r(fit.fov) / 2) * d
  return { w: (w / (k * aspect)) * 100, h: (h / k) * 100 }
}
