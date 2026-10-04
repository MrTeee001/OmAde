import { memories } from '../../memories'

/** "29 May 2026" from "2026-05-29". */
function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const month = new Date(Date.UTC(y, m - 1, d)).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })
  return `${d} ${month} ${y}`
}

/** The closing photo (never changes), one last line, and a tiny footer. */
export function Closing() {
  const { names, closing, startDate } = memories

  return (
    <>
      <section className="shell section-gap" aria-label="Closing">
        <div data-reveal>
          {/* Always the same picture (our feet), zoomed out to show the whole crossing.
              It lives in public/closing/, outside the shuffled pile. */}
          <img
            src={`${import.meta.env.BASE_URL}closing/closing.jpg`}
            alt="Our feet side by side on a zebra crossing"
            loading="lazy"
            decoding="async"
            className="closing-photo mx-auto block aspect-[4/5] w-full max-w-[560px] rounded-[24px] soft-border object-cover"
          />
        </div>
        {closing.line && (
          <p className="mx-auto mt-10 max-w-[28ch] text-center font-display text-[28px] italic leading-snug text-ink md:mt-14 md:text-[40px]" data-reveal>
            {closing.line}
          </p>
        )}
      </section>
      <footer className="shell pb-12 pt-24 text-center md:pt-32">
        <p className="label">
          {names.first} &amp; {names.second}, since {longDate(startDate)}
        </p>
      </footer>
    </>
  )
}
