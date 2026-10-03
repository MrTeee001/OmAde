import { useState } from 'react'
import { getMedia } from '../lib/media'

type Props = { name: string; alt?: string; className?: string }

/**
 * Shows a photo or video from public/memories/. If the file isn't there
 * (or fails to load), shows a soft gradient tile with the file name instead.
 */
export function MediaTile({ name, alt = '', className = '' }: Props) {
  const media = getMedia(name)
  const [failed, setFailed] = useState(false)
  const base = `relative overflow-hidden rounded-[24px] ${className}`

  if (media.kind === 'missing' || failed) {
    return (
      <div
        className={`${base} flex items-center justify-center border border-white`}
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
        className={`${base} object-cover`}
        src={media.src!}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <img
      className={`${base} object-cover`}
      src={media.src!}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
