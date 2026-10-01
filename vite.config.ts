import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { logosPlugin } from './scripts/logos-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so dist/ works in public_html or any subfolder on Hostinger.
  base: './',
  plugins: [react(), logosPlugin(import.meta.dirname)],
  build: {
    // One bundle of ~610 kB (~195 kB gzipped): React, Motion and the markdown renderer
    // are all needed on first paint, so splitting would not make the page load faster.
    chunkSizeWarningLimit: 700,
  },
})
