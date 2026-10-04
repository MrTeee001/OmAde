import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Scans public/memories/ and exposes every photo and video it finds (whatever
 * their names) as the virtual module "virtual:memories-manifest", plus the
 * song in public/audio/ (if there is one). The site shuffles the photos and
 * videos on every visit and deals them out to the cube, frames and reel.
 */
const VIRTUAL_ID = 'virtual:memories-manifest'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const AUDIO = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.wav'])
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.m4v', '.mov'])

export function memoriesManifest(): Plugin {
  let dir = ''
  let audioDir = ''

  const findSong = () => {
    if (!fs.existsSync(audioDir)) return null
    return fs.readdirSync(audioDir).filter((f) => AUDIO.has(path.extname(f).toLowerCase())).sort()[0] ?? null
  }

  const scan = () => {
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter((file) => !file.startsWith('.') && ALLOWED.has(path.extname(file).toLowerCase()))
      .sort()
  }

  return {
    name: 'memories-manifest',
    configResolved(config) {
      dir = path.join(config.publicDir, 'memories')
      audioDir = path.join(config.publicDir, 'audio')
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify({ media: scan(), song: findSong() })}`
    },
    configureServer(server) {
      // Reload the page when media is added, renamed or removed during development.
      server.watcher.add([dir, audioDir])
      const refresh = (file: string) => {
        if (!file.startsWith(dir) && !file.startsWith(audioDir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}
