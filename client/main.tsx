import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'

import App from './App'

// Suppress React DevTools development message in console
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  const originalWarn = console.warn
  console.warn = (...args: unknown[]) => {
    if (!args[0]?.toString().includes('Download the React DevTools')) {
      originalWarn.apply(console, args)
    }
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
