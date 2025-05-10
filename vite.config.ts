import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Default Vite port
  },
  preview: {
    host: '0.0.0.0', // Also apply to preview server
    port: 4173, // Default Vite preview port
  },
})
