/// <reference types="vite/client" />

declare module 'virtual:memories-manifest' {
  /** Every photo/video file name in public/memories/, and the song file in public/audio/ (or null). */
  const manifest: { media: string[]; song: string | null }
  export default manifest
}
