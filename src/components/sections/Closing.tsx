import { memories } from '../../memories'
import { MediaTile } from '../MediaTile'

/** "29 May 2026" from "2026-05-29". */
function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const month = new Date(Date.UTC(y, m - 1, d)).toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })
  return `${d} ${month} ${y}`
}

/** The closing photo, one last line, and a tiny footer. */
export function Closing() {
  const { names, closing, startDate } = memories
  return (
    <>
      <section className="shell section-gap" aria-label="Closing">
        <div data-reveal>
          <MediaTile name={closing.media} alt={closing.line} className="aspect-[4/5] w-full border border-white shadow-[0_8px_30px_rgba(111,168,245,0.12)] md:aspect-[16/9]" />
        </div>
        <p className="mx-auto mt-10 max-w-[28ch] text-center font-display text-[28px] italic leading-snug text-ink md:mt-14 md:text-[40px]" data-reveal>
          {closing.line}
        </p>
      </section>
      <footer className="shell pb-12 pt-24 text-center md:pt-32">
        <p className="label">
          {names.first} &amp; {names.second}, since {longDate(startDate)}
        </p>
      </footer>
    </>
  )
}
