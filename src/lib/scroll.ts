import type Lenis from 'lenis'

// The page's smooth-scroll instance, so overlays (like the lightbox) can pause it.
let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

export const pauseScroll = () => {
  lenis?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export const resumeScroll = () => {
  document.documentElement.style.overflow = ''
  lenis?.start()
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Glides the page to a scroll position over a set time (used by the cube's open/close). */
export const glideTo = (y: number, seconds: number) => {
  if (lenis) lenis.scrollTo(y, { duration: seconds, easing: easeInOutCubic, lock: true, force: true })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}
