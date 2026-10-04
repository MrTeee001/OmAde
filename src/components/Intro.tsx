import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memories } from '../memories'
import { Heart } from './Heart'
import { prefersReducedMotion } from '../lib/motion'
import { pauseScroll, resumeScroll } from '../lib/scroll'
import { heroReady } from '../lib/ready'

/**
 * The opening: an envelope rises and opens, the names pop up out of it with a
 * heart between them, then the envelope opens toward the camera and the camera
 * flies inside it, coming out on the hero with the names landing exactly on
 * the heading. Plays on every load (nothing is saved to skip it).
 *
 *   0.0 – 1.2s   envelope rises and settles
 *   1.2 – 2.4s   seal pulses, top flap folds open in 3D
 *   2.4 – 3.8s   names pop up, heart beats twice, sparkle burst
 *   3.8 – 4.3s   hold
 *   4.3 – 5.75s  flaps open toward the camera, camera flies into the envelope
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
        const world = q('[data-world]')[0] as HTMLElement
        const envelope = q('[data-envelope]')[0] as HTMLElement
        const topFlap = q('[data-panel="top"]')[0] as HTMLElement
        const shadow = q('[data-env-shadow]')[0] as HTMLElement

        // Where the envelope sits at rest (before it is moved off screen).
        const er = envelope.getBoundingClientRect()

        // The names pop up just above the envelope's opening: the hero line,
        // shrunk to fit, centred over the envelope.
        const lineLeft = rects.first.left
        const lineRight = rects.second.right
        const lineTop = Math.min(rects.first.top, rects.second.top)
        const lineBottom = Math.max(rects.first.bottom, rects.second.bottom)
        const lineW = lineRight - lineLeft
        const lineH = lineBottom - lineTop
        const s = Math.min((er.width * 0.8) / lineW, 1)
        const cx = er.left + er.width / 2
        const cy = er.top - er.height * 0.06 // just above the opening, over the open flap
        const onEnvelope = { x: cx - (lineLeft + lineW / 2) * s, y: cy - (lineTop + lineH / 2) * s, scale: s }

        gsap.set(group, { ...onEnvelope, transformOrigin: '0 0' })
        // Each name starts low, inside the envelope, ready to spring up.
        gsap.set([parts.first, parts.second], { opacity: 0, scale: 0.5, y: lineH * 0.9, transformOrigin: '50% 80%' })
        gsap.set(parts.heart, { opacity: 0, scale: 0, y: lineH * 0.6 })
        gsap.set(parts.amp, { opacity: 0 })
        gsap.set(envelope, { y: () => window.innerHeight * 0.75, rotation: -7, rotationX: 18, opacity: 1 })
        gsap.set(shadow, { opacity: 0, scaleX: 0.6 })
        gsap.set(world, { z: 0, rotationX: 0 })

        // While developing, '?intro-pause' holds the timeline so it can be stepped through.
        const hold = import.meta.env.DEV && location.search.includes('intro-pause')
        const tl = gsap.timeline({ onComplete: finish, paused: hold })
        tlRef.current = tl

        // 1. Arrival: rises from below, tilt settles straight
        tl.to(envelope, { y: 0, duration: 1.2, ease: 'power3.inOut' }, 0)
          .to(envelope, { rotation: 0, rotationX: 0, duration: 1.15, ease: 'back.out(1.4)' }, 0.1)
          .to(shadow, { opacity: 1, scaleX: 1, duration: 1.0, ease: 'sine.inOut' }, 0.25)

        // 2. Opening: seal pulse, then the top flap folds up toward the camera on its hinge
        tl.to(q('[data-seal]'), { scale: 1.14, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 1.2)
          .to(topFlap, { rotationX: 180, duration: 0.75, ease: 'power2.inOut' }, 1.5)
          .to(q('[data-seal]'), { opacity: 0, duration: 0.25, ease: 'sine.in' }, 1.75) // hide it once the flap is past upright

        // 3. Names pop up out of the envelope, heart in the middle, burst, two beats
        tl.to(parts.first, { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(1.7)' }, 2.4)
          .to(parts.heart, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2.2)' }, 2.68)
          .call(() => {
            const r = heart.getBoundingClientRect()
            burst(q('[data-burst]')[0], r.left + r.width / 2, r.top + r.height / 2, small)
          }, [], 2.9)
          .to(parts.second, { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(1.7)' }, 2.95)
          .to(parts.heart, { scale: 1.2, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 3.3)
          .to(parts.heart, { scale: 1.2, duration: 0.14, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 3.62)

        // 4. Hold (3.8 – 4.3s)

        // 5. The envelope opens toward the camera like petals...
        tl.to(q('[data-panel="left"]'), { rotationY: -100, duration: 0.6, ease: 'back.out(1.2)' }, 4.3)
          .to(q('[data-panel="right"]'), { rotationY: 100, duration: 0.6, ease: 'back.out(1.2)' }, 4.34)
          .to(q('[data-panel="bottom"]'), { rotationX: -100, duration: 0.6, ease: 'back.out(1.2)' }, 4.38)
          .to(topFlap, { rotationX: 155, duration: 0.6, ease: 'power2.inOut' }, 4.3)
          .to(shadow, { opacity: 0, duration: 0.4, ease: 'sine.inOut' }, 4.3)
          // ...and the camera dips, then flies forward into it.
          .to(world, { rotationX: 14, duration: 0.5, ease: 'sine.inOut' }, 4.3)
          .to(world, { rotationX: 0, duration: 0.95, ease: 'sine.inOut' }, 4.8)
          .to(world, { z: 950, duration: 1.3, ease: 'power2.inOut' }, 4.45)
          .to(q('[data-panel]'), { opacity: 0, duration: 0.3, ease: 'sine.inOut' }, 4.92)
          // The inside of the envelope fills the screen and melts into the page.
          .to(q('[data-inside]'), { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, 5.25)
          .to(heroText, { opacity: 1, duration: 0.65, ease: 'sine.inOut' }, 5.1)
          // The names travel into the hero heading; the heart becomes the "&".
          .to(group, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'power2.inOut' }, 4.45)
          .to(parts.heart, { opacity: 0, scale: 0.6, duration: 0.45, ease: 'sine.inOut' }, 5.15)
          .to(parts.amp, { opacity: 1, duration: 0.45, ease: 'sine.inOut' }, 5.2)
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
          hero's text is held back until the camera flies into the envelope. */}
      {!reduced && (
        // A real 3D scene: the camera is the perspective, the "world" is what it flies through.
        <div data-camera aria-hidden="true" className="intro-camera absolute inset-0 flex items-center justify-center">
          <div data-world className="intro-world">
            <div data-env-shadow className="env-shadow" />
            <div data-envelope className="envelope">
              <div data-inside className="env-back" />
              {/* Front flaps, each hinged on its outer edge, with an outside and an inside face. */}
              <EnvelopePanel side="bottom" />
              <EnvelopePanel side="left" />
              <EnvelopePanel side="right" />
              <EnvelopePanel side="top">
                <div data-seal className="env-seal">
                  <Seal />
                </div>
              </EnvelopePanel>
            </div>
          </div>
        </div>
      )}

      {/* Shared colours for the envelope faces. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="env-out" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--env-out-1)" />
            <stop offset="0.5" stopColor="var(--env-out-2)" />
            <stop offset="1" stopColor="var(--env-out-3)" />
          </linearGradient>
          <linearGradient id="env-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--env-in-1)" />
            <stop offset="1" stopColor="var(--env-in-2)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sparkles and ribbons are added here during the burst. */}
      <div data-burst aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" />

      {/* The names, laid out exactly like the hero heading (then scaled onto the envelope). */}
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

// Triangle shapes (in % of the envelope) for each flap, outside and inside.
// The inside face is drawn mirrored, because it is flipped 180° to sit behind.
const PANELS = {
  left: { out: '0,3 50,52 0,97', in: '100,3 50,52 100,97', flip: 'rotateY(180deg)' },
  right: { out: '100,3 50,52 100,97', in: '0,3 50,52 0,97', flip: 'rotateY(180deg)' },
  bottom: { out: '3,100 50,52 97,100', in: '3,0 50,48 97,0', flip: 'rotateX(180deg)' },
  top: { out: '2,0 98,0 50,100', in: '2,100 98,100 50,0', flip: 'rotateX(180deg)' },
} as const

function EnvelopePanel({ side, children }: { side: keyof typeof PANELS; children?: ReactNode }) {
  const shape = PANELS[side]
  return (
    <div data-panel={side} className={`env-panel env-panel-${side}`}>
      <svg className="panel-face" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points={shape.out} fill="url(#env-out)" stroke="var(--env-edge)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <svg className="panel-face" style={{ transform: shape.flip }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points={shape.in} fill="url(#env-in)" stroke="var(--env-edge)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  )
}

function Seal() {
  return (
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
  )
}
