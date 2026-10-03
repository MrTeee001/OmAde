import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { memories } from '../../memories'
import { prefersReducedMotion } from '../../lib/motion'
import { Heart } from '../Heart'
import { MediaTile } from '../MediaTile'
import { SectionHeading } from './SectionHeading'

/**
 * Our story: a line down the middle draws itself as you scroll, with a little
 * heart riding its tip. Entries alternate left and right (stacked on mobile);
 * each photo starts tilted like a printed snapshot and straightens into place.
 */
export function Story() {
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const list = listRef.current!
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

      // Each entry: photo straightens and rises, text fades up.
      gsap.utils.toArray<HTMLElement>('[data-story-entry]').forEach((entry) => {
        const tilt = Number(entry.dataset.tilt)
        const tl = gsap.timeline({ scrollTrigger: { trigger: entry, start: 'top 82%', once: true } })
        tl.fromTo(
          entry.querySelector('[data-story-photo]'),
          { rotation: tilt, y: 60, opacity: 0 },
          { rotation: 0, y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' },
        )
          .fromTo(
            entry.querySelectorAll('[data-story-text] > *'),
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
            0.25,
          )
          .fromTo(entry.querySelector('[data-story-dot]'), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.1)
      })
    }, rootRef.current!) // the line, heart and entries all live inside this box
    return () => ctx.revert()
  }, [])

  return (
    <section id="story" className="section-gap" aria-labelledby="story-title">
      <div className="shell">
        <SectionHeading id="story-title">How we got here</SectionHeading>

        <div ref={rootRef} className="story relative mt-16 md:mt-24">
          {/* The line (faint track + the part that draws) and the travelling heart. */}
          <div className="story-track" aria-hidden="true">
            <div data-story-line className="story-line" />
            <div data-story-heart className="story-heart">
              <Heart size={14} />
            </div>
          </div>

          <ol ref={listRef} className="story-list">
            {memories.timeline.map((entry, i) => {
              const side = i % 2 === 0 ? 'left' : 'right'
              // Printed-photo tilt: 2–3°, alternating direction.
              const tilt = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3) * 0.5)
              return (
                <li key={entry.media} data-story-entry data-tilt={tilt} className={`story-entry story-entry-${side}`}>
                  <span data-story-dot className="story-dot" aria-hidden="true" />
                  <div data-story-photo className="story-photo">
                    <MediaTile name={entry.media} alt={entry.title} className="aspect-[4/5] w-full" />
                  </div>
                  <div data-story-text className="mt-6">
                    <p className="label">{entry.date}</p>
                    <h3 className="mt-2 font-display text-[28px] leading-tight text-ink md:text-[32px]">{entry.title}</h3>
                    <p className="mt-3 max-w-[42ch] text-ink-soft">{entry.caption}</p>
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
