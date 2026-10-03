import { useState } from 'react'
import { cubeFaces } from '../lib/order'
import { MediaTile } from './MediaTile'
import { Lightbox } from './Lightbox'

/** The six cube photos as a simple grid, for visitors who prefer less motion. */
export function CubeGrid() {
  const items = cubeFaces
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="shell section-gap" aria-label="Six favourite moments">
      <ul className="mx-auto grid max-w-[960px] grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-8 md:gap-y-10">
        {items.map((item, i) => (
          <li key={item.media} data-reveal>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="card-button block w-full"
              aria-label={`Open: ${item.caption}`}
            >
              <MediaTile name={item.media} alt={item.caption} className="aspect-square w-full border border-white shadow-[0_8px_30px_rgba(111,168,245,0.12)]" />
            </button>
            <p className="mt-3 text-center text-[15px] leading-snug text-ink-soft">{item.caption}</p>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  )
}
