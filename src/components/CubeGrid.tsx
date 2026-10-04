import { useState } from 'react'
import { cubeFaces } from '../lib/deal'
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
          <li key={i} data-reveal>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="card-button block w-full"
              aria-label={`Open memory ${i + 1}`}
            >
              <MediaTile name={item.media} className="aspect-square w-full soft-frame" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  )
}
