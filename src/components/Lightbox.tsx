import { useEffect, useRef, useState } from 'react'
import { MediaTile } from './MediaTile'
import { pauseScroll, resumeScroll } from '../lib/scroll'

export type LightboxItem = { media: string; caption: string }

type Props = {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
}

/** A photo or video shown large, with its caption. Esc or the backdrop closes it. */
export function Lightbox({ items, index, onClose, onChange }: Props) {
  const open = index !== null
  const [shown, setShown] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement
    pauseScroll()
    const id = requestAnimationFrame(() => {
      setShown(true)
      closeRef.current?.focus()
    })
    return () => {
      cancelAnimationFrame(id)
      setShown(false)
      resumeScroll()
      returnFocus.current?.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index! + 1) % items.length)
      if (e.key === 'ArrowLeft') onChange((index! - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, items.length, onClose, onChange])

  if (!open) return null
  const item = items[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className={`lightbox fixed inset-0 z-50 flex items-center justify-center px-4 py-16 sm:px-6 ${shown ? 'is-shown' : ''}`}
      onClick={onClose}
    >
      <div className="lightbox-panel flex w-full max-w-[720px] flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <MediaTile
          key={item.media}
          name={item.media}
          alt={item.caption}
          fit="contain"
          controls
          className="h-auto max-h-[70svh] w-auto max-w-full border border-white shadow-[0_8px_30px_rgba(111,168,245,0.12)]"
          placeholderClassName="aspect-square w-[min(100%,70svh)]"
        />
        <p className="mt-6 text-center font-display text-[22px] italic leading-snug text-ink sm:text-[26px]">{item.caption}</p>
        <div className="mt-6 flex items-center gap-2">
          <button type="button" className="pill-button" onClick={() => onChange((index - 1 + items.length) % items.length)} aria-label="Previous">
            ←
          </button>
          <span className="label tabular-nums px-2">
            {index + 1} / {items.length}
          </span>
          <button type="button" className="pill-button" onClick={() => onChange((index + 1) % items.length)} aria-label="Next">
            →
          </button>
        </div>
      </div>
      <button ref={closeRef} type="button" className="pill-button absolute top-5 right-5 sm:top-7 sm:right-7" onClick={onClose}>
        <span className="label !text-ink">Close</span>
      </button>
    </div>
  )
}
