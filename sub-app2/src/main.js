import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 定义公共API，供主应用调用
window.microApp2 = {
  mount: () => {
    app.mount('#sub-app2')
  },
  unmount: () => {
    app.unmount()
  }
}

// 检查是否在微应用模式下运行
const isMicroApp = window.registerMicroComponent !== undefined;

console.log('Starting sub-app2 initialization');
console.log('isMicroApp mode:', isMicroApp);
console.log('Running in sandbox:', window.__MICRO_APP_PROXY__ !== undefined);

if (isMicroApp) {
  // 微应用模式：注册组件
  console.log('Registering sub-app2 component');
  window.registerMicroComponent('sub-app2', App);
  console.log('Sub-app2 component registered');
} else {
  // 独立运行模式：直接挂载
  console.log('Mounting sub-app2 in standalone mode');
  app.mount('#app');
  console.log('Sub-app2 mounted');
}

// 测试沙箱隔离
if (window.__MICRO_APP_PROXY__) {
  window.testVar2 = 'This is a test variable in sandbox for sub-app2';
  console.log('Test variable in sandbox:', window.testVar2);
}
