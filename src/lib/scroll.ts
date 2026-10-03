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
