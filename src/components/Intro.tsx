import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memories } from '../memories'
import { Heart } from './Heart'
import { prefersReducedMotion } from '../lib/motion'
import { pauseScroll, resumeScroll } from '../lib/scroll'
import { heroReady } from '../lib/ready'

/**
 * The opening: an envelope rises, opens, a letter slides out with the
 * names, then the camera pushes into the letter and the names land exactly
 * on the hero heading. Plays on every load (nothing is saved to skip it).
 *
 *   0.0 – 1.2s  envelope rises and settles
 *   1.2 – 2.4s  seal pulses, flap opens in 3D, letter slides out
 *   2.4 – 3.8s  names pop in, heart beats twice, sparkle burst
 *   3.8 – 4.3s  hold
 *   4.3 – 5.5s  push into the letter, names travel into the hero heading
 */

const COLORS = ['#F58FB5', '#6FA8F5', '#FFFFFF']

/** Waits for the fonts the names use, but never longer than 2.5s. */
function fontsReady() {
  const fonts = document.fonts
  if (!fonts) return Promise.resolve()
  const load = Promise.all([
    fonts.load('italic 400 96px "Fraunces Variable"'),
    fonts.load('400 17px "Manrope Variable"'),
    fonts.load('600 12px "Manrope Variable"'),
  ]).then(() => fonts.ready)
  return Promise.race([load, new Promise((r) => setTimeout(r, 2500))])
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

/** Sparkles and curling ribbons flying out from a point, then drifting down. */
function burst(layer: HTMLElement, x: number, y: number, small: boolean) {
  const sparkles = small ? 9 : 16
  const ribbons = small ? 3 : 6
  const total = sparkles + ribbons
  const reach = small ? 110 : 170

  for (let i = 0; i < total; i++) {
    const isRibbon = i >= sparkles
    const color = COLORS[i % COLORS.length]
    const el = document.createElement('span')
    el.className = 'burst-bit'
    el.style.color = color
    if (isRibbon) {
      el.innerHTML =
        '<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M3 20c4-1 6-5 4-8s-6-1-4 3 8 5 11 1 1-9 4-11 5 0 5 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    } else if (i % 3 === 0) {
      el.innerHTML = '<svg width="7" height="7" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>'
    } else {
      const size = 8 + (i % 4) * 2
      el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 12 12"><path fill="currentColor" d="M6 0l1.3 4.7L12 6l-4.7 1.3L6 12 4.7 7.3 0 6l4.7-1.3z"/></svg>`
    }
    layer.appendChild(el)

    // Spread evenly around the circle with a little randomness, leaning upward.
    const angle = (i / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const dist = reach * (0.55 + Math.random() * 0.45) * (isRibbon ? 0.85 : 1)
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist * 0.8 - reach * 0.25
    const spin = (Math.random() - 0.5) * (isRibbon ? 260 : 180)

    gsap.set(el, { x, y, xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0, rotation: Math.random() * 360 })
    gsap
      .timeline({ onComplete: () => el.remove() })
      .to(el, { opacity: 1, scale: 1, duration: 0.25, ease: 'sine.out' }, 0)
      .to(el, { x: x + dx, y: y + dy, rotation: `+=${spin}`, duration: 0.75, ease: 'power2.out' }, 0)
      .to(el, {
        x: `+=${(Math.random() - 0.5) * 40}`,
        y: `+=${70 + Math.random() * 70}`,
        rotation: `+=${spin * 0.6}`,
        opacity: 0,
        duration: 1.3,
        ease: 'sine.inOut',
      }, 0.7)
  }
}

export function Intro({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const doneRef = useRef(false)
  const reduced = prefersReducedMotion()
  const { first, second } = memories.names

  useEffect(() => {
    const root = rootRef.current!
    const q = gsap.utils.selector(root)
    let cancelled = false
    let ctx: gsap.Context | null = null
    pauseScroll()

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      resumeScroll()
      onDone()
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    ;(async () => {
      // Fonts and the 3D cube first, so nothing jumps at the handover (capped at 4s).
      await Promise.all([fontsReady(), Promise.race([heroReady, new Promise((r) => setTimeout(r, 4000))])])
      await nextFrame()
      if (cancelled) return

      // Where the hero heading's three parts sit on screen.
      const target = (name: string) =>
        document.querySelector<HTMLElement>(`[data-intro-target] [data-name="${name}"]`)!.getBoundingClientRect()
      const rects = { first: target('first'), amp: target('amp'), second: target('second') }
      const heading = document.querySelector<HTMLElement>('[data-intro-target]')!
      const headingStyle = getComputedStyle(heading)

      // Put each name exactly where it will end up in the hero.
      const place = (el: HTMLElement, r: DOMRect) => {
        el.style.left = `${r.left}px`
        el.style.top = `${r.top}px`
        el.style.fontSize = headingStyle.fontSize
        el.style.letterSpacing = headingStyle.letterSpacing
      }
      place(q('[data-part="first"]')[0], rects.first)
      place(q('[data-part="amp"]')[0], rects.amp)
      place(q('[data-part="second"]')[0], rects.second)
      const heart = q('[data-part="heart"]')[0] as HTMLElement
      const heartSize = rects.amp.height * 0.5
      heart.style.width = heart.style.height = `${heartSize}px`
      heart.style.left = `${rects.amp.left + rects.amp.width / 2 - heartSize / 2}px`
      heart.style.top = `${rects.amp.top + rects.amp.height / 2 - heartSize / 2}px`

      ctx = gsap.context(() => {
        const group = q('[data-names]')[0]
        // The hero's label and line, revealed as the sequence hands over.
        const heroText = document.querySelectorAll('[data-intro-fade]')
        const parts = {
          first: q('[data-part="first"]'),
          second: q('[data-part="second"]'),
          amp: q('[data-part="amp"]'),
          heart,
        }

        // ── Reduced motion: the names, then a 600ms fade to the hero ──
        if (reduced) {
          gsap.set([parts.first, parts.second, parts.amp], { opacity: 1 })
          tlRef.current = gsap
            .timeline({ onComplete: finish })
            .to(heroText, { opacity: 1, duration: 0.6, ease: 'sine.inOut' }, 0.35)
          return
        }

        const small = window.innerWidth < 768
        const envelope = q('[data-envelope]')[0] as HTMLElement
        const letter = q('[data-letter]')[0] as HTMLElement
        const flap = q('[data-flap]')[0] as HTMLElement

        // Measure where the letter ends up once it has slid out (envelope at rest).
        gsap.set(letter, { yPercent: -66 })
        const lr = letter.getBoundingClientRect()
        gsap.set(letter, { yPercent: 0 })

        // The names on the letter: the hero line, shrunk and centred on the paper.
        const lineLeft = rects.first.left
        const lineRight = rects.second.right
        const lineTop = Math.min(rects.first.top, rects.second.top)
        const lineBottom = Math.max(rects.first.bottom, rects.second.bottom)
        const lineW = lineRight - lineLeft
        const lineH = lineBottom - lineTop
        const s = Math.min((lr.width * 0.74) / lineW, 1)
        const cx = lr.left + lr.width / 2
        const cy = lr.top + lr.height * 0.36
        const onLetter = { x: cx - (lineLeft + lineW / 2) * s, y: cy - (lineTop + lineH / 2) * s, scale: s }

        gsap.set(group, { ...onLetter, transformOrigin: '0 0' })
        gsap.set([parts.first, parts.second], { opacity: 0, scale: 0.6, y: 10, transformOrigin: '50% 60%' })
        gsap.set(parts.heart, { opacity: 0, scale: 0 })
        gsap.set(parts.amp, { opacity: 0 })
        gsap.set(envelope, { y: () => window.innerHeight * 0.75, rotation: -7, opacity: 1 })
        gsap.set(q('[data-env-shadow]'), { opacity: 0, scaleX: 0.6 })
        gsap.set(q('[data-stage]'), { transformOrigin: `${cx}px ${cy}px` })

        // While developing, '?intro-pause' holds the timeline so it can be stepped through.
        const hold = import.meta.env.DEV && location.search.includes('intro-pause')
        const tl = gsap.timeline({ onComplete: finish, paused: hold })
        tlRef.current = tl

        // 1. Arrival
        tl.to(envelope, { y: 0, duration: 1.2, ease: 'power3.inOut' }, 0)
          .to(envelope, { rotation: 0, duration: 1.15, ease: 'back.out(1.4)' }, 0.1)
          .to(q('[data-env-shadow]'), { opacity: 1, scaleX: 1, duration: 1.0, ease: 'sine.inOut' }, 0.25)

        // 2. Opening: seal pulse, flap folds up (hinged at the top), letter slides out
        tl.to(q('[data-seal]'), { scale: 1.14, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 1.2)
          .to(flap, { rotationX: -180, transformPerspective: 900, duration: 0.6, ease: 'power2.inOut' }, 1.45)
          .set(flap, { zIndex: 1 }, 1.75) // once past upright, tuck it behind the letter
          .to(q('[data-seal]'), { opacity: 0, duration: 0.2, ease: 'sine.in' }, 1.55)
          .to(letter, { yPercent: -66, duration: 0.6, ease: 'power2.inOut' }, 1.8)

        // 3. Names, heart, burst
        tl.to(parts.first, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, 2.4)
          .to(parts.heart, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, 2.7)
          .call(() => {
            const r = heart.getBoundingClientRect()
            burst(q('[data-burst]')[0], r.left + r.width / 2, r.top + r.height / 2, small)
          }, [], 2.88)
          .to(parts.second, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, 2.95)
          .to(parts.heart, { scale: 1.2, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 3.3)
          .to(parts.heart, { scale: 1.2, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 3.62)

        // 4. Hold (3.8 – 4.3s)

        // 5. Push into the letter; the names travel into the hero heading
        tl.to(q('[data-stage]'), { scale: 7, duration: 1.2, ease: 'power2.inOut' }, 4.3)
          .to(q('[data-env-part]'), { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, 4.45)
          .to(q('[data-paper]'), { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, 4.7)
          .to(group, { x: 0, y: 0, scale: 1, duration: 1.2, ease: 'power2.inOut' }, 4.3)
          .to(parts.heart, { opacity: 0, scale: 0.6, duration: 0.45, ease: 'sine.inOut' }, 4.95)
          .to(parts.amp, { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, 5.0)
          .to(heroText, { opacity: 1, duration: 0.6, ease: 'sine.inOut' }, 4.9)
      }, root)

      // Handy for checking the timing while developing.
      if (import.meta.env.DEV) (window as unknown as { __intro?: gsap.core.Timeline | null }).__intro = tlRef.current
    })()

    return () => {
      cancelled = true
      ctx?.revert()
      tlRef.current = null
      if (!doneRef.current) resumeScroll()
    }
  }, [onDone, reduced])

  const skip = () => {
    const tl = tlRef.current
    if (tl) tl.progress(1)
    else {
      doneRef.current = true
      resumeScroll()
      onDone()
    }
  }

  return (
    <div
      ref={rootRef}
      className="intro-layer fixed inset-0 z-[100]"
    >
      {/* No backdrop of its own: the page's drifting gradient shows through, and the
          hero's text is held back until the camera pushes into the letter. */}
      {!reduced && (
        <div data-stage aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <div data-envelope className="envelope">
            <div data-env-part className="env-back" />
            <div data-letter className="letter">
              <div data-paper className="letter-paper">
                <span className="label letter-label">{memories.hero.label}</span>
              </div>
            </div>
            <div data-env-part className="env-pocket">
              <svg className="env-folds" viewBox="0 0 100 64" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 64 L50 33 L100 64" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.35" />
              </svg>
            </div>
            <div data-flap data-env-part className="env-flap">
              <div className="flap-face flap-front">
                <div data-seal className="env-seal">
                  <svg viewBox="0 0 48 44" width="100%" height="100%">
                    <defs>
                      <radialGradient id="wax" cx="38%" cy="32%" r="75%">
                        <stop offset="0" stopColor="#FBB3CD" />
                        <stop offset="0.55" stopColor="#F58FB5" />
                        <stop offset="1" stopColor="#E0739C" />
                      </radialGradient>
                    </defs>
                    <path
                      fill="url(#wax)"
                      d="M24 42.5c-.8 0-1.6-.3-2.2-.8C14.6 35.6 2.5 26.8 2.5 15.6 2.5 8.6 7.9 3 14.6 3c3.9 0 7.2 1.9 9.4 4.9C26.2 4.9 29.5 3 33.4 3 40.1 3 45.5 8.6 45.5 15.6c0 11.2-12.1 20-19.3 26.1-.6.5-1.4.8-2.2.8z"
                    />
                    <path
                      fill="none"
                      stroke="rgba(255,255,255,0.55)"
                      strokeWidth="1.2"
                      d="M24 34.5c-5.5-4.6-13-10.4-13-17.3 0-4 3-7.2 6.8-7.2 2.9 0 5 1.7 6.2 4 1.2-2.3 3.3-4 6.2-4 3.8 0 6.8 3.2 6.8 7.2 0 6.9-7.5 12.7-13 17.3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flap-face flap-inside" />
            </div>
          </div>
          <div data-env-shadow data-env-part className="env-shadow" />
        </div>
      )}

      {/* Sparkles and ribbons are added here during the burst. */}
      <div data-burst aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />

      {/* The names, laid out exactly like the hero heading (then scaled onto the letter). */}
      <div data-names aria-hidden="true" className="intro-names pointer-events-none absolute inset-0">
        <span data-part="first" className="intro-name italic text-ink">
          {first}
        </span>
        <span data-part="amp" className="intro-name italic text-rose">
          &amp;
        </span>
        <span data-part="heart" className="intro-heart text-rose">
          <Heart size={100} className="h-full w-full" />
        </span>
        <span data-part="second" className="intro-name italic text-ink">
          {second}
        </span>
      </div>

      <button type="button" className="intro-skip" onClick={skip}>
        Skip
      </button>
    </div>
  )
}
