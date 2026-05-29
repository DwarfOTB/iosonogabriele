import * as THREE from 'three'

export function createGradientMap(stops: number = 3): THREE.DataTexture {
  const data = new Uint8Array(stops * 4)
  const step = 255 / (stops - 1)
  for (let i = 0; i < stops; i++) {
    const v = Math.round(i * step)
    data[i * 4 + 0] = v
    data[i * 4 + 1] = v
    data[i * 4 + 2] = v
    data[i * 4 + 3] = 255
  }
  const tex = new THREE.DataTexture(data, stops, 1, THREE.RGBAFormat)
  tex.needsUpdate = true
  return tex
}

const _gradientMap3 = typeof window !== 'undefined' ? createGradientMap(3) : null

export function toonMaterial(
  color: THREE.ColorRepresentation,
  opts: Partial<THREE.MeshToonMaterialParameters> = {}
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: _gradientMap3 ?? createGradientMap(3),
    ...opts,
  })
}

export function outlineMaterial(
  color: THREE.ColorRepresentation = 0x1c1208,
  thickness: number = 0.03
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide,
    transparent: false,
  })
}
