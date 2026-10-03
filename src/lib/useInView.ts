import { useEffect, useRef, useState } from 'react'

/**
 * Watches whether an element is on (or near) the screen.
 * `near` turns true once it comes within `margin` and stays true (for loading);
 * `visible` follows whether it is actually on screen (for playing/pausing).
 */
export function useInView<T extends Element>(margin = '400px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const nearObs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          nearObs.disconnect()
        }
      },
      { rootMargin: margin },
    )
    const visObs = new IntersectionObserver((entries) => setVisible(entries[entries.length - 1].isIntersecting), {
      threshold: 0.25,
    })
    nearObs.observe(el)
    visObs.observe(el)
    return () => {
      nearObs.disconnect()
      visObs.disconnect()
    }
  }, [margin])

  return { ref, near, visible }
}
