import { EnhancedJsSandbox } from './sandbox';

// 加载远程应用的核心逻辑
export class MicroLoader {
  constructor() {
    this.apps = new Map();
    this.styles = new Map();
    this.sandboxes = new Map();
    console.log('MicroLoader initialized');
    // 在构造函数中设置环境变量
    window.__MICRO_APP_ENVIRONMENT__ = true;
  }

  // 创建沙箱实例
  createSandbox(appName) {
    const sandbox = new EnhancedJsSandbox(appName);
    this.sandboxes.set(appName, sandbox);
    return sandbox;
  }

  // 加载远程脚本
  async loadScript(url) {
    console.log('Loading script:', url);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'module';
      script.onload = () => {
        console.log('Script loaded successfully:', url);
        resolve();
      };
      script.onerror = (error) => {
        console.error('Script loading failed:', url, error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  // 加载远程样式
  async loadStyle(url, appName) {
    console.log('Loading style:', url, 'for app:', appName);
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-micro-app', appName);
      link.onload = () => {
        console.log('Style loaded successfully:', url);
        resolve();
      };
      link.onerror = (error) => {
        console.error('Style loading failed:', url, error);
        reject(error);
      };
      document.head.appendChild(link);
      this.styles.set(appName, link);
    });
  }

  // 加载远程应用
  async loadApp(config) {
    const { name, js, css, mountPoint } = config;
    console.log('Loading app config:', config);
    
    // 如果应用已经加载，直接返回
    if (this.apps.has(name)) {
      console.log('App already loaded:', name);
      return;
    }
    
    // 加载 JS
    const script = await this.loadScript(js);
    console.log('Script loaded:', js);
    
    // 加载 CSS
    if (css) {
      await this.loadStyle(css, name);
      console.log('Style loaded:', css);
    }
    
    // 创建沙箱
    const sandbox = this.createSandbox(name);
    
    // 存储应用实例和配置
    const appInstance = window[`microApp${name.replace('sub-app', '')}`];
    console.log('Looking for app instance:', `microApp${name.replace('sub-app', '')}`, window[`microApp${name.replace('sub-app', '')}`]);
    
    if (appInstance) {
      this.apps.set(name, {
        instance: appInstance,
        mountPoint
      });
      // 初始化应用
      await appInstance.bootstrap?.();
      console.log('App bootstrapped:', name);
    } else {
      console.error(`App instance not found for ${name}`);
    }

    // 设置微应用环境标识
    window.__MICRO_APP_ENVIRONMENT__ = true;

    console.log('App loaded successfully:', name);
  }

  // 挂载应用
  async mountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) {
      console.error(`App ${appName} not found`);
      return;
    }

    console.log('Mounting app:', appName, 'to mount point:', app.mountPoint);
    if (app.instance && typeof app.instance.mount === 'function') {
      // 将挂载点信息传递给子应用
      await app.instance.mount(app.mountPoint);
      console.log('App mounted:', appName);
    }
  }

  // 卸载应用
  async unmountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) {
      console.error(`App ${appName} not found`);
      return;
    }

    if (app.instance && typeof app.instance.unmount === 'function') {
      await app.instance.unmount();
      console.log('App unmounted:', appName);
    }

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
    
    // 清理应用实例
    this.apps.delete(appName);
    console.log('App unloaded:', appName);
  }
}

// 创建单例实例
export const microLoader = new MicroLoader();

// 提供注册组件的全局方法
window.registerMicroComponent = (name, component) => {
  console.log('Global registration called for:', name);
  microLoader.registerComponent(name, component);
}; 