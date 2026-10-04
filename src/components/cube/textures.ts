import * as THREE from 'three'
import { getMedia } from '../../lib/media'

export type FaceTexture = {
  texture: THREE.Texture
  /** Scale applied to UVs so the picture covers a square face (used for video). */
  uvScale: THREE.Vector2
  video: HTMLVideoElement | null
  dispose: () => void
}

/** Soft blue → white → pink tile; empty spots also get a small label (e.g. "PHOTO"). */
function drawPlaceholder(name: string | null, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  // Day: baby blue → white → blush. Night: deep blue → indigo → plum.
  const night = document.documentElement.getAttribute('data-theme') === 'dark'
  const g = ctx.createLinearGradient(0, 0, size, size)
  g.addColorStop(0, night ? '#1D2A52' : '#CFE3FF')
  g.addColorStop(0.5, night ? '#23264A' : '#FFFFFF')
  g.addColorStop(1, night ? '#3E2142' : '#FFD3E4')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  if (!name) return canvas

  const font = Math.round(size * 0.045)
  ctx.font = `600 ${font}px "Manrope Variable", Manrope, system-ui, sans-serif`
  const text = name.toUpperCase().split('').join(String.fromCharCode(8202))
  const w = ctx.measureText(text).width + font * 2.4
  const h = font * 2.6
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.beginPath()
  ctx.roundRect((size - w) / 2, (size - h) / 2, w, h, h / 2)
  ctx.fill()
  ctx.fillStyle = '#5B6078'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, size / 2, size / 2 + font * 0.05)
  return canvas
}

/** Crops an image to a centred square and shrinks it, so big phone photos upload quickly. */
function squareCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
  return canvas
}

function prepare(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/**
 * Builds the texture for one cube face. Starts with the placeholder and
 * swaps in the photo or video once it has loaded (via onChange).
 */
export function createFaceTexture(name: string, size: number, onChange: (face: FaceTexture) => void): FaceTexture {
  const media = getMedia(name)
  // Real files show no label while loading (or if they fail); empty spots say what goes there.
  const label = media.kind === 'missing' ? name : null
  const placeholderCanvas = drawPlaceholder(label, size)
  const placeholder = prepare(new THREE.CanvasTexture(placeholderCanvas))
  let disposed = false
  let current: THREE.Texture = placeholder
  let video: HTMLVideoElement | null = null

  const face: FaceTexture = {
    texture: placeholder,
    uvScale: new THREE.Vector2(1, 1),
    video: null,
    dispose: () => {
      disposed = true
      placeholder.dispose()
      if (current !== placeholder) current.dispose()
      if (video) {
        video.pause()
        video.removeAttribute('src')
        video.load()
      }
    },
  }

  // Redraw the placeholder label once the web font is ready.
  document.fonts?.ready.then(() => {
    if (disposed) return
    const ctx = placeholderCanvas.getContext('2d')!
    ctx.drawImage(drawPlaceholder(label, size), 0, 0)
    placeholder.needsUpdate = true
  })

  if (media.kind === 'image' && media.src) {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (disposed) return
      current = prepare(new THREE.CanvasTexture(squareCanvas(img, size)))
      onChange({ ...face, texture: current })
    }
    img.src = media.src
  }

  if (media.kind === 'video' && media.src) {
    video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.autoplay = true
    video.preload = 'auto'
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.src = media.src
    const v = video
    v.addEventListener(
      'loadeddata',
      () => {
        if (disposed) return
        const aspect = v.videoWidth / v.videoHeight || 1
        const tex = new THREE.VideoTexture(v)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.generateMipmaps = false
        tex.minFilter = THREE.LinearFilter
        current = tex
        // Cover-fit: crop the longer side.
        const uvScale = aspect > 1 ? new THREE.Vector2(1 / aspect, 1) : new THREE.Vector2(1, aspect)
        onChange({ ...face, texture: tex, uvScale, video: v })
      },
      { once: true },
    )
    v.play().catch(() => {})
  }

  return face
}
