import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memories } from '../memories'
import { cubeFaces } from '../lib/deal'
import { Counter } from './Counter'
import { Heart } from './Heart'
import { Lightbox } from './Lightbox'
import { createStage, OPEN_DURATION } from './cube/stage'
import { heroReady, markHeroReady } from '../lib/ready'
import { glideTo } from '../lib/scroll'

// The 3D code is loaded separately so the text appears straight away.
const CubeCanvas = lazy(() => import('./cube/CubeCanvas'))

type Props = { withCube: boolean; lite: boolean; intro: boolean }

export function Hero({ withCube, lite, intro }: Props) {
  const { names, hero, startDate } = memories
  const items = cubeFaces // dealt at random from all the photos/videos on every visit

  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLAnchorElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const tapRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const stage = useRef(createStage()).current
  const [cubeHover, setCubeHover] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [open, setOpen] = useState<number | null>(null)
  // Once the cube has warmed up, stop drawing it while the opening plays over it.
  const [warm, setWarm] = useState(false)
  useEffect(() => void heroReady.then(() => setWarm(true)), [])

  // Pin the hero and drive the cube → cards story with the scroll.
  useEffect(() => {
    if (!withCube) {
      markHeroReady() // nothing heavy to wait for
      return
    }
    const section = sectionRef.current!
    const grid = gridRef.current!
    setReady(true)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 2.6)}`,
          pin: true,
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          stage.progress = tl.progress()
          grid.classList.toggle('is-live', stage.progress > 0.97)
        },
      })
      stRef.current = tl.scrollTrigger ?? null
      // The rest of the hero dims softly while the cube takes the stage.
      tl.to(textRef.current, { opacity: 0.1, duration: 0.22, ease: 'sine.inOut' }, 0)
        .to([hintRef.current, tapRef.current], { opacity: 0, duration: 0.06 }, 0)
        .set({}, {}, 1) // the timeline always spans exactly 0 → 1
    }, section)

    // Layout can shift once the fonts arrive.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    // Only draw the 3D layer while the hero is on screen.
    // Several updates can arrive at once (e.g. while the pin is re-measured); the last is current.
    const io = new IntersectionObserver((entries) => setActive(entries[entries.length - 1].isIntersecting))
    io.observe(section)

    return () => {
      io.disconnect()
      ctx.revert()
      stRef.current = null
    }
  }, [withCube, stage])

  // Clicking the cube and scrolling share one timeline: a click simply glides the
  // page to the end of it (or back to the start), so both always end up the same.
  const openMemories = () => {
    const st = stRef.current
    if (st && stage.progress < 0.5) glideTo(st.end, OPEN_DURATION)
  }
  const closeMemories = () => {
    const st = stRef.current
    if (st) glideTo(st.start, OPEN_DURATION)
  }

  // Escape closes the opened memories (the lightbox handles its own Escape first).
  useEffect(() => {
    if (!withCube) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || open !== null || !active || stage.progress < 0.5) return
      closeMemories()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <section ref={sectionRef} className="relative flex min-h-svh flex-col overflow-hidden" aria-labelledby="hero-title">
      <div
        className={`shell grid flex-1 items-center pb-28 md:pb-32 ${
          withCube ? 'gap-10 pt-20 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pt-24' : 'gap-12 pt-24 md:pt-28'
        }`}
      >
        <div ref={textRef}>
          <p className="label" data-intro-fade>
            {hero.label}
          </p>

          {/* The opening sequence lands its names exactly on these three spans. */}
          <h1 id="hero-title" className="heading mt-6 text-ink" data-intro-target>
            <span className="italic" data-name="first">
              {names.first}
            </span>{' '}
            <span className="italic text-rose" data-name="amp">
              &amp;
            </span>{' '}
            <span className="italic" data-name="second">
              {names.second}
            </span>
          </h1>

          {hero.line && (
            <p className="mt-6 max-w-[34ch] text-ink-soft" data-intro-fade>
              {hero.line}
            </p>
          )}

          {/* data-late: fades in once the opening sequence has finished. */}
          <div className="mt-10 md:mt-16" data-late>
            <Counter startDate={startDate} />
          </div>
        </div>

        {withCube && (
          // Where the cube rests (it is drawn by the 3D layer on top of this box).
          // Click or tap to open; a sideways drag just gives it a spin.
          <div
            ref={(el) => void (stage.slot = el)}
            role="button"
            tabIndex={0}
            aria-label="Open our memories"
            className="cube-slot relative mx-auto aspect-square w-[240px] max-w-full md:w-[380px]"
            onClick={() => !stage.dragged && openMemories()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openMemories()
              }
            }}
            onPointerEnter={(e) => {
              if (e.pointerType !== 'mouse') return
              stage.hoverCube = true
              setCubeHover(true)
            }}
            onPointerLeave={() => {
              stage.hoverCube = false
              setCubeHover(false)
            }}
          >
            <div ref={tapRef} className="cube-tap" aria-hidden="true">
              <span data-late className={`cube-tap-label label ${cubeHover ? 'is-shown' : ''}`}>
                Tap to open
              </span>
            </div>
          </div>
        )}
      </div>

      <a
        ref={hintRef}
        href="#memories"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-soft transition-colors hover:text-ink focus-visible:text-ink md:bottom-8"
        aria-label="Scroll down"
      >
        <span data-late className="flex flex-col items-center gap-2">
          <span className="label">Scroll</span>
          <span className="bounce-soft text-rose">
            <Heart size={16} />
          </span>
        </span>
      </a>

      {withCube && (
        <>
          {/* The grid the faces settle into. The 3D cards are drawn on top of these spots. */}
          <div ref={gridRef} className="cube-grid absolute inset-0 flex items-center justify-center px-6">
            {/* Plays the opening in reverse: cards fold back into the cube. */}
            <button type="button" className="pill-button cube-close" onClick={closeMemories}>
              <span className="label !text-ink">Close</span>
            </button>
            <ul className="cube-grid-list grid">
              {items.map((_, i) => (
                <li key={i} className="flex flex-col items-center">
                  <button
                    type="button"
                    ref={(el) => void (stage.cards[i] = el)}
                    className="card-spot aspect-square w-full"
                    aria-label={`Open memory ${i + 1}`}
                    onClick={() => setOpen(i)}
                    onPointerEnter={() => (stage.hover = i)}
                    onPointerLeave={() => (stage.hover = -1)}
                    onFocus={() => (stage.hover = i)}
                    onBlur={() => (stage.hover = -1)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {ready && (
            <Suspense fallback={null}>
              <CubeCanvas stage={stage} active={active && !(intro && warm)} lite={lite} />
            </Suspense>
          )}
          <Lightbox items={items} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
        </>
      )}
    </section>
  )
}
