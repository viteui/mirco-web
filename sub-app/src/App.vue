<script setup>
</script>

<template>
  <div class="sub-app" data-sub-app="true">
    <h2 style="color: red;">子应用</h2>
    <div class="content">
      <p>这是子应用的内容</p>
      <button class="action-btn">点击我</button>
    </div>
  </div>
</template>

<style>
/* 基础样式 */
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
}

/* 子应用容器样式 */
.sub-app {
  padding: 20px;
  background-color: var(--bg-color, #f0f0f0);
  border-radius: 4px;
  margin: 20px 0;
  color: var(--text-color, #213547);
}

.content {
  margin-top: 20px;
  padding: 20px;
  background-color: var(--content-bg, #fff);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.action-btn {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: var(--button-bg, #1a1a1a);
  color: var(--button-text, #fff);
  cursor: pointer;
  transition: all 0.25s;
}

.action-btn:hover {
  border-color: var(--hover-color, #646cff);
  opacity: 0.9;
}

.action-btn:focus,
.action-btn:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

/* 标题样式 */
.sub-app h2 {
  font-size: 2em;
  line-height: 1.1;
  color: inherit;
  margin-bottom: 20px;
}

.sub-app p {
  color: inherit;
  font-size: 1em;
  line-height: 1.5;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .sub-app {
    --bg-color: #242424;
    --text-color: rgba(255, 255, 255, 0.87);
    --content-bg: #1a1a1a;
    --button-bg: #f9f9f9;
    --button-text: #213547;
    --hover-color: #747bff;
  }
}

/* 亮色模式适配 */
@media (prefers-color-scheme: light) {
  .sub-app {
    --bg-color: #f0f0f0;
    --text-color: #213547;
    --content-bg: #ffffff;
    --button-bg: #1a1a1a;
    --button-text: #ffffff;
    --hover-color: #646cff;
  }
}
</style>
