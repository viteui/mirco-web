// 加载远程组件的核心逻辑
export class MicroLoader {
  constructor() {
    this.components = new Map();
    this.styles = new Map();
    console.log('MicroLoader initialized');
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
      // 为每个应用的样式添加特定的属性，用于后续的样式隔离
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

  // 注册远程组件
  registerComponent(name, component) {
    console.log('Registering component:', name);
    this.components.set(name, component);
  }

  // 获取已注册的组件
  getComponent(name) {
    console.log('Getting component:', name);
    const component = this.components.get(name);
    console.log('Component found:', !!component);
    return component;
  }

  // 加载远程应用
  async loadApp(appConfig) {
    const { name, js, css } = appConfig;
    console.log('Loading app:', name, { js, css });
    
    try {
      // 加载 CSS
      if (css) {
        await this.loadStyle(css, name);
      }
      
      // 加载 JS
      if (js) {
        await this.loadScript(js);
      }

      console.log('App loaded successfully:', name);
    } catch (error) {
      console.error('Failed to load app:', name, error);
      throw error;
    }
  }

  // 卸载应用
  unloadApp(appName) {
    console.log('Unloading app:', appName);
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

// 创建单例实例
export const microLoader = new MicroLoader();

// 提供注册组件的全局方法
window.registerMicroComponent = (name, component) => {
  console.log('Global registration called for:', name);
  microLoader.registerComponent(name, component);
}; 