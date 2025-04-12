import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

let root = null;

const microApp = {
  bootstrap: async () => {
    console.log('sub-app3 bootstrapped');
    return Promise.resolve();
  },
  mount: async (mountPoint) => {
    console.log('Mounting sub-app3 to:', mountPoint);
    const mountElement = document.querySelector(mountPoint || '#react-app');
    if (mountElement) {
      root = ReactDOM.createRoot(mountElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  },
  unmount: async () => {
    if (root) {
      root.unmount();
      root = null;
    }
  }
};

// 检查是否在微应用环境中
const isMicroApp = window.__MICRO_APP_ENVIRONMENT__;

if (isMicroApp) {
  // 微应用模式
  window.registerMicroApp('react-app', microApp);
} else {
  // 独立运行模式
  const rootElement = document.getElementById('root');
  if (rootElement) {
    root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found!');
  }
} 