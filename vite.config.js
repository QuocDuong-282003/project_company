// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Bất kỳ request nào tới /api trên dev server...
      '/api': {
        // ...sẽ được chuyển tới backend của bạn
        target: 'http://127.0.0.1:8000',
        // Xóa tiền tố /api trước khi gửi tới backend
        // Ví dụ: /api/login-recognize -> /login-recognize
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
})