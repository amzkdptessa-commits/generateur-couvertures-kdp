import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CONFIG DÉDIÉE AU GÉNÉRATEUR REACT
// N'impacte PAS les autres builds !
export default defineConfig({
  plugins: [react()],
  base: './', // ← CHEMINS RELATIFS pour Go Live / Netlify / file://
  build: {
    outDir: 'dist-generator', // ← Dossier séparé pour éviter conflits
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
})
