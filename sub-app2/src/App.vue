<script setup>
import { ref } from 'vue'

const count = ref(0)
const theme = ref('light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <div class="sub-app2-container" :class="theme">
    <div class="theme-toggle">
      <button class="theme-btn" @click="toggleTheme">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>
    </div>
    <h2>子应用2</h2>
    <div class="content">
      <p>这是子应用2的内容</p>
      <div class="counter-section">
        <button class="counter-btn" @click="count++">
          点击计数: {{ count }}
        </button>
        <div class="count-display">
          当前计数: <span class="count-number">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --primary-color: #4CAF50;
  --primary-hover: #45a049;
  --text-color: #213547;
  --bg-color: #f8f9fa;
  --content-bg: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

.sub-app2-container {
  padding: 2rem;
  border-radius: 12px;
  background-color: var(--bg-color);
  margin: 20px;
  transition: all var(--transition-speed) ease;
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.theme-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: transform var(--transition-speed);
}

.theme-btn:hover {
  transform: scale(1.1);
}

h2 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.content {
  background-color: var(--content-bg);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--shadow-color);
  transition: all var(--transition-speed);
}

.counter-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.counter-btn {
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-speed);
  font-size: 1.1rem;
  font-weight: 500;
}

.counter-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.count-display {
  font-size: 1.2rem;
  color: var(--text-color);
}

.count-number {
  font-weight: 600;
  color: var(--primary-color);
}

/* Dark theme */
.dark {
  --primary-color: #6ECF73;
  --primary-hover: #5BB75E;
  --text-color: #E1E1E1;
  --bg-color: #1A1A1A;
  --content-bg: #2A2A2A;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

.dark .content {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .sub-app2-container {
    padding: 1rem;
    margin: 10px;
  }

  h2 {
    font-size: 2rem;
  }

  .content {
    padding: 1.5rem;
  }
}
</style>
