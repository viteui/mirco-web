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

export { JsSandbox, EnhancedJsSandbox }; 