/**
 * The counter runs on Nigerian time: West Africa Time (Africa/Lagos, UTC+1,
 * no daylight saving). "Days" are whole Lagos calendar days since the start
 * date, and hours/minutes/seconds are the current Lagos clock time, so the
 * count ticks over at midnight in Lagos wherever the visitor is.
 */
export const TIME_ZONE = 'Africa/Lagos'
const LAGOS_OFFSET_MS = 60 * 60 * 1000 // used only if the browser can't do time zones

export type Elapsed = { days: number; hours: number; minutes: number; seconds: number }

let formatter: Intl.DateTimeFormat | null = null
try {
  formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  })
} catch {
  formatter = null
}

/** The date and clock time in Lagos at a given moment. */
function lagosClock(now: number) {
  if (formatter) {
    const parts: Record<string, number> = {}
    for (const p of formatter.formatToParts(new Date(now))) {
      if (p.type !== 'literal') parts[p.type] = Number(p.value)
    }
    return { y: parts.year, m: parts.month, d: parts.day, h: parts.hour % 24, min: parts.minute, s: parts.second }
  }
  const t = new Date(now + LAGOS_OFFSET_MS)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), min: t.getUTCMinutes(), s: t.getUTCSeconds() }
}

/** Time together since midnight (Lagos) on startDate ('YYYY-MM-DD'). Never negative. */
export function elapsedInLagos(startDate: string, now: number = Date.now()): Elapsed {
  const [sy, sm, sd] = startDate.split('-').map(Number)
  const c = lagosClock(now)
  const days = Math.round((Date.UTC(c.y, c.m - 1, c.d) - Date.UTC(sy, sm - 1, sd)) / 86400000)
  if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return { days, hours: c.h, minutes: c.min, seconds: c.s }
}
