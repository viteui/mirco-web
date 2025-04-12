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
    // 将加载器实例挂载到全局
    window.microLoader = this;
    // 提供注册应用的全局方法
    window.registerMicroApp = (name, appInstance) => {
      this.registerMicroApp(name, appInstance);
    };
  }

  // 创建沙箱实例
  createSandbox(appName) {
    const sandbox = new EnhancedJsSandbox(appName);
    this.sandboxes.set(appName, sandbox);
    return sandbox;
  }

  // 注册子应用
  registerMicroApp(name, appInstance) {
    console.log('Registering micro app:', name);
    this.apps.set(name, {
      instance: appInstance,
      mountPoint: `#${name}-mount`
    });
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
    const { name, js, css } = config;
    console.log('Loading app config:', config);
    
    // 如果应用已经加载，直接返回
    if (this.apps.has(name)) {
      console.log('App already loaded:', name);
      return;
    }
    
    try {
      // 加载 JS
      await this.loadScript(js);
      console.log('Script loaded:', js);
      
      // 加载 CSS
      if (css) {
        await this.loadStyle(css, name);
        console.log('Style loaded:', css);
      }
      
      // 创建沙箱
      const sandbox = this.createSandbox(name);
      
      console.log('App loaded successfully:', name);
    } catch (error) {
      console.error('Failed to load app:', name, error);
      throw error;
    }
  }

  // 挂载应用
  async mountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) {
      console.error('App not found:', appName);
      return;
    }
    
    console.log('Mounting app:', appName);
    try {
      await app.instance.bootstrap();
      await app.instance.mount(app.mountPoint);
      console.log('App mounted successfully:', appName);
    } catch (error) {
      console.error('Failed to mount app:', appName, error);
      throw error;
    }
  }

  // 卸载应用
  async unmountApp(appName) {
    const app = this.apps.get(appName);
    if (!app) {
      console.error('App not found:', appName);
      return;
    }
    
    console.log('Unmounting app:', appName);
    try {
      await app.instance.unmount();
      console.log('App unmounted successfully:', appName);
    } catch (error) {
      console.error('Failed to unmount app:', appName, error);
      throw error;
    }
  }
}

// 导出加载器实例
export const microLoader = new MicroLoader(); 