import type { ReactNode } from 'react'

/** A section's heading, in the display face, fading up as it enters. */
export function SectionHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="section-heading text-center text-ink" data-reveal>
      {children}
    </h2>
  )
}
