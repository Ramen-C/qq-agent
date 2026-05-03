import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createViteApiPlugin } from './api/_lib/viteApiPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 9527,
  },
  plugins: [
    vue(),
    createViteApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
