import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// CSS 命名空间插件
const cssNamespacePlugin = () => {
  const namespace = '[data-sub-app="true"]'
  return {
    name: 'css-namespace',
    transform(code, id) {
      if (id.endsWith('.css') || id.endsWith('.vue')) {
        // 排除已经带有命名空间的规则
        if (code.includes('[data-sub-app="true"]')) {
          return code;
        }
        
        // 处理 <style> 块
        if (id.endsWith('.vue')) {
          return code.replace(
            /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
            (_, start, css, end) => {
              if (css.includes('scoped')) return _;
              // 为每个选择器添加命名空间
              const namespacedCss = css
                .split('}')
                .map(rule => {
                  if (!rule.trim()) return rule;
                  const [selector, ...rest] = rule.split('{');
                  // 跳过@规则
                  if (selector.trim().startsWith('@')) return rule + '}';
                  // 跳过已有命名空间的规则
                  if (selector.includes('[data-sub-app="true"]')) return rule + '}';
                  // 跳过全局样式
                  if (selector.trim().startsWith(':root') || selector.trim().startsWith('body') || selector.trim().startsWith('html')) {
                    return rule + '}';
                  }
                  return `${namespace} ${selector.trim()} {${rest.join('{')}}`;
                })
                .join('');
              return `${start}${namespacedCss}${end}`;
            }
          );
        }
        
        // 处理 .css 文件
        return code
          .split('}')
          .map(rule => {
            if (!rule.trim()) return rule;
            const [selector, ...rest] = rule.split('{');
            // 跳过@规则和已有命名空间的规则
            if (selector.trim().startsWith('@')) return rule + '}';
            if (selector.includes('[data-sub-app="true"]')) return rule + '}';
            // 跳过全局样式
            if (selector.trim().startsWith(':root') || selector.trim().startsWith('body') || selector.trim().startsWith('html')) {
              return rule + '}';
            }
            return `${namespace} ${selector.trim()} {${rest.join('{')}}`;
          })
          .join('');
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssNamespacePlugin()
  ],
  server: {
    port: 5175,  // 使用不同的端口
    cors: true
  },
  build: {
    outDir: '../main-app/public/sub-app2',  // 输出到主应用的 public 目录下的 sub-app2 文件夹
    // 同时支持独立运行和微应用模式
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        micro: resolve(__dirname, 'src/main.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'micro' ? 'sub-app2.js' : '[name]-[hash].js'
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
