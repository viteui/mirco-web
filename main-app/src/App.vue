<script setup>
import { ref, onMounted } from 'vue'
import { AsyncComponent } from './components/AsyncComponent'
import { microLoader } from './loader'

const isSubApp1Loaded = ref(false)
const isSubApp2Loaded = ref(false)

onMounted(async () => {
  // 加载子应用1
  await microLoader.loadApp({
    name: 'sub-app',
    js: '/sub-app/sub-app.js',
    css: '/sub-app/style.css'
  })
  isSubApp1Loaded.value = true

  // 加载子应用2
  await microLoader.loadApp({
    name: 'sub-app2',
    js: '/sub-app2/sub-app2.js',
    css: '/sub-app2/style.css'
  })
  isSubApp2Loaded.value = true
})
</script>

<template>
  <div class="main-app">
    <h1>主应用</h1>
    <div class="main-content">
      <p>这是主应用的内容</p>
    </div>
    
   <div style="display: flex; flex-direction: row;">
    <!-- 子应用1 -->
    <div v-if="isSubApp1Loaded" class="sub-app-container">
      <h2>子应用1区域</h2>
      <div id="sub-app-container">
        <AsyncComponent name="sub-app" />
      </div>
    </div>

    <!-- 子应用2 -->
    <div v-if="isSubApp2Loaded" class="sub-app-container">
      <h2>子应用2区域</h2>
      <div id="sub-app2-container">
        <AsyncComponent name="sub-app2" />
      </div>
    </div>
   </div>
  </div>
</template>

<style scoped>
.main-app {
  padding: 20px;
}

.main-content {
  margin: 20px 0;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.sub-app-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
}

.sub-app-container + .sub-app-container {
  margin-top: 20px;
}
</style>
