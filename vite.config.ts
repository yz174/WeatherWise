import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Generate source maps for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'charts-vendor': ['recharts'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    },
    // Minify for production
    minify: 'terser'
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  },
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true
  }
})
