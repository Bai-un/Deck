import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          'vendor-tauri': ['@tauri-apps/api', '@tauri-apps/plugin-dialog', '@tauri-apps/plugin-store', '@tauri-apps/plugin-shell'],
        },
      },
    },
  },
})
