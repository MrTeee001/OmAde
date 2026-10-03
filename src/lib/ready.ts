/**
 * Resolves once the hero is fully ready (the 3D cube has drawn its first
 * frames), so the opening sequence starts only after the heavy work is done.
 */
let resolveReady: () => void
export const heroReady = new Promise<void>((resolve) => (resolveReady = resolve))
export const markHeroReady = () => resolveReady()
