import { memories } from '../memories'
import { Counter } from './Counter'
import { Heart } from './Heart'

export function Hero() {
  const { names, hero, startDate } = memories

  return (
    <section className="relative flex min-h-svh flex-col" aria-labelledby="hero-title">
      <div className="shell grid flex-1 items-center gap-12 pt-24 pb-36 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:pt-28">
        <div>
          <p className="label" data-reveal>
            {hero.label}
          </p>

          <h1 id="hero-title" className="heading mt-6 text-ink" data-reveal data-reveal-delay="0.08">
            <span className="italic">{names.first}</span>{' '}
            <span className="italic text-rose">&amp;</span>{' '}
            <span className="italic">{names.second}</span>
          </h1>

          <p className="mt-6 max-w-[34ch] text-ink-soft" data-reveal data-reveal-delay="0.16">
            {hero.line}
          </p>

          <div className="mt-12 md:mt-16" data-reveal data-reveal-delay="0.24">
            <Counter startDate={startDate} />
          </div>
        </div>

        {/* Reserved for the 3D cube (next stage). */}
        <div
          id="cube-slot"
          aria-hidden="true"
          className="relative mx-auto aspect-square w-full max-w-[300px] md:max-w-[440px]"
        />
      </div>

      <a
        href="#next"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-soft transition-colors hover:text-ink focus-visible:text-ink"
        aria-label="Scroll down"
      >
        <span className="label">Scroll</span>
        <span className="bounce-soft text-rose">
          <Heart size={16} />
        </span>
      </a>
    </section>
  )
}
