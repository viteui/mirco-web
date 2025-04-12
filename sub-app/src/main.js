import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
let app = null

// 导出生命周期钩子供主应用调用
window.microApp1 = {
  bootstrap: async () => {
    console.log('sub-app bootstrapped')
    app = createApp(App)
  },
  mount: async (mountPoint) => {
    console.log('Mounting sub-app to:', mountPoint)
    if (app) {
      app.mount(mountPoint || '#sub-app-mount')
    }
  },
  unmount: async () => {
    console.log('Unmounting sub-app')
    if (app) {
      app.unmount()
      app = null
    }
  }
}

// 如果不在微前端环境下，直接挂载应用
if (!window.__MICRO_APP_ENVIRONMENT__) {
  console.log('Mounting sub-app in standalone mode')
  app = createApp(App)
  app.mount('#app')
}
