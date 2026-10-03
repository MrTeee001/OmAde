import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { memoriesManifest } from './plugins/memoriesManifest.ts'

export default defineConfig({
  // Relative paths so the built site works from any folder or host.
  base: './',
  plugins: [react(), tailwindcss(), memoriesManifest()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
