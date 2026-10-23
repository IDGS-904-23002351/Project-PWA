import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo-nomi.png', 'logo-nomi-blanco.png', 'isotipo-nomi.png'],
      manifest: {
        name: 'Nomi - Asistencia y nómina',
        short_name: 'Nomi',
        description: 'Control de asistencia y nómina para Calzado Alba',
        lang: 'es-MX',
        theme_color: '#1E3A8A',
        background_color: '#F8FAFC',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
