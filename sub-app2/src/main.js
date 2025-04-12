import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
let app = null

// 导出生命周期钩子供主应用调用
window.microApp2 = {
  bootstrap: async () => {
    console.log('sub-app2 bootstrapped')
    app = createApp(App)
  },
  mount: async (mountPoint) => {
    console.log('Mounting sub-app2 to:', mountPoint)
    if (app) {
      app.mount(mountPoint || '#sub-app2-mount')
    }
  },
  unmount: async () => {
    console.log('Unmounting sub-app2')
    if (app) {
      app.unmount()
      app = null
    }
  }
}

console.log('sub-app2 mounted', window.__MICRO_APP_ENVIRONMENT__)

// 如果不在微前端环境下，直接挂载应用
if (!window.__MICRO_APP_ENVIRONMENT__) {
  console.log('Mounting sub-app2 in standalone mode')
  app = createApp(App)
  app.mount('#app')
}
