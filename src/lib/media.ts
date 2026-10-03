import manifest from 'virtual:memories-manifest'

export type MediaInfo = { name: string; src: string | null; kind: 'image' | 'video' | 'missing' }

/** Finds the file for a media name like 'story-01' in public/memories/. */
export function getMedia(name: string): MediaInfo {
  const file = manifest[name.toLowerCase()]
  if (!file) return { name, src: null, kind: 'missing' }
  const src = `${import.meta.env.BASE_URL}memories/${file}`
  return { name, src, kind: file.toLowerCase().endsWith('.mp4') ? 'video' : 'image' }
}
