import { useEffect, useRef, useState } from 'react'
import { songUrl } from '../lib/media'
import { music } from '../lib/music'

/** The song starts from the beginning (it was trimmed before it was added) and loops back to the start. */
const START_AT = 0
/** Soft background level (0–1). */
const VOLUME = 0.12
const FADE_IN = 2.5 // seconds

// Remembered for this browser tab only, so a reload carries on where it was;
// closing the tab (leaving the site) forgets it, and the next visit starts from the beginning.
const KEY_TIME = 'song-time'
const KEY_OFF = 'song-off'
const read = (key: string) => {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* private mode etc. — just don't remember */
  }
}

/**
 * Background song, on by default. It tries to start the moment the page loads;
 * where the browser insists on a tap first (most phones), the opening waits at
 * the letter for that tap ("Tap to open") and the music starts with it.
 * Only the visitor can turn it off, with the small Music button.
 */
export function Song() {
  const [on, setOn] = useState(() => read(KEY_OFF) !== '1')
  const api = useRef<{ start: () => void; stop: () => void } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!songUrl) return
    music.setWanted(read(KEY_OFF) !== '1')
    const audio = new Audio(songUrl)
    audio.preload = 'auto'

    // Volume goes through Web Audio so it is also soft on iPhones (which ignore
    // audio.volume). Browsers only allow that after a tap, so it is set up then.
    let ctx: AudioContext | null = null
    let gain: GainNode | null = null
    const setUpAudioGraph = () => {
      if (ctx) return
      try {
        ctx = new AudioContext()
        gain = ctx.createGain()
        gain.gain.value = audio.volume
        audio.volume = 1
        ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination)
      } catch {
        ctx = null
        gain = null
      }
    }
    audio.volume = 0
    let raf = 0
    const fadeTo = (level: number, seconds: number) => {
      if (ctx && gain) {
        const now = ctx.currentTime
        gain.gain.cancelScheduledValues(now)
        gain.gain.setValueAtTime(gain.gain.value, now)
        gain.gain.linearRampToValueAtTime(level, now + seconds)
        return
      }
      cancelAnimationFrame(raf)
      const from = audio.volume
      const t0 = performance.now()
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / (seconds * 1000))
        audio.volume = from + (level - from) * k
        if (k < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    // Where to begin: where it was before a reload, or the beginning.
    const saved = Number(read(KEY_TIME))
    const startAt = Number.isFinite(saved) && saved > START_AT ? saved : START_AT
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = startAt < audio.duration - 1 ? startAt : START_AT
    }, { once: true })

    let playing = false
    const start = (fromTap = false) => {
      if (playing || read(KEY_OFF) === '1') return
      if (fromTap) {
        setUpAudioGraph()
        ctx?.resume().catch(() => {})
      }
      audio
        .play()
        .then(() => {
          playing = true
          music.setPlaying(true)
          fadeTo(VOLUME, FADE_IN)
          removeGestures()
        })
        .catch(() => {
          /* not allowed yet — wait for the first tap */
        })
    }
    const stop = () => {
      playing = false
      music.setPlaying(false)
      fadeTo(0, 0.6)
      window.setTimeout(() => !playing && audio.pause(), 650)
    }
    api.current = { start: () => start(true), stop }

    // The first tap/click/key anywhere starts it (but not a tap on the music button itself).
    const onGesture = (e: Event) => {
      if (buttonRef.current?.contains(e.target as Node)) return
      start(true)
    }
    const gestures = ['pointerdown', 'keydown', 'touchend'] as const
    const removeGestures = () => gestures.forEach((g) => window.removeEventListener(g, onGesture, true))
    gestures.forEach((g) => window.addEventListener(g, onGesture, true))

    // Loop back to the beginning, and keep note of the position for reloads.
    const onEnded = () => {
      audio.currentTime = START_AT
      audio.play().catch(() => {})
    }
    let lastSave = 0
    const onTime = () => {
      if (!playing) return
      if (audio.currentTime - lastSave > 1 || audio.currentTime < lastSave) {
        lastSave = audio.currentTime
        write(KEY_TIME, String(audio.currentTime))
      }
    }
    // Only real playing positions are kept (never the 0 of a song that hasn't started).
    const onLeave = () => {
      if (playing && audio.currentTime > START_AT) write(KEY_TIME, String(audio.currentTime))
    }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('timeupdate', onTime)
    window.addEventListener('pagehide', onLeave)


    start() // some browsers allow it straight away (without a tap)

    return () => {
      removeGestures()
      window.removeEventListener('pagehide', onLeave)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('timeupdate', onTime)
      onLeave()
      cancelAnimationFrame(raf)
      audio.pause()
      ;(ctx as AudioContext | null)?.close().catch(() => {})
      api.current = null
    }
  }, [])

  if (!songUrl) return null

  const toggle = () => {
    music.setWanted(!on)
    if (on) {
      write(KEY_OFF, '1')
      api.current?.stop()
    } else {
      write(KEY_OFF, '0')
      api.current?.start()
    }
    setOn(!on)
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`song-toggle ${on ? '' : 'is-off'}`}
      aria-pressed={on}
      aria-label={on ? 'Turn the music off' : 'Turn the music on'}
      onClick={toggle}
      data-late
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M9 17.5V6.2c0-.5.3-.9.8-1l8-2c.6-.1 1.2.3 1.2 1v11.3a3 3 0 1 1-2-2.8V7.3l-6 1.5v8.7a3 3 0 1 1-2-2.8z" />
      </svg>
      <span className="label !text-[10px]">{on ? 'Music' : 'Music off'}</span>
    </button>
  )
}
