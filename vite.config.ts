import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base path is best for GitHub Pages sub-folders
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    // Safely inject the API key from the environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
})
