import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="sub-app" data-sub-app="true">
        <h2>React 子应用</h2>
        <div className="content">
        <p>这是 React 子应用的内容</p>
        <button onClick={() => setCount((count) => count + 1)}>
          点击我+
        </button>
        <p style={{ color: 'rgb(35, 33, 33)' }}>当前计数: {count}</p>
      </div>
    </div>
  )
}

export default App 