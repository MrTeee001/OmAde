/**
 * Shared state for the background song, so the opening can tell whether the
 * music is already playing (some browsers allow that straight away) or still
 * needs the visitor's first tap (most phones), and wait for it at the letter.
 */
type Listener = () => void

let playing = false
let wanted = false // a song exists and the visitor hasn't turned it off
const listeners = new Set<Listener>()

export const music = {
  /** True once the song is actually playing. */
  get playing() {
    return playing
  },
  setPlaying(value: boolean) {
    playing = value
    if (value) listeners.forEach((l) => l())
  },
  setWanted(value: boolean) {
    wanted = value
  },
  /** The song should be playing but the browser is still waiting for a tap. */
  needsTap() {
    return wanted && !playing
  },
  /** Runs once the song starts playing. Returns an unsubscribe function. */
  onStart(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
