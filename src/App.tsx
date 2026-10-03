import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Background } from './components/Background'
import { FloatingHearts } from './components/FloatingHearts'
import { Hero } from './components/Hero'
import { prefersReducedMotion } from './lib/motion'

gsap.registerPlugin(ScrollTrigger)

/** Smooth scrolling with Lenis, kept in step with GSAP ScrollTrigger. */
function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Let in-page links (like the scroll hint) glide too.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="#"]')
      const id = link?.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement)
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}

/** Fades every [data-reveal] element up 20px over 600ms as it enters the screen. */
function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: Number(el.dataset.revealDelay ?? 0),
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          },
        )
      })
    })
    return () => ctx.revert()
  }, [])
}

export default function App() {
  useSmoothScroll()
  useReveal()

  return (
    <>
      <Background />
      <FloatingHearts />
      <main>
        <Hero />

        {/* Next stages (cube, story, reels, letters…) will be added below. */}
        <section id="next" className="shell section-gap pb-40">
          <div className="card mx-auto max-w-[560px] px-8 py-12 text-center" data-reveal>
            <p className="label">Coming soon</p>
            <p className="mt-4 font-display text-[28px] italic leading-snug text-ink">
              More of our story is on its way.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
