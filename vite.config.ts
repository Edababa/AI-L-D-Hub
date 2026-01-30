import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path for GitHub Pages compatibility
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  define: {
    // This replaces 'process.env.API_KEY' in your code with the actual key during build.
    // This prevents "process is not defined" errors in the browser.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})
