import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Scans public/memories/ and exposes every photo and video it finds (whatever
 * their names) as the virtual module "virtual:memories-manifest": a plain list
 * of file names. The site shuffles this pile on every visit and deals it out
 * to the cube, the memory frames, the reel and the closing picture.
 */
const VIRTUAL_ID = 'virtual:memories-manifest'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.m4v', '.mov'])

export function memoriesManifest(): Plugin {
  let dir = ''

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
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(scan())}`
    },
    configureServer(server) {
      // Reload the page when media is added, renamed or removed during development.
      server.watcher.add(dir)
      const refresh = (file: string) => {
        if (!file.startsWith(dir)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}
