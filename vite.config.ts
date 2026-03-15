import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Ensure BROWSER is set to prevent auto-opening
process.env.BROWSER = process.env.BROWSER || 'none'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    middlewareMode: false,
    allowedHosts: true
  },
  build: {
    target: 'esnext',
  },
  preview: {
    port: 4173,
    open: false,
  },
})
