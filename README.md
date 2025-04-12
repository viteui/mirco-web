# Vue3 微前端实现方案

这是一个基于 Vue3 的微前端实现方案，通过简单而优雅的方式实现了主应用和子应用的集成。本方案不依赖任何微前端框架，而是通过 Vue3 的组件机制和自定义加载器实现应用间的集成。

## 项目特点

- 🚀 基于 Vue3 + Vite，享受现代开发体验
- 🎨 完善的样式隔离方案，避免样式污染
- 🌓 支持亮色/暗色主题自适应
- 📦 子应用支持独立运行和集成模式
- 🔌 简单的插件机制，易于扩展
- 🛠 开发部署配置完备

## 项目结构

```
├── main-app/          # 主应用
│   ├── public/        # 静态资源
│   │   └── sub-app/   # 子应用构建产物
│   ├── src/
│   │   ├── loader/    # 微前端加载器
│   │   │   ├── index.js     # 加载器入口
│   │   │   └── types.ts     # 类型定义
│   │   ├── components/      # 组件
│   │   │   └── AsyncComponent.vue  # 异步组件封装
│   │   ├── App.vue          # 主应用入口组件
│   │   └── main.js          # 主应用入口文件
│   ├── package.json   # 主应用依赖配置
│   └── vite.config.js # 主应用构建配置
│
└── sub-app/           # 子应用
    ├── src/
    │   ├── components/# 子应用组件
    │   ├── App.vue    # 子应用入口组件
    │   └── main.js    # 子应用入口文件
    ├── package.json   # 子应用依赖配置
    └── vite.config.js # 子应用构建配置
```

## 实现步骤

### 1. 项目初始化

1. 创建主应用
```bash
# 使用 Vite 创建主应用
npm create vite@latest main-app -- --template vue
cd main-app
npm install
```

2. 创建子应用1
```bash
# 使用 Vite 创建子应用1
npm create vite@latest sub-app -- --template vue
cd sub-app
npm install
```

3. 创建子应用2
```bash
# 使用 Vite 创建子应用2
npm create vite@latest sub-app2 -- --template vue
cd sub-app2
npm install
```

### 2. 主应用实现

1. 创建微应用加载器
```javascript
// main-app/src/loader/index.js
export class MicroLoader {
  constructor() {
    this.apps = new Map();
    this.styles = new Map();
    this.sandboxes = new Map();
    window.__MICRO_APP_ENVIRONMENT__ = true;
    window.microLoader = this;
    window.registerMicroApp = (name, appInstance) => {
      this.registerMicroApp(name, appInstance);
    };
  }

  // 注册子应用
  registerMicroApp(name, appInstance) {
    this.apps.set(name, {
      instance: appInstance,
      mountPoint: `#${name}-mount`
    });
  }

  // 加载远程脚本
  async loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'module';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 加载远程样式
  async loadStyle(url, appName) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-micro-app', appName);
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
      this.styles.set(appName, link);
    });
  }

  // 加载远程应用
  async loadApp(config) {
    const { name, js, css } = config;
    if (this.apps.has(name)) return;
    
    await this.loadScript(js);
    if (css) await this.loadStyle(css, name);
  }

  // 挂载应用
  async mountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) return;
    await app.instance.bootstrap();
    await app.instance.mount(app.mountPoint);
  }

  // 卸载应用
  async unmountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) return;
    await app.instance.unmount();
  }
}
```

2. 实现 JS 沙箱
```javascript
// main-app/src/loader/sandbox.js
export class EnhancedJsSandbox {
  constructor(appName) {
    this.appName = appName;
    this.windowSnapshot = {};
    this.modifiedMap = {};
    this.proxyWindow = null;
  }

  activate() {
    this.windowSnapshot = this.snapshotWindow();
    this.proxyWindow = new Proxy(window, {
      get: (target, prop) => {
        if (this.modifiedMap.hasOwnProperty(prop)) {
          return this.modifiedMap[prop];
        }
        return target[prop];
      },
      set: (target, prop, value) => {
        this.modifiedMap[prop] = value;
        return true;
      }
    });
    window.__MICRO_APP_PROXY__ = this.proxyWindow;
    return this.proxyWindow;
  }

  deactivate() {
    for (const prop in this.modifiedMap) {
      if (this.windowSnapshot.hasOwnProperty(prop)) {
        window[prop] = this.windowSnapshot[prop];
      } else {
        delete window[prop];
      }
    }
    this.modifiedMap = {};
    this.proxyWindow = null;
    delete window.__MICRO_APP_PROXY__;
  }

  snapshotWindow() {
    const snapshot = {};
    for (const prop in window) {
      if (window.hasOwnProperty(prop)) {
        snapshot[prop] = window[prop];
      }
    }
    return snapshot;
  }
}
```

3. 主应用入口组件
```vue
<!-- main-app/src/App.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { microLoader } from './loader'

const currentApp = ref('sub-app1')

