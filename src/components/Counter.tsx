import { useEffect, useState } from 'react'
import { elapsedInLagos } from '../lib/time'

const pad = (n: number) => String(n).padStart(2, '0')

/** "Together for X days", ticking live on Nigerian time from midnight (Lagos) on the start date. */
export function Counter({ startDate }: { startDate: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // Tick exactly on each new second.
    let timer: number
    const tick = () => {
      setNow(Date.now())
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    }
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000))
    return () => clearTimeout(timer)
  }, [])

  const { days, hours, minutes, seconds } = elapsedInLagos(startDate, now)
  const units = [
    { value: hours, label: hours === 1 ? 'hour' : 'hours' },
    { value: minutes, label: minutes === 1 ? 'minute' : 'minutes' },
    { value: seconds, label: seconds === 1 ? 'second' : 'seconds' },
  ]

  return (
    <div aria-live="off">
      <p className="font-display text-ink" style={{ lineHeight: 1 }}>
        <span className="text-[22px] italic text-ink-soft md:text-[26px]">Together for </span>
        <span className="text-[64px] tabular-nums tracking-tight md:text-[88px]" style={{ fontWeight: 350 }}>
          {days.toLocaleString('en-GB')}
        </span>
        <span className="text-[22px] italic text-ink-soft md:text-[26px]"> {days === 1 ? 'day' : 'days'}</span>
      </p>
      <div className="mt-5 flex flex-wrap gap-1.5 sm:gap-2">
        {units.map((u) => (
          <span key={u.label.replace(/s$/, '')} className="card inline-flex items-baseline gap-1.5 px-3 py-1.5 sm:px-3.5" style={{ borderRadius: 999 }}>
            <span className="font-display text-[17px] tabular-nums text-ink sm:text-[18px]">{pad(u.value)}</span>
            <span className="label !text-[10.5px] sm:!text-[12px]">{u.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
