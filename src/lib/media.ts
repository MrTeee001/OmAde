import manifest from 'virtual:memories-manifest'

export type MediaInfo = {
  name: string
  src: string | null
  kind: 'image' | 'video' | 'missing'
  /** Optional still shown before a video loads: a file named "<name>-poster" (.jpg/.png/.webp). */
  poster: string | null
}

const url = (file: string) => `${import.meta.env.BASE_URL}memories/${file}`

/** Finds the file for a media name like 'memory-01' in public/memories/. */
export function getMedia(name: string): MediaInfo {
  const file = manifest[name.toLowerCase()]
  const posterFile = manifest[`${name.toLowerCase()}-poster`]
  const poster = posterFile && !posterFile.toLowerCase().endsWith('.mp4') ? url(posterFile) : null
  if (!file) return { name, src: null, kind: 'missing', poster: null }
  return { name, src: url(file), kind: file.toLowerCase().endsWith('.mp4') ? 'video' : 'image', poster }
}
