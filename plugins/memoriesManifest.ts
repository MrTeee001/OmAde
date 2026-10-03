import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Scans public/memories/ and exposes the files it finds as the virtual module
 * "virtual:memories-manifest" — a map from base name ("story-01") to the file
 * that exists ("story-01.webp"). This lets the site know which media is present
 * without a backend and without probing URLs at runtime.
 */
const VIRTUAL_ID = 'virtual:memories-manifest'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4'])
// When several formats share a name, prefer them in this order.
const PRIORITY = ['.webp', '.jpg', '.jpeg', '.png', '.mp4']

export function memoriesManifest(): Plugin {
  let dir = ''

  const scan = () => {
    const found: Record<string, string> = {}
    if (!fs.existsSync(dir)) return found
    for (const file of fs.readdirSync(dir)) {
      const ext = path.extname(file).toLowerCase()
      if (!ALLOWED.has(ext)) continue
      const name = path.basename(file, path.extname(file)).toLowerCase()
      const current = found[name]
      if (!current || PRIORITY.indexOf(ext) < PRIORITY.indexOf(path.extname(current).toLowerCase())) {
        found[name] = file
      }
    }
    return found
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
