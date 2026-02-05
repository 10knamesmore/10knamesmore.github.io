/**
 * 应用入口文件
 * 
 * @remarks
 * React 应用的启动点，将根组件挂载到 DOM
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