const apps = [
  {
    name: 'sub-app1',
    js: 'http://localhost:5174/src/main.js',
    css: 'http://localhost:5174/src/style.css'
  },
  {
    name: 'sub-app2',
    js: 'http://localhost:5175/src/main.js',
    css: 'http://localhost:5175/src/style.css'
  }
]

const loadAndMountApp = async (appName) => {
  if (currentApp.value && currentApp.value !== appName) {
    await microLoader.unmountApp(currentApp.value)
  }
  const appConfig = apps.find(app => app.name === appName)
  if (!appConfig) return
  await microLoader.loadApp(appConfig)
  await microLoader.mountApp(appName)
  currentApp.value = appName
}

onMounted(() => loadAndMountApp(currentApp.value))
onUnmounted(() => microLoader.unmountApp(currentApp.value))
</script>

<template>
  <div class="main-app">
    <header>
      <h1>主应用</h1>
      <nav>
        <button 
          v-for="app in apps" 
          :key="app.name"
          :class="{ active: currentApp === app.name }"
          @click="loadAndMountApp(app.name)"
        >
          {{ app.name }}
        </button>
      </nav>
    </header>

    <main>
      <div class="sub-apps-container">
        <div v-show="currentApp === 'sub-app1'" class="sub-app-wrapper" data-sub-app="true">
          <div id="sub-app1-mount"></div>
        </div>
        <div v-show="currentApp === 'sub-app2'" class="sub-app-wrapper" data-sub-app="true">
          <div id="sub-app2-mount"></div>
        </div>
      </div>
    </main>
  </div>
</template>
```

### 3. 子应用实现

1. 子应用入口文件
```javascript
// sub-app/src/main.js
import { createApp } from 'vue'
import App from './App.vue'

let app = null

const microApp = {
  bootstrap: async () => {
    console.log('sub-app1 bootstrapped')
    app = createApp(App)
  },
  mount: async (mountPoint) => {
    console.log('Mounting sub-app1 to:', mountPoint)
    if (app) {
      const mountElement = document.querySelector(mountPoint || '#sub-app1-mount')
      if (mountElement) {
        app.mount(mountElement)
      }
    }
  },
  unmount: async () => {
    if (app) {
      app.unmount()
      app = null
    }
  }
}

if (window.__MICRO_APP_ENVIRONMENT__) {
  window.registerMicroApp('sub-app1', microApp)
} else {
  app = createApp(App)
  app.mount('#app')
}
```

2. 子应用组件
```vue
<!-- sub-app/src/App.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const addCount = () => count.value++
</script>

<template>
  <div class="sub-app" data-sub-app="true">
    <h2>子应用1</h2>
    <div class="content">
      <p>这是子应用1的内容</p>
      <button @click="addCount">点击我+</button>
      <p>当前计数: {{ count }}</p>
    </div>
  </div>
</template>

<style scoped>
.sub-app {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
```

### 4. 样式隔离实现

1. 创建 CSS 命名空间插件
```javascript
// sub-app/vite.config.js
const cssNamespacePlugin = () => {
  const namespace = '[data-sub-app="true"]'
  return {
    name: 'css-namespace',
    transform(code, id) {
      if (id.endsWith('.css') || id.endsWith('.vue')) {
        if (code.includes('[data-sub-app="true"]')) return code;
        
        if (id.endsWith('.vue')) {
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

export default defineConfig({
  plugins: [
    vue(),
    cssNamespacePlugin()
  ],
  server: {
    port: 5174,
    cors: true
  }
})
```

### 5. 运行应用

1. 启动主应用
```bash
cd main-app
npm run dev
```

2. 启动子应用1
```bash
cd sub-app
npm run dev
```

3. 启动子应用2
```bash
cd sub-app2
npm run dev
```

访问 http://localhost:5173 查看效果。

## 实现原理

1. 应用隔离
   - 通过 JS 沙箱实现 JavaScript 隔离
   - 通过 CSS 命名空间实现样式隔离
   - 通过独立端口实现开发环境隔离

2. 生命周期管理
   - bootstrap: 初始化应用
   - mount: 挂载应用
   - unmount: 卸载应用

3. 通信机制
   - 通过全局变量实现简单通信
   - 通过自定义事件实现复杂通信

## 注意事项

1. 开发环境
   - 确保所有应用使用不同的端口
   - 配置 CORS 允许跨域请求
   - 使用相对路径引用资源

2. 生产环境
   - 配置正确的资源路径
   - 实现资源预加载
   - 添加错误处理机制

3. 性能优化
   - 实现按需加载
   - 优化资源加载顺序
   - 添加缓存机制

## 后续优化

1. 功能增强
   - 添加预加载机制
   - 实现状态共享
   - 添加路由集成

2. 性能优化
   - 实现资源预加载
   - 优化加载策略
   - 添加性能监控

3. 开发体验
   - 完善开发工具
   - 提供调试功能
   - 优化错误提示

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。在提交之前，请确保：

1. Issue 描述清晰，包含复现步骤
2. Pull Request 遵循项目的代码规范
3. 更新相关的文档说明
4. 添加必要的测试用例

## 许可证

MIT License 