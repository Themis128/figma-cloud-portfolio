import React from 'react'
import { jsxDEV } from 'react/jsx-dev-runtime'
import './global.css'
import { createRoot } from 'react-dom/client'
import App from './App'

// Make jsxDEV available globally for JSX transform
;(globalThis as any)._jsxDEV = jsxDEV

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(<App />)