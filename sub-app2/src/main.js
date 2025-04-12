import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
let app = null

// 定义应用的生命周期
const microApp = {
  bootstrap: async () => {
    console.log('sub-app2 bootstrapped')
    app = createApp(App)
  },
  mount: async (mountPoint) => {
    console.log('Mounting sub-app2 to:', mountPoint)
    if (app) {
      app.mount(mountPoint || '#sub-app2-mount')
      console.error('Mounting sub-app2 to:', mountPoint)
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

// 注册子应用
if (window.__MICRO_APP_ENVIRONMENT__) {
  window.registerMicroApp('sub-app2', microApp)
} else {
  // 如果不在微前端环境下，直接挂载应用
  console.log('Mounting sub-app2 in standalone mode')
  app = createApp(App)
  app.mount('#app')
}