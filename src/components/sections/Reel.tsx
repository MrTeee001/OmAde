import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reelClips } from '../../lib/deal'
import { getMedia } from '../../lib/media'
import { prefersReducedMotion } from '../../lib/motion'
import { MediaTile } from '../MediaTile'
import { SectionHeading } from './SectionHeading'

/**
 * Moving pictures: the clips sit in a row that slides sideways while you
 * scroll down (the section holds still meanwhile). Muted, playing only while
 * on screen; tap a clip to hear it (the others go quiet).
 */
export function Reel() {
  const pinRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLUListElement>(null)
  const [sound, setSound] = useState<number | null>(null)
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
            const isVideo = getMedia(name).kind === 'video'
            const on = sound === i
            return (
              <li key={i} className="reel-card">
                <MediaTile name={name} alt={`Clip ${i + 1}`} muted={!on} className="h-full w-full border border-white" />
                {isVideo && (
                  <button
                    type="button"
                    className="reel-sound"
                    aria-pressed={on}
                    aria-label={on ? `Mute clip ${i + 1}` : `Play clip ${i + 1} with sound`}
                    onClick={() => setSound(on ? null : i)}
                  >
                    <span className="label !text-ink">{on ? 'Sound on' : 'Tap for sound'}</span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
