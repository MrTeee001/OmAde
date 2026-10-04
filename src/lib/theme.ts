export type Theme = 'light' | 'dark'

const META: Record<Theme, string> = { light: '#FBF9FA', dark: '#0D0F1E' }

export const currentTheme = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

/** Switches day/night with a soft cross-fade and remembers the choice on this device. */
export function setTheme(theme: Theme, remember = true) {
  const root = document.documentElement
  root.classList.add('theme-fade')
  root.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[theme])
  window.setTimeout(() => root.classList.remove('theme-fade'), 700)
  if (remember) {
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* private mode — just don't remember */
    }
  }
}

/** Until the visitor picks one, follow their device's light/dark setting. */
export function followSystemTheme() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    let chosen: string | null = null
    try {
      chosen = localStorage.getItem('theme')
    } catch {
      chosen = null
    }
    if (!chosen) setTheme(mq.matches ? 'dark' : 'light', false)
  }
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
