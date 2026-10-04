import { useEffect, useState, type Ref } from 'react'
import { getMedia } from '../lib/media'
import { useInView } from '../lib/useInView'

type Props = {
  name: string
  alt?: string
  className?: string
  /** 'cover' fills the tile (cropping); 'contain' shows the whole picture. */
  fit?: 'cover' | 'contain'
  /** Show video controls (used in the lightbox). */
  controls?: boolean
  /** Classes for the placeholder only, e.g. to give it a size when the media would size itself. */
  placeholderClassName?: string
  /** Videos: sound off (default). */
  muted?: boolean
  /** Lets a parent reach the <video> (e.g. to unmute it). */
  videoRef?: Ref<HTMLVideoElement>
}

const GRADIENT = 'linear-gradient(135deg, #CFE3FF 0%, #FFFFFF 50%, #FFD3E4 100%)'

/**
 * Shows a photo or video from public/memories/.
 * - Photos load lazily and fade in.
 * - Videos show a soft gradient (then their first frame) and only load once near
 *   the screen; they play muted and looped while visible and pause when not.
 * - If a file is missing (or fails), a soft gradient tile shows its file name.
 */
export function MediaTile({
  name,
  alt = '',
  className = '',
  fit = 'cover',
  controls = false,
  placeholderClassName = '',
  muted = true,
  videoRef,
}: Props) {
  const media = getMedia(name)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const { ref, near, visible } = useInView<HTMLVideoElement>()
  const base = `relative overflow-hidden rounded-[24px] ${className}`
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain'

  // Play only while on screen.
  useEffect(() => {
    const v = ref.current
    if (!v || media.kind !== 'video' || !near) return
    if (visible) v.play().catch(() => {})
    else v.pause()
  }, [visible, near, media.kind, ref])

  if (media.kind === 'missing' || failed) {
    return (
      <div
        className={`${base} ${placeholderClassName} flex items-center justify-center border border-white`}
        style={{ background: GRADIENT }}
        role="img"
        aria-label={alt || `Placeholder for ${name}`}
      >
        {/* Only empty spots get a label; a real file that failed to load just stays a soft tile. */}
        {media.kind === 'missing' && <span className="label rounded-full bg-white/70 px-3 py-1">{name}</span>}
      </div>
    )
  }

  if (media.kind === 'video') {
    return (
      <video
        ref={(el) => {
          ;(ref as { current: HTMLVideoElement | null }).current = el
          if (typeof videoRef === 'function') videoRef(el)
          else if (videoRef) (videoRef as { current: HTMLVideoElement | null }).current = el
        }}
        className={`${base} ${fitClass}`}
        style={{ background: GRADIENT }}
        src={near ? media.src! : undefined}
        muted={muted}
        loop
        playsInline
        controls={controls}
        preload={near ? 'metadata' : 'none'}
        aria-label={alt}
        onError={() => near && setFailed(true)}
      />
    )
  }

  return (
    <img
      className={`${base} ${fitClass} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: GRADIENT }}
      src={media.src!}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  )
}
