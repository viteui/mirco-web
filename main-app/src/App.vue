<script setup>
import { ref, onMounted } from 'vue'
import { AsyncComponent } from './components/AsyncComponent'
import { microLoader } from './loader'

const isSubAppLoaded = ref(false)

onMounted(async () => {
  // 加载子应用
  await microLoader.loadApp({
    name: 'sub-app',
    js: '/sub-app/sub-app.js',
    css: '/sub-app/assets/style.css'
  })
  isSubAppLoaded.value = true
})
</script>

<template>
  <div class="main-app">
    <h1>主应用</h1>
    <div class="main-content">
      <p>这是主应用的内容</p>
    </div>
    <div v-if="isSubAppLoaded" class="sub-app-container">
      <h2>子应用区域</h2>
      <div id="sub-app-container">
        <AsyncComponent name="sub-app" />
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
}
</style>
