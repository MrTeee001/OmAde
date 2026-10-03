import { useState } from 'react'
import { getMedia } from '../lib/media'

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
}

/**
 * Shows a photo or video from public/memories/. If the file isn't there
 * (or fails to load), shows a soft gradient tile with the file name instead.
 */
export function MediaTile({ name, alt = '', className = '', fit = 'cover', controls = false, placeholderClassName = '' }: Props) {
  const media = getMedia(name)
  const [failed, setFailed] = useState(false)
  const base = `relative overflow-hidden rounded-[24px] ${className}`
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain'

  if (media.kind === 'missing' || failed) {
    return (
      <div
        className={`${base} ${placeholderClassName} flex items-center justify-center border border-white`}
        style={{ background: 'linear-gradient(135deg, #CFE3FF 0%, #FFFFFF 50%, #FFD3E4 100%)' }}
        role="img"
        aria-label={alt || `Placeholder for ${name}`}
      >
        <span className="label rounded-full bg-white/70 px-3 py-1">{name}</span>
      </div>
    )
  }

  if (media.kind === 'video') {
    return (
      <video
        className={`${base} ${fitClass}`}
        src={media.src!}
        muted
        loop
        playsInline
        autoPlay
        controls={controls}
        preload="metadata"
        aria-label={alt}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <img
      className={`${base} ${fitClass}`}
      src={media.src!}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
