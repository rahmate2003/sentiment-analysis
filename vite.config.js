import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api-sentiment-analysis-gamma.vercel.app/',  // Menggunakan URL yang sudah didefinisikan
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Menghapus /api prefix jika diperlukan
      },
    },
  },
});