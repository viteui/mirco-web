<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const count = ref(0)

const addCount = () => {
  count.value++
  console.log('Count changed Sub-app1:', count.value)
}

const isPopupOpen = ref(false)
const openPopup = () => {
  isPopupOpen.value = true
  window.microApp?.dispatch({ type: 'openPopup' })
  // 子应用打开Modal
  const modal = document.createElement('div')
  modal.style.position = 'fixed'
  modal.style.top = '50%'
  modal.style.left = '50%'
  modal.style.transform = 'translate(-50%, -50%)'
  modal.style.backgroundColor = 'white'
  modal.style.padding = '20px'
  modal.style.borderRadius = '8px'
  modal.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
  modal.style.zIndex = '1000'
  modal.innerHTML = `
    <h3>子应用弹窗 原生</h3>
    <p>这是子应用的弹窗内容</p>
  `
  document.body.appendChild(modal)
  // 添加关闭按钮
  const closeButton = document.createElement('button')
  closeButton.textContent = '关闭'
  closeButton.style.marginTop = '10px'
  closeButton.style.padding = '5px 10px'
  closeButton.style.borderRadius = '4px'
  closeButton.style.cursor = 'pointer'
  closeButton.style.backgroundColor = 'red'
  closeButton.style.color = 'white'
  closeButton.style.border = 'none'
  closeButton.style.transition = 'background-color 0.3s ease'
  closeButton.style.marginLeft = '10px'

  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal)
  })

  modal.appendChild(closeButton)
  // 添加点击事件监听
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })

}

const closePopup = () => {
  isPopupOpen.value = false
}
</script>

<template>
  <div class="sub-app" data-sub-app="true">
    <h2 style="color: red;">子应用1</h2>
    <div class="content">
      <p>这是子应用1的内容</p>
      <button class="action-btn" @click="addCount">点击我+</button>
      <p>当前计数: {{ count }}</p>

      <button class="action-btn" @click="openPopup">打开弹窗1</button>
      <button class="action-btn" @click="closePopup">关闭弹窗</button>
      <!-- 弹窗组件 -->
      <div v-if="isPopupOpen" class="popup-modal">
        <h3>子应用弹窗</h3>
        <p>这是子应用的弹窗内容</p>
        <button class="action-btn" @click="addCount">点击我+</button>
        <p>当前计数: {{ count }}</p>
        <button class="action-btn" @click="closePopup">关闭弹窗</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-app {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content {
  margin-top: 20px;
}

.action-btn {
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-btn:hover {
  background: #40a9ff;
}

.popup-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
</style>
