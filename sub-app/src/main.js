import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用实例
let app = null

// 定义应用的生命周期
const microApp = {
  bootstrap: async () => {
    console.log('sub-app1 bootstrapped')
    app = createApp(App)
  },
  mount: async (mountPoint) => {
    console.log('Mounting sub-app1 to:', mountPoint)
    if (app) {
      const mountElement = document.querySelector(mountPoint || '#sub-app1-mount')
      if (mountElement) {
        app.mount(mountElement)
        console.log('Sub-app1 mounted successfully')
      } else {
        console.error('Mount point not found:', mountPoint || '#sub-app1-mount')
      }
    }
  },
  unmount: async () => {
    console.log('Unmounting sub-app1')
    if (app) {
      app.unmount()
      app = null
    }
  }
}

// 注册子应用
if (window.__MICRO_APP_ENVIRONMENT__) {
  console.log('Registering sub-app1 in micro app environment')
  window.registerMicroApp('sub-app1', microApp)
} else {
  // 如果不在微前端环境下，直接挂载应用
  console.log('Mounting sub-app1 in standalone mode')
  app = createApp(App)
  app.mount('#app')
}
