import { memories } from '../memories'

/** A fresh random order (Fisher–Yates shuffle); the original list is left as is. */
function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/*
 * Shuffled once each time the page loads, so every visit (and every reload)
 * shows the photos and videos in different places. Nothing is saved.
 * Each cube photo keeps its own caption as it moves.
 */
export const cubeFaces = shuffle(memories.cube.slice(0, 6))
export const memoryFrames = shuffle(memories.memoryFrames)
export const reelClips = shuffle(memories.reels)
