import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { memoryFrames } from '../../lib/deal'
import { prefersReducedMotion } from '../../lib/motion'
import { Heart } from '../Heart'
import { MediaTile } from '../MediaTile'
import { SectionHeading } from './SectionHeading'

/**
 * Our memories: frame after frame of photos (or short videos), in a fresh
 * random order on every visit. A line down the middle draws itself as you
 * scroll, with a little heart riding its tip. Frames alternate left and right
 * (stacked on mobile); each starts tilted like a printed snapshot and
 * straightens into place.
 */
export function Memories() {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const root = rootRef.current
    if (prefersReducedMotion() || !list || !root) return
    const ctx = gsap.context(() => {
      // The line draws as the list scrolls past the middle of the screen.
      gsap.fromTo(
        '[data-story-line]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top 55%', end: 'bottom 55%', scrub: 0.5 },
        },
      )
      gsap.fromTo(
        '[data-story-heart]',
        { top: '0%' },
        {
          top: '100%',
          ease: 'none',
          scrollTrigger: { trigger: list, start: 'top 55%', end: 'bottom 55%', scrub: 0.5 },
        },
      )

      // Each frame straightens and settles into place. On phones the frames fly in
      // from alternating sides (left, right, left…); on larger screens they rise.
      const mobile = window.matchMedia('(max-width: 767px)').matches
      gsap.utils.toArray<HTMLElement>('[data-story-entry]').forEach((entry, i) => {
        const tilt = Number(entry.dataset.tilt)
        const from = mobile
          ? { x: (i % 2 === 0 ? -1 : 1) * window.innerWidth * 0.9, y: 0, rotation: (i % 2 === 0 ? -1 : 1) * 6, opacity: 0 }
          : { x: 0, y: 60, rotation: tilt, opacity: 0 }
        const tl = gsap.timeline({ scrollTrigger: { trigger: entry, start: mobile ? 'top 88%' : 'top 82%', once: true } })
        tl.fromTo(
          entry.querySelector('[data-story-photo]'),
          from,
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: mobile ? 0.9 : 1.1, ease: 'power3.out' },
        ).fromTo(entry.querySelector('[data-story-dot]'), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.1)
      })
    }, root) // the line, heart and entries all live inside this box
    return () => ctx.revert()
  }, [])

  // With only a few files, all of them may be on the cube/reel/closing instead.
  if (memoryFrames.length === 0) return null

  return (
    <section id="memories" className="section-gap" aria-labelledby="memories-title">
      <div className="shell">
        <SectionHeading id="memories-title">Our memories</SectionHeading>

        <div ref={rootRef} className="story relative mt-16 md:mt-24">
          {/* The line (faint track + the part that draws) and the travelling heart. */}
          <div className="story-track" aria-hidden="true">
            <div data-story-line className="story-line" />
            <div data-story-heart className="story-heart">
              <Heart size={14} />
            </div>
          </div>

          <ol ref={listRef} className="story-list">
            {memoryFrames.map((name, i) => {
              const side = i % 2 === 0 ? 'left' : 'right'
              // Printed-photo tilt: 2–3°, alternating direction.
              const tilt = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3) * 0.5)
              return (
                <li key={i} data-story-entry data-tilt={tilt} className={`story-entry story-entry-${side}`}>
                  <span data-story-dot className="story-dot" aria-hidden="true" />
                  <div data-story-photo className="story-photo">
                    <MediaTile name={name} alt={`A memory (${i + 1} of ${memoryFrames.length})`} className="aspect-[4/5] w-full border border-white shadow-[0_8px_30px_rgba(111,168,245,0.12)]" />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
