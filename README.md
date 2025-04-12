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

## 实现原理

### 1. 子应用设计

子应用采用 Vue3 开发，通过特定的入口文件设计，实现了两种运行模式的无缝切换。

#### 子应用入口（sub-app/src/main.js）
```javascript
import { createApp, defineComponent, h } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 将子应用包装成组件
const SubApp = defineComponent({
  name: 'SubApp',
  setup() {
    return () => h(App)
  }
})

// 检查是否在微应用模式下运行
const isMicroApp = window.registerMicroComponent !== undefined;

console.log('Starting sub-app initialization');
console.log('isMicroApp mode:', isMicroApp);

if (isMicroApp) {
  // 微应用模式：注册组件
  console.log('Registering sub-app component');
  window.registerMicroComponent('sub-app', SubApp);
  console.log('Sub-app component registered');
} else {
  // 独立运行模式：直接挂载
  console.log('Mounting sub-app in standalone mode');
  app.mount('#app');
  console.log('Sub-app mounted');
}
```

### 2. 样式隔离方案

采用自定义的 Vite 插件实现样式隔离，通过 CSS 命名空间确保样式不会相互污染。

#### CSS 命名空间插件实现（sub-app/vite.config.js）
```javascript
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
                  // 跳过全局样式
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
    }
  }
}
```

样式隔离特点：
- 使用 `data-sub-app="true"` 属性作为命名空间
- 自动为所有选择器添加命名空间前缀
- 智能跳过全局样式和已有命名空间的规则
- 支持 CSS 变量实现主题切换
- 保留 @media 等特殊规则不添加命名空间

### 3. JavaScript 隔离方案

为了防止子应用之间的 JavaScript 污染和冲突，我们实现了以下隔离机制：

#### 3.1 沙箱实现（main-app/src/loader/sandbox.js）
```javascript
class JsSandbox {
  constructor(appName) {
    this.appName = appName;
    this.windowSnapshot = {};
    this.modifiedMap = {};
    this.proxyWindow = null;
  }

  // 激活沙箱
  activate() {
    // 记录当前 window 状态
    this.windowSnapshot = this.snapshotWindow();
    
    // 创建代理对象
    this.proxyWindow = new Proxy(window, {
      get: (target, prop) => {
        // 优先返回子应用修改的值
        if (this.modifiedMap.hasOwnProperty(prop)) {
          return this.modifiedMap[prop];
        }
        // 否则返回原始值
        return target[prop];
      },
      set: (target, prop, value) => {
        // 记录子应用的修改
        this.modifiedMap[prop] = value;
        return true;
      }
    });

    // 将代理对象挂载到全局
    window.__MICRO_APP_PROXY__ = this.proxyWindow;
    return this.proxyWindow;
  }

  // 停用沙箱
  deactivate() {
    // 清理子应用的修改
    for (const prop in this.modifiedMap) {
      if (this.windowSnapshot.hasOwnProperty(prop)) {
        window[prop] = this.windowSnapshot[prop];
      } else {
        delete window[prop];
      }
    }
    
    // 清理代理对象
    this.modifiedMap = {};
    this.proxyWindow = null;
    delete window.__MICRO_APP_PROXY__;
  }

  // 快照当前 window 对象
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

// 增强版沙箱（支持 eval/new Function 等）
class EnhancedJsSandbox extends JsSandbox {
  constructor(appName) {
    super(appName);
    this.evalCache = new Map();
  }

  // 重写 eval 和 new Function
  overrideEval() {
    const originalEval = window.eval;
    const originalFunction = window.Function;
    const self = this;

    // 代理 eval
    window.eval = function(code) {
      if (self.evalCache.has(code)) {
        return self.evalCache.get(code);
      }
      const result = originalEval.call(window, code);
      self.evalCache.set(code, result);
      return result;
    };

    // 代理 Function 构造函数
    window.Function = function(...args) {
      const code = args.join(',');
      if (self.evalCache.has(code)) {
        return self.evalCache.get(code);
      }
      const result = new originalFunction(...args);
      self.evalCache.set(code, result);
      return result;
    };
  }

  activate() {
    const proxyWindow = super.activate();
    this.overrideEval();
    return proxyWindow;
  }

  deactivate() {
    super.deactivate();
    this.evalCache.clear();
    // 恢复原始的 eval 和 Function
    window.eval = eval;
    window.Function = Function;
  }
}
```

#### 3.2 在加载器中集成沙箱（main-app/src/loader/index.js）
```javascript
class MicroLoader {
  constructor() {
    this.components = new Map();
    this.styles = new Map();
    this.sandboxes = new Map();
    console.log('MicroLoader initialized');
  }

  // 创建沙箱实例
  createSandbox(appName) {
    const sandbox = new EnhancedJsSandbox(appName);
    this.sandboxes.set(appName, sandbox);
    return sandbox;
  }

  // 加载远程应用
  async loadApp(appConfig) {
    const { name, js, css } = appConfig;
    console.log('Loading app:', name, { js, css });
    
    try {
      // 创建并激活沙箱
      const sandbox = this.createSandbox(name);
      sandbox.activate();

      // 加载 CSS
      if (css) {
        await this.loadStyle(css, name);
      }
      
      // 在沙箱环境中加载 JS
      if (js) {
        await this.loadScriptInSandbox(js, sandbox);
      }

      console.log('App loaded successfully:', name);
    } catch (error) {
      console.error('Failed to load app:', name, error);
      throw error;
    }
  }

  // 在沙箱环境中加载脚本
  async loadScriptInSandbox(url, sandbox) {
    const response = await fetch(url);
    const code = await response.text();
    
    // 将代码包装在立即执行函数中，并注入代理的 window 对象
    const wrappedCode = `
      (function(window) {
        with(window) {
          ${code}
        }
      })(window.__MICRO_APP_PROXY__);
    `;
    
    // 执行包装后的代码
    const scriptElement = document.createElement('script');
    scriptElement.text = wrappedCode;
    document.head.appendChild(scriptElement);
    document.head.removeChild(scriptElement);
  }

  // 卸载应用
  unloadApp(appName) {
    console.log('Unloading app:', appName);
    
    // 停用并清理沙箱
    const sandbox = this.sandboxes.get(appName);
    if (sandbox) {
      sandbox.deactivate();
      this.sandboxes.delete(appName);
    }

    // 移除样式
    const style = this.styles.get(appName);
    if (style) {
      document.head.removeChild(style);
      this.styles.delete(appName);
    }
    
    // 清理组件注册
    this.components.delete(appName);
    console.log('App unloaded:', appName);
  }
}
```

