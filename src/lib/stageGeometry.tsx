'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

/** Rectangular opening in the back wall (wall-local x/y, world units). */
export interface WallOpening { x: number; y: number; w: number; h: number }
/** Rectangular opening in the ceiling (world x/z, since ceiling is horizontal). */
export interface CeilingOpening { x: number; z: number; w: number; d: number }

export interface StageBoxProps {
  wallColor: string
  floorColor: string
  ceilingColor: string
  hasCeiling?: boolean
  roomHeight?: number        // ceiling height (y). default 6
  backWindow?: WallOpening    // optional hole in back wall (sun behind)
  skylight?: CeilingOpening   // optional hole in ceiling (sun above)
  skyColor?: string           // glow panel behind openings. default warm dusk
}

// ─── Liminal-box dimensions ────────────────────────────────────────────
// No side walls. A wide back wall + generous floor + ceiling fill the whole
// frame so the camera never sees "outside" the set (square liminal space).
const BACK_Z   = -5.5
const BACK_W   = 30
const BACK_H   = 14
const WALL_CY  = 4          // back wall vertical center → spans y -3..11
const X_MIN    = -BACK_W / 2
const X_MAX    =  BACK_W / 2
const Y_MIN    = WALL_CY - BACK_H / 2  // -3
const Y_MAX    = WALL_CY + BACK_H / 2  // 11
const FLOOR_W  = 30
const FLOOR_D  = 24
const FLOOR_CZ = 2          // floor/ceiling spans z -10..14 (covers camera)

export function StageBox({
  wallColor,
  floorColor,
  ceilingColor,
  hasCeiling = true,
  roomHeight = 6,
  backWindow,
  skylight,
  skyColor = '#FBE3A2',
}: StageBoxProps) {
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.88, metalness: 0 }),
    [wallColor]
  )
  const floorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.92, metalness: 0 }),
    [floorColor]
  )
  const ceilMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ceilingColor, roughness: 0.80, metalness: 0 }),
    [ceilingColor]
  )
  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2E1F10', roughness: 0.7, metalness: 0.05 }),
    []
  )
  const glassMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: 0xCFE7F5, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1,
    }),
    []
  )
  const skyMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: skyColor }),
    [skyColor]
  )

  // Build the 4 back-wall segments around an opening (or one full plane).
  const backWallSegments = useMemo(() => {
    if (!backWindow) {
      return [{ w: BACK_W, h: BACK_H, x: 0, y: WALL_CY }]
    }
    const oxl = backWindow.x - backWindow.w / 2
    const oxr = backWindow.x + backWindow.w / 2
    const oyb = backWindow.y - backWindow.h / 2
    const oyt = backWindow.y + backWindow.h / 2
    const segs: { w: number; h: number; x: number; y: number }[] = []
    // Left
    segs.push({ w: oxl - X_MIN, h: BACK_H, x: (X_MIN + oxl) / 2, y: WALL_CY })
    // Right
    segs.push({ w: X_MAX - oxr, h: BACK_H, x: (oxr + X_MAX) / 2, y: WALL_CY })
    // Top (between opening sides)
    segs.push({ w: backWindow.w, h: Y_MAX - oyt, x: backWindow.x, y: (oyt + Y_MAX) / 2 })
    // Bottom
    segs.push({ w: backWindow.w, h: oyb - Y_MIN, x: backWindow.x, y: (Y_MIN + oyb) / 2 })
    return segs
  }, [backWindow])

  // Build the 4 ceiling segments around a skylight (ceiling local coords x/z).
  const ceilSegments = useMemo(() => {
    const cxMin = -FLOOR_W / 2, cxMax = FLOOR_W / 2
    const czMin = FLOOR_CZ - FLOOR_D / 2, czMax = FLOOR_CZ + FLOOR_D / 2
    if (!skylight) {
      return [{ w: FLOOR_W, d: FLOOR_D, x: 0, z: FLOOR_CZ }]
    }
    const oxl = skylight.x - skylight.w / 2
    const oxr = skylight.x + skylight.w / 2
    const ozb = skylight.z - skylight.d / 2
    const ozf = skylight.z + skylight.d / 2
    const segs: { w: number; d: number; x: number; z: number }[] = []
    segs.push({ w: oxl - cxMin, d: FLOOR_D, x: (cxMin + oxl) / 2, z: FLOOR_CZ })
    segs.push({ w: cxMax - oxr, d: FLOOR_D, x: (oxr + cxMax) / 2, z: FLOOR_CZ })
    segs.push({ w: skylight.w, d: czMax - ozf, x: skylight.x, z: (ozf + czMax) / 2 })
    segs.push({ w: skylight.w, d: ozb - czMin, x: skylight.x, z: (czMin + ozb) / 2 })
    return segs
  }, [skylight])

  return (
    <group>
      {/* ─── Back wall (segmented if windowed) ─── */}
      {backWallSegments.map((sg, i) =>
        sg.w > 0.01 && sg.h > 0.01 ? (
          <mesh key={`bw-${i}`} receiveShadow position={[sg.x, sg.y, BACK_Z]} material={wallMat}>
            <planeGeometry args={[sg.w, sg.h]} />
          </mesh>
        ) : null
      )}

      {/* ─── Back-wall window dressing ─── */}
      {backWindow && (
        <group position={[backWindow.x, backWindow.y, BACK_Z]}>
          {/* Sky glow behind the opening */}
          <mesh position={[0, 0, -2.4]} material={skyMat}>
            <planeGeometry args={[backWindow.w + 0.6, backWindow.h + 0.6]} />
          </mesh>
          {/* Glass */}
          <mesh position={[0, 0, 0.03]} material={glassMat}>
            <planeGeometry args={[backWindow.w, backWindow.h]} />
          </mesh>
          {/* Frame (4 thin bars) */}
          <mesh position={[0, backWindow.h / 2, 0.06]} material={frameMat}>
            <boxGeometry args={[backWindow.w + 0.3, 0.18, 0.16]} />
          </mesh>
          <mesh position={[0, -backWindow.h / 2, 0.06]} material={frameMat}>
            <boxGeometry args={[backWindow.w + 0.3, 0.18, 0.16]} />
          </mesh>
          <mesh position={[-backWindow.w / 2, 0, 0.06]} material={frameMat}>
            <boxGeometry args={[0.18, backWindow.h + 0.3, 0.16]} />
          </mesh>
          <mesh position={[backWindow.w / 2, 0, 0.06]} material={frameMat}>
            <boxGeometry args={[0.18, backWindow.h + 0.3, 0.16]} />
          </mesh>
          {/* Cross mullion */}
          <mesh position={[0, 0, 0.05]} material={frameMat}>
            <boxGeometry args={[0.1, backWindow.h, 0.12]} />
          </mesh>
          <mesh position={[0, 0, 0.05]} material={frameMat}>
            <boxGeometry args={[backWindow.w, 0.1, 0.12]} />
          </mesh>
        </group>
      )}

      {/* ─── Floor (always solid, extends past camera) ─── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, FLOOR_CZ]} material={floorMat}>
        <planeGeometry args={[FLOOR_W, FLOOR_D]} />
      </mesh>

      {/* ─── Ceiling (segmented if skylight) ─── */}
      {hasCeiling && ceilSegments.map((sg, i) =>
        sg.w > 0.01 && sg.d > 0.01 ? (
          <mesh
            key={`cl-${i}`}
            rotation={[Math.PI / 2, 0, 0]}
            position={[sg.x, roomHeight, sg.z]}
            material={ceilMat}
          >
            <planeGeometry args={[sg.w, sg.d]} />
          </mesh>
        ) : null
      )}

      {/* ─── Skylight dressing ─── */}
      {hasCeiling && skylight && (
        <group position={[skylight.x, roomHeight, skylight.z]}>
          {/* Sky glow above opening */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.4, 0]} material={skyMat}>
            <planeGeometry args={[skylight.w + 0.6, skylight.d + 0.6]} />
          </mesh>
          {/* Glass */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} material={glassMat}>
            <planeGeometry args={[skylight.w, skylight.d]} />
          </mesh>
          {/* Frame bars */}
          <mesh position={[0, 0.06, skylight.d / 2]} material={frameMat}>
            <boxGeometry args={[skylight.w + 0.3, 0.16, 0.18]} />
          </mesh>
          <mesh position={[0, 0.06, -skylight.d / 2]} material={frameMat}>
            <boxGeometry args={[skylight.w + 0.3, 0.16, 0.18]} />
          </mesh>
          <mesh position={[-skylight.w / 2, 0.06, 0]} material={frameMat}>
            <boxGeometry args={[0.18, 0.16, skylight.d + 0.3]} />
          </mesh>
          <mesh position={[skylight.w / 2, 0.06, 0]} material={frameMat}>
            <boxGeometry args={[0.18, 0.16, skylight.d + 0.3]} />
          </mesh>
        </group>
      )}
    </group>
  )
}
