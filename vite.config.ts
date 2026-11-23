import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Le DSFR contient des media queries réservées à Internet Explorer (min-width:0\0)
  // que le minificateur refuse : on les ignore.
  css: {
    lightningcss: { errorRecovery: true },
  },
  // MapLibre (moteur de carte) pèse environ 300 ko compressés ; il n'est chargé qu'avec la carte.
  build: { chunkSizeWarningLimit: 1200 },
  // Le pré-empaquetage de Vite casse l'adresse du « worker » de MapLibre en développement.
  optimizeDeps: { exclude: ['maplibre-gl'] },
})
