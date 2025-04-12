import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    cors: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  // 配置静态资源目录
  publicDir: 'public',
  // 配置构建输出目录
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
