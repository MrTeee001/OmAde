import { useEffect, useRef } from 'react'

/**
 * Fixed backdrop: an off-white base with large, blurred colour fields that
 * drift slowly (40s loop). The blue fields fade as you scroll down and the
 * pink fields grow, so the page leans blue at the top and pink at the bottom.
 */
export function Background() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.setProperty('--p', progress.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base"
      style={{ ['--p' as string]: 0 }}
    >
      {/* Blue — strongest at the top of the page */}
      <div className="absolute inset-0" style={{ opacity: 'calc(1 - var(--p) * 0.75)' }}>
        <div className="field field-a bg-baby-blue" style={{ width: '70vmax', height: '70vmax', top: '-30vmax', left: '-18vmax', opacity: 0.9 }} />
        <div className="field field-c bg-baby-blue" style={{ width: '48vmax', height: '48vmax', top: '-10vmax', right: '-20vmax', opacity: 0.6 }} />
      </div>

      {/* White — a gentle bright patch that wanders through the middle */}
      <div className="field field-b bg-white" style={{ width: '55vmax', height: '55vmax', top: '15vh', left: '20vw', opacity: 0.85 }} />

      {/* Pink — grows as you reach the bottom of the page */}
      <div className="absolute inset-0" style={{ opacity: 'calc(0.35 + var(--p) * 0.65)' }}>
        <div className="field field-b bg-blush" style={{ width: '65vmax', height: '65vmax', bottom: '-32vmax', right: '-15vmax', opacity: 0.95 }} />
        <div className="field field-a bg-blush" style={{ width: '45vmax', height: '45vmax', bottom: '-12vmax', left: '-20vmax', opacity: 0.7 }} />
      </div>
    </div>
  )
}
