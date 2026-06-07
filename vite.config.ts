import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // exceljs-heavy integration tests can exceed the 5s default under parallel load
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  server: {
    host: true, // listen on IPv4 + IPv6 so localhost resolves either way (avoids ERR_CONNECTION_REFUSED)
    proxy: {
      '/supabase': {
        target: 'https://xwkwrimpyfkgshfbzfqn.supabase.co',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/supabase/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['arquero', 'exceljs']
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  }
})
