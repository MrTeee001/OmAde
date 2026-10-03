import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { memories } from '../../memories'
import { prefersReducedMotion } from '../../lib/motion'
import { SectionHeading } from './SectionHeading'

gsap.registerPlugin(SplitText)

type LetterProps = { to: string; from: string; paragraphs: string[]; tone: 'blue' | 'rose'; tilt: number }

/** One notepaper letter. Its lines reveal one after another as it scrolls into view. */
function Letter({ to, from, paragraphs, tone, tilt }: LetterProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      SplitText.create(el.querySelectorAll('[data-letter-text]'), {
        type: 'lines',
        mask: 'lines',
        linesClass: 'letter-line',
        autoSplit: true, // re-splits if the width changes
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 100,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 75%', once: true },
          }),
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <article ref={ref} className="letter-card" style={{ rotate: `${tilt}deg` }} aria-label={`Letter to ${to}`}>
      <span className={`wax-dot wax-${tone}`} aria-hidden="true" />
      <p data-letter-text className="letter-greeting">
        {to},
      </p>
      {paragraphs.map((p, i) => (
        <p key={i} data-letter-text className="letter-paragraph">
          {p}
        </p>
      ))}
      <p data-letter-text className="letter-signoff">
        Yours, <span className="italic">{from}</span>
      </p>
    </article>
  )
}

/** To each other: two letters side by side (stacked on mobile), tilted 1° in opposite directions. */
export function Letters() {
  const { names, letters } = memories
  return (
    <section className="shell section-gap" aria-labelledby="letters-title">
      <SectionHeading id="letters-title">To each other</SectionHeading>
      <div className="letters mt-16 md:mt-24">
        <Letter to={names.second} from={names.first} paragraphs={letters.fromAde.paragraphs} tone="blue" tilt={-1} />
        <Letter to={names.first} from={names.second} paragraphs={letters.fromOmolade.paragraphs} tone="rose" tilt={1} />
      </div>
    </section>
  )
}
