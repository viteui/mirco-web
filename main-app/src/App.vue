<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { microLoader } from './loader'

const currentApp = ref('sub-app1')

const apps = [
  {
    name: 'sub-app1',
    js: '/sub-app/sub-app.js',
    css: '/sub-app/style.css'
  },
  {
    name: 'sub-app2',
    js: '/sub-app2/sub-app2.js',
    css: '/sub-app2/style.css'
  }
]

// 加载并挂载子应用
const loadAndMountApp = async (appName) => {
  try {
    console.log('Switching to app:', appName)
    
    // 如果有当前应用，先卸载
    if (currentApp.value && currentApp.value !== appName) {
      console.log('Unmounting current app:', currentApp.value)
      await microLoader.unmountApp(currentApp.value)
    }

    // 查找应用配置
    const appConfig = apps.find(app => app.name === appName)
    if (!appConfig) {
      console.error('App config not found:', appName)
      return
    }

    // 加载新应用
    console.log('Loading new app:', appName)
    await microLoader.loadApp(appConfig)
    
    // 等待 DOM 更新
    await nextTick()
    
    // 挂载新应用
    console.log('Mounting new app:', appName)
    await microLoader.mountApp(appName)
    
    // 更新当前应用
    currentApp.value = appName
    console.log('App switched successfully:', appName)
  } catch (error) {
    console.error('Failed to load and mount app:', error)
  }
}

// 初始化加载默认应用
onMounted(async () => {
  await loadAndMountApp(currentApp.value)
})

// 清理资源
onUnmounted(async () => {
  if (currentApp.value) {
    await microLoader.unmountApp(currentApp.value)
  }
})
</script>

<template>
  <div class="main-app">
    <header>
      <h1>主应用</h1>
      <nav>
        <button 
          v-for="app in apps" 
          :key="app.name"
          :class="{ active: currentApp === app.name }"
          @click="loadAndMountApp(app.name)"
        >
          {{ app.name }}
        </button>
      </nav>
    </header>

    <main>
      <div class="main-content">
        <p>这是主应用的内容</p>
      </div>

      <div class="sub-apps-container">
        <div v-show="currentApp === 'sub-app1'" class="sub-app-wrapper" data-sub-app="true">
          <h2>子应用1区域</h2>
          <div class="sub-app-mount-point">
            <div id="sub-app1-mount"></div>
          </div>
        </div>

        <div v-show="currentApp === 'sub-app2'" class="sub-app-wrapper" data-sub-app="true">
          <h2>子应用2区域</h2>
          <div class="sub-app-mount-point">
            <div id="sub-app2-mount"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.main-app {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

header {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

h1 {
  margin: 0 0 20px 0;
  color: #333;
}

nav {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #f0f0f0;
}

button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

main {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-content {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.sub-apps-container {
  margin-top: 20px;
}

.sub-app-wrapper {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.sub-app-wrapper h2 {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  margin: 0;
  font-size: 16px;
}

.sub-app-mount-point {
  padding: 20px;
  min-height: 200px;
}

#sub-app1-mount,
#sub-app2-mount {
  width: 100%;
  height: 100%;
}
</style>
