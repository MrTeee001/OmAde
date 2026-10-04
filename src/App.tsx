import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { Background } from './components/Background'
import { FloatingHearts } from './components/FloatingHearts'
import { Hero } from './components/Hero'
import { Intro } from './components/Intro'
import { Memories } from './components/sections/Memories'
import { LittleThings } from './components/sections/LittleThings'
import { Reel } from './components/sections/Reel'
import { Letters } from './components/sections/Letters'
import { Closing } from './components/sections/Closing'
import { Song } from './components/Song'
import { CubeGrid } from './components/CubeGrid'
import { prefersReducedMotion } from './lib/motion'
import { hasWebGL, isLiteDevice } from './lib/device'
import { setLenis } from './lib/scroll'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

// Decided once per visit: full 3D story, or a calm static grid.
const lite = isLiteDevice()
const withCube = !prefersReducedMotion() && hasWebGL()

/** Smooth scrolling with Lenis, kept in step with GSAP ScrollTrigger. */
function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true })
    setLenis(lenis)
    // Stay still while the opening sequence plays; it starts scrolling again when done.
    if (document.documentElement.classList.contains('intro')) lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)

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
      setLenis(null)
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
  const [intro, setIntro] = useState(true)
  const endIntro = useCallback(() => {
    document.documentElement.classList.remove('intro')
    setIntro(false)
  }, [])

  return (
    <>
      {intro && <Intro onDone={endIntro} />}
      <Song />
      <Background />
      <FloatingHearts />
      <main>
        <Hero withCube={withCube} lite={lite} intro={intro} />
        {!withCube && <CubeGrid />}

        <Memories />
        <LittleThings />
        <Reel />
        <Letters />
        <Closing />
      </main>
    </>
  )
}
