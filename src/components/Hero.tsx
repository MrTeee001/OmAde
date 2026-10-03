import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memories } from '../memories'
import { Counter } from './Counter'
import { Heart } from './Heart'
import { Lightbox } from './Lightbox'
import { createStage, PHASES } from './cube/stage'
import { heroReady, markHeroReady } from '../lib/ready'

// The 3D code is loaded separately so the text appears straight away.
const CubeCanvas = lazy(() => import('./cube/CubeCanvas'))

type Props = { withCube: boolean; lite: boolean; intro: boolean }

export function Hero({ withCube, lite, intro }: Props) {
  const { names, hero, startDate, cube } = memories
  const items = cube.slice(0, 6)

  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLAnchorElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const stage = useRef(createStage()).current
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
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          stage.progress = tl.progress()
          grid.classList.toggle('is-live', stage.progress > 0.97)
        },
      })
      tl.to(textRef.current, { opacity: 0, y: -24, duration: 0.16 }, 0)
        .to(hintRef.current, { opacity: 0, duration: 0.06 }, 0)
        .fromTo(
          grid.querySelectorAll('[data-caption]'),
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.07, stagger: 0.01 },
          PHASES.captions,
        )
        .set({}, {}, 1) // the timeline always spans exactly 0 → 1
    }, section)

    // Layout can shift once the fonts arrive.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    // Only draw the 3D layer while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting))
    io.observe(section)

    return () => {
      io.disconnect()
      ctx.revert()
    }
  }, [withCube, stage])

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

          <p className="mt-6 max-w-[34ch] text-ink-soft" data-intro-fade>
            {hero.line}
          </p>

          {/* data-late: fades in once the opening sequence has finished. */}
          <div className="mt-10 md:mt-16" data-late>
            <Counter startDate={startDate} />
          </div>
        </div>

        {withCube && (
          // Where the cube rests. Drag it with a finger (or mouse) to turn it.
          <div
            ref={(el) => void (stage.slot = el)}
            aria-hidden="true"
            className="cube-slot relative mx-auto aspect-square w-[240px] max-w-full md:w-[380px]"
          />
        )}
      </div>

      <a
        ref={hintRef}
        href="#next"
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
            <ul className="cube-grid-list grid">
              {items.map((item, i) => (
                <li key={item.media} className="flex flex-col items-center">
                  <button
                    type="button"
                    ref={(el) => void (stage.cards[i] = el)}
                    className="card-spot aspect-square w-full"
                    aria-label={`Open: ${item.caption}`}
                    onClick={() => setOpen(i)}
                    onPointerEnter={() => (stage.hover = i)}
                    onPointerLeave={() => (stage.hover = -1)}
                    onFocus={() => (stage.hover = i)}
                    onBlur={() => (stage.hover = -1)}
                  />
                  <p data-caption className="cube-caption mt-3 text-center text-ink-soft">
                    {item.caption}
                  </p>
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