#### 3.3 使用方式

在子应用中，所有的全局变量访问都会被沙箱代理：

```javascript
// 子应用代码
window.myGlobalVar = 'test'; // 会被沙箱捕获
console.log(window.myGlobalVar); // 输出 'test'

// 其他子应用无法访问此变量
console.log(window.myGlobalVar); // undefined
```

沙箱特性：

1. 变量隔离
   - 子应用对全局变量的修改不会影响主应用
   - 不同子应用之间的全局变量互不影响
   - 支持快照和恢复机制

2. 运行时隔离
   - 支持 eval/new Function 等动态代码执行
   - 提供缓存机制优化性能
   - 保护主应用的关键全局变量

3. 生命周期管理
   - 应用加载时自动激活沙箱
   - 应用卸载时自动清理沙箱
   - 支持多个子应用同时运行

4. 性能优化
   - 使用 Proxy 实现最小化的性能开销
   - 缓存动态生成的函数
   - 支持快照复用

注意事项：

1. 沙箱限制
   - 某些原生 API 可能无法完全隔离
   - 需要注意内存泄漏问题
   - 某些第三方库可能需要特殊处理

2. 使用建议
   - 避免过度依赖全局变量
   - 优先使用模块化方案
   - 及时清理不需要的资源

### 4. 构建配置

#### 子应用构建配置（sub-app/vite.config.js）
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    cssNamespacePlugin()
  ],
  server: {
    port: 5174,
    cors: true
  },
  build: {
    outDir: '../main-app/public/sub-app',  // 输出到主应用的 public 目录
    // 同时支持独立运行和微应用模式
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        micro: resolve(__dirname, 'src/main.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'micro' ? 'sub-app.js' : '[name]-[hash].js'
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
```

## 使用方法

### 环境要求

- Node.js >= 14.0.0
- Vue 3.x
- Vite 4.x

### 开发模式

1. 安装依赖并启动主应用
```bash
# 安装主应用依赖
cd main-app
npm install

# 启动开发服务器
npm run dev
```

2. 安装依赖并启动子应用（可选，用于独立开发）
```bash
# 安装子应用依赖
cd sub-app
npm install

# 启动开发服务器
npm run dev
```

### 构建部署

1. 构建子应用
```bash
# 进入子应用目录
cd sub-app

# 构建子应用
npm run build
```

2. 构建主应用
```bash
# 进入主应用目录
cd main-app

# 构建主应用
npm run build
```

### 开发建议

1. 子应用开发
   - 保持子应用的独立性，避免与主应用产生强耦合
   - 使用相对路径引用资源文件
   - 确保样式选择器的合理嵌套，避免样式冲突
   - 在开发模式下同时启动主应用和子应用，方便调试

2. 主应用开发
   - 合理规划子应用的加载时机
   - 注意子应用资源的加载顺序
   - 实现必要的错误处理和降级方案

## 注意事项

1. 子应用开发注意点：
   - 需要同时支持独立运行和微应用模式
   - 避免使用全局样式污染
   - 注意资源路径的正确配置
   - 合理使用 CSS 命名空间

2. 样式管理：
   - 样式隔离通过命名空间实现
   - 使用 CSS 变量实现主题定制
   - 避免使用全局选择器
   - 注意样式权重的控制

3. 构建部署：
   - 子应用构建产物会自动输出到主应用的 public 目录
   - 确保资源路径的正确性
   - 注意版本控制和缓存策略

4. 性能优化：
   - 合理控制子应用的大小
   - 实现按需加载
   - 优化资源加载策略
   - 注意内存管理和资源释放

## 优势特点

1. 简单轻量
   - 无需复杂的框架依赖
   - 易于理解和维护
   - 学习成本低

2. 样式隔离
   - 完善的命名空间机制
   - 避免样式冲突
   - 支持主题定制

3. 灵活集成
   - 子应用支持独立运行
   - 便捷的集成方式
   - 良好的扩展性

4. 主题适配
   - 支持亮色/暗色主题
   - 响应系统主题切换
   - 可自定义主题变量

## 常见问题

1. 样式不生效问题
   - 检查命名空间是否正确应用
   - 确认样式选择器的优先级
   - 验证样式文件是否正确加载

2. 子应用加载失败
   - 检查资源路径是否正确
   - 确认构建配置是否正确
   - 查看网络请求是否正常

3. 主题切换异常
   - 检查 CSS 变量的定义
   - 确认媒体查询的正确性
   - 验证样式优先级

## 后续规划

1. 功能增强
   - 添加预加载机制
   - 实现沙箱隔离
   - 提供更多生命周期钩子

2. 性能优化
   - 实现资源预加载
   - 优化加载策略
   - 提供性能监控

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