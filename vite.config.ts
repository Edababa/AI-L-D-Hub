import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Using relative base paths ensures it works on any GitHub Pages URL
  base: './', 
  build: {
    outDir: 'dist',
  },
  define: {
    // This allows the Gemini SDK to access process.env.API_KEY in the browser
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
