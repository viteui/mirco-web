<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

onMounted(() => {
  console.log(`AsyncComponent ${props.name} mounted`)
  // 确保容器存在
  const container = document.querySelector(`.${props.name}-container`)
  if (container && window[`micro-app-${props.name}`]) {
    window[`micro-app-${props.name}`].mount()
  }
})

onUnmounted(() => {
  console.log(`AsyncComponent ${props.name} unmounted`)
  if (window[`micro-app-${props.name}`]) {
    window[`micro-app-${props.name}`].unmount()
  }
})
</script>

<template>
  <div :class="`${name}-container`"></div>
</template> 