import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { reelClips } from '../../lib/deal'
import { prefersReducedMotion } from '../../lib/motion'
import { MediaTile } from '../MediaTile'
import { SectionHeading } from './SectionHeading'

/**
 * Moving pictures: the clips sit in a row that slides sideways while you
 * scroll down (the section holds still meanwhile). Always silent, playing
 * only while on screen.
 */
export function Reel() {
  const pinRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLUListElement>(null)
  const reduced = prefersReducedMotion()

  useEffect(() => {
    const pin = pinRef.current
    const row = rowRef.current
    if (reduced || !pin || !row) return
    // The row starts nudged in from the right and travels until its last clip is fully in view.
    const startX = () => window.innerWidth * 0.18
    const distance = () => Math.max(0, row.scrollWidth - pin.clientWidth + 48)
    const ctx = gsap.context(() => {
      gsap.fromTo(row, { x: startX }, {
        x: () => -distance(),
        ease: 'none',
        immediateRender: true,
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance() + startX()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
    }, pin)
    return () => ctx.revert()
  }, [reduced])

  // No videos among the files: leave this section out.
  if (reelClips.length === 0) return null

  return (
    <section className="section-gap" aria-labelledby="reel-title">
      <div ref={pinRef} className={`reel-pin ${reduced ? '' : 'min-h-svh'} flex flex-col justify-center overflow-hidden py-12`}>
        <div className="shell">
          <SectionHeading id="reel-title">Moving pictures</SectionHeading>
        </div>
        <ul ref={rowRef} className={`reel-row mt-12 md:mt-16 ${reduced ? 'reel-row-scroll' : ''}`}>
          {reelClips.map((name, i) => {
            return (
              <li key={i} className="reel-card">
                <MediaTile name={name} className="h-full w-full soft-border" />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
