import { useEffect, useState } from 'react'
import { glideTo } from '../lib/scroll'
import { currentTheme, followSystemTheme, setTheme, type Theme } from '../lib/theme'

/** A🌹O logo (top left, back to the top) and the day/night toggle (top right). */
export function Header() {
  const [theme, setThemeState] = useState<Theme>(() => currentTheme())

  useEffect(() => {
    const stop = followSystemTheme()
    // Keep the icon in step if the device setting changes the theme.
    const obs = new MutationObserver(() => setThemeState(currentTheme()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      stop()
      obs.disconnect()
    }
  }, [])

  const dark = theme === 'dark'

  return (
    <header className="site-header" data-late>
      <a
        href="#top"
        className="site-logo"
        aria-label="Back to the top"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          glideTo(0, 1.4)
        }}
      >
        A
        {/* A little red rose between the initials */}
        <svg className="site-logo-rose" width="18" height="20" viewBox="0 0 24 26" aria-hidden="true">
          <path d="M12 14.5V24" stroke="#4E8F5E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M12 19.5c-2.6-.3-4.3-1.9-4.6-3.9 2.4-.2 4.1 1.3 4.6 3.9z" fill="#5BA36C" />
          <path d="M12 21c2.3-.4 3.8-1.9 4-3.6-2.1-.1-3.6 1.3-4 3.6z" fill="#4E8F5E" />
          <path d="M5.6 8.6C5.4 4.4 9 2.4 12 3.8c3-1.4 6.6.6 6.4 4.8-.2 3.8-3 6.4-6.4 6.4S5.8 12.4 5.6 8.6z" fill="#C8102E" />
          <path d="M7.4 9.6c.6 2.4 2.5 3.8 4.6 3.8s4-1.4 4.6-3.8c-1.3 1.3-2.8 1.9-4.6 1.9S8.7 10.9 7.4 9.6z" fill="#9B0B22" />
          <path d="M9.3 8.4c.2-2 2-3 3.4-2.4 1.5.6 1.6 2.8.2 3.4-1.1.5-2.1-.3-1.8-1.2" stroke="#FF5C77" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </svg>
        O
      </a>

      <button
        type="button"
        className="theme-toggle"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={dark}
        onClick={() => setTheme(dark ? 'light' : 'dark')}
      >
        {dark ? (
          // Sun: tap for day
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
            </g>
          </svg>
        ) : (
          // Moon: tap for night
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M20.2 14.6A8.5 8.5 0 0 1 9.4 3.8a.6.6 0 0 0-.8-.7 9.5 9.5 0 1 0 12.3 12.3.6.6 0 0 0-.7-.8z" />
          </svg>
        )}
      </button>
    </header>
  )
}
