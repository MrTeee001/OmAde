/** Can this browser draw 3D (WebGL)? */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * A rough guess at a small or slow device. On these we lower the 3D
 * resolution and calm the background so scrolling stays smooth.
 */
export function isLiteDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  return cores <= 4 || memory <= 4 || !!nav.connection?.saveData
}
