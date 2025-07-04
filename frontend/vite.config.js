import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://3.39.127.143', // 👉 여기에 백엔드 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // 필요 시 수정
      },
      '/uploads': {
        target: 'http://3.39.127.143',
        changeOrigin: true,
      },
    },
  },
})
