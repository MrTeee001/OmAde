import { Heart } from './Heart'

// Fixed values (not random) so the hearts sit in the same calm places every visit.
const HEARTS = [
  { left: '6%', size: 14, duration: 34, delay: -4, opacity: 0.16, sway: 18, color: '#F58FB5' },
  { left: '18%', size: 10, duration: 42, delay: -22, opacity: 0.12, sway: -14, color: '#6FA8F5' },
  { left: '33%', size: 12, duration: 38, delay: -12, opacity: 0.14, sway: 12, color: '#F58FB5' },
  { left: '52%', size: 9, duration: 46, delay: -30, opacity: 0.12, sway: -10, color: '#F58FB5' },
  { left: '68%', size: 13, duration: 36, delay: -18, opacity: 0.15, sway: 16, color: '#6FA8F5' },
  { left: '82%', size: 11, duration: 44, delay: -8, opacity: 0.13, sway: -18, color: '#F58FB5' },
  { left: '93%', size: 15, duration: 40, delay: -26, opacity: 0.14, sway: 10, color: '#F58FB5' },
]

/** A few small hearts drifting upward very slowly behind everything. */
export function FloatingHearts() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className="floating-heart"
          style={{
            left: h.left,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            ['--heart-opacity' as string]: h.opacity,
            ['--heart-sway' as string]: `${h.sway}px`,
          }}
        >
          <Heart size={h.size} color={h.color} />
        </span>
      ))}
    </div>
  )
}
