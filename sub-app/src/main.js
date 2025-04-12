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
console.log('Running in sandbox:', window.__MICRO_APP_PROXY__ !== undefined);

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

// 测试沙箱隔离
if (window.__MICRO_APP_PROXY__) {
  window.testVar = 'This is a test variable in sandbox';
  console.log('Test variable in sandbox:', window.testVar);
}
