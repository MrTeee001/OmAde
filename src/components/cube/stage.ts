/**
 * Shared, mutable state between the page (scroll + DOM) and the 3D scene.
 * Kept outside React state so the scene can read it every frame for free.
 */
export type Stage = {
  /** 0 = cube resting in the hero, 1 = six cards settled in the grid. */
  progress: number
  /** Index of the card under the pointer, or -1. */
  hover: number
  /** The empty box in the hero where the cube rests. */
  slot: HTMLElement | null
  /** The six card positions in the grid, in face order. */
  cards: (HTMLElement | null)[]
}

export const createStage = (): Stage => ({ progress: 0, hover: -1, slot: null, cards: [] })

// Scroll timeline: where each step of the animation starts and ends (0–1).
export const PHASES = {
  turn: [0, 0.38], // move to centre and make one full turn
  separate: [0.38, 0.62], // faces drift apart and turn to the viewer
  settle: [0.62, 0.9], // faces land in the grid as cards
  captions: 0.88, // captions fade in from here
} as const
