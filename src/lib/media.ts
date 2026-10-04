import files from 'virtual:memories-manifest'

export type MediaInfo = {
  name: string
  src: string | null
  kind: 'image' | 'video' | 'missing'
}

const VIDEO = /\.(mp4|webm|m4v|mov)$/i
const available = new Set(files)

/** Every photo and video in public/memories/, whatever their names. */
export const allMedia = files
export const isVideo = (file: string) => VIDEO.test(file)

/**
 * Looks up a file from public/memories/. Anything that isn't a real file
 * (e.g. the word "photo" for an empty spot) comes back as 'missing', which
 * shows a soft placeholder tile instead.
 */
export function getMedia(name: string): MediaInfo {
  if (!available.has(name)) return { name, src: null, kind: 'missing' }
  const src = `${import.meta.env.BASE_URL}memories/${encodeURIComponent(name)}`
  return { name, src, kind: isVideo(name) ? 'video' : 'image' }
}
