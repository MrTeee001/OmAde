/**
 * Shared, mutable state between the page (scroll + DOM) and the 3D scene.
 * Kept outside React state so the scene can read it every frame for free.
 */
export type Stage = {
  /** 0 = cube resting in the hero, 1 = six cards settled in the grid. */
  progress: number
  /** Index of the card under the pointer, or -1. */
  hover: number
  /** True while the pointer is over the resting cube. */
  hoverCube: boolean
  /** True if the last press on the cube turned into a drag (so it isn't a tap). */
  dragged: boolean
  /** The empty box in the hero where the cube rests. */
  slot: HTMLElement | null
  /** The six card positions in the grid, in face order. */
  cards: (HTMLElement | null)[]
}

export const createStage = (): Stage => ({ progress: 0, hover: -1, hoverCube: false, dragged: false, slot: null, cards: [] })

// One timeline (0–1) drives the opening, whether it comes from a click or from scrolling.
export const PHASES = {
  glide: [0, 0.25], // spin eases to a stop, cube glides to the centre, hero dims
  separate: [0.2, 0.6], // faces drift apart in 3D and turn to the viewer
  settle: [0.55, 0.92], // faces land in the grid as rounded cards
  captions: 0.8, // captions fade in one after another from here
} as const

/** How long a click takes to open (or close) the memories, in seconds. */
export const OPEN_DURATION = 2.4
