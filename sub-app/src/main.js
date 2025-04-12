import { createApp, defineComponent, h } from 'vue'
import App from './App.vue'

// 创建子应用实例
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
  console.log('Registering sub-app component');
  // 微应用模式：注册组件
  window.registerMicroComponent('sub-app', SubApp);
  console.log('Sub-app component registered');
} else {
  console.log('Mounting sub-app in standalone mode');
  // 独立运行模式：直接挂载
  app.mount('#app');
  console.log('Sub-app mounted');
}
