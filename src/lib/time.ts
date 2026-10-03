/**
 * Lagos (Africa/Lagos) is UTC+1 all year with no daylight saving,
 * so midnight in Lagos is always 23:00 UTC of the previous day.
 */
const LAGOS_OFFSET_MS = 60 * 60 * 1000

/** Midnight Lagos time on a 'YYYY-MM-DD' date, as a UTC timestamp. */
export function lagosMidnight(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  return Date.UTC(y, m - 1, d) - LAGOS_OFFSET_MS
}

export type Elapsed = { days: number; hours: number; minutes: number; seconds: number }

/** Whole days, hours, minutes and seconds between start and now (never negative). */
export function elapsedSince(start: number, now: number = Date.now()): Elapsed {
  const total = Math.max(0, Math.floor((now - start) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}
