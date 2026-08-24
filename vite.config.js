import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/geniuspay': {
        target: 'https://geniuspay.ci/api/v1/merchant',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geniuspay/, ''),
      },
    },
  },
})
