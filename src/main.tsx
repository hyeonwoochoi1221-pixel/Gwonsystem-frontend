import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// @ts-ignore
import App from './App.tsx'

// @ts-ignore
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
