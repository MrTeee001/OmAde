import { memories } from '../../memories'
import { Heart } from '../Heart'
import { SectionHeading } from './SectionHeading'

type Group = { title: string; lines: string[]; tone: 'blue' | 'rose' }

/**
 * The little things: two loose, staggered groups of small cards that float
 * gently and lift on hover. Ade's lines are blue, Omolade's are rose.
 */
export function LittleThings() {
  const { names, loveLines } = memories
  const groups: Group[] = [
    { title: `${names.first} on ${names.second}`, lines: loveLines.adeOnOmolade, tone: 'blue' },
    { title: `${names.second} on ${names.first}`, lines: loveLines.omoladeOnAde, tone: 'rose' },
  ]

  return (
    <section className="shell section-gap" aria-labelledby="little-title">
      <SectionHeading id="little-title">The little things</SectionHeading>

      <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-12">
        {groups.map((group) => (
          <div key={group.title}>
            <p className={`label text-center tone-${group.tone}-text`} data-reveal>
              {group.title}
            </p>
            <ul className="little-grid mt-8">
              {group.lines.map((line, i) => (
                <li key={i} className="little-float" style={{ animationDelay: `${-i * 1.7}s`, animationDuration: `${6 + (i % 3)}s` }} data-reveal>
                  <div className={`little-card tone-${group.tone}`}>
                    <Heart size={14} className="little-heart" />
                    <p>{line}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
