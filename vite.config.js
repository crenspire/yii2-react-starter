import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx}',
    }),
  ],
  root: '.',
  publicDir: false,
  server: {
    port: 5173,
    strictPort: true,
    origin: 'http://localhost:5173',
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    outDir: 'web/dist',
    manifest: true,
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'resources/js/app.jsx'),
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@inertiajs/react'],
  },
})
