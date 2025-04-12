import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// CSS 命名空间插件
const cssNamespacePlugin = () => {
  const namespace = '[data-sub-app="true"]'
  return {
    name: 'css-namespace',
    transform(code, id) {
      if (id.endsWith('.css') || id.endsWith('.jsx')) {
        if (code.includes('[data-sub-app="true"]')) return code;
        
        if (id.endsWith('.jsx')) {
          return code.replace(
            /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
            (_, start, css, end) => {
              if (css.includes('scoped')) return _;
              const namespacedCss = css
                .split('}')
                .map(rule => {
                  if (!rule.trim()) return rule;
                  const [selector, ...rest] = rule.split('{');
                  if (selector.trim().startsWith('@')) return rule + '}';
                  if (selector.trim().startsWith(':root') || 
                      selector.trim().startsWith('body') || 
                      selector.trim().startsWith('html')) {
                    return rule + '}';
                  }
                  return `${namespace} ${selector.trim()} {${rest.join('{')}}`;
                })
                .join('');
              return `${start}${namespacedCss}${end}`;
            }
          );
        }
      }
      return code;
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssNamespacePlugin()
  ],
  server: {
    port: 5176,
    cors: true,
    open: true // 自动打开浏览器
  },
  build: {
    outDir: '../main-app/public/react-app',  // 输出到主应用的 public 目录
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        micro: resolve(__dirname, 'src/main.jsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'micro' ? 'react-app.js' : '[name]-[hash].js'
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (ext === 'css') {
            return `style.css`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    // 确保 CSS 文件被单独提取
    cssCodeSplit: false,
    // 确保资源文件使用相对路径
    assetsInlineLimit: 0
  }
}) 