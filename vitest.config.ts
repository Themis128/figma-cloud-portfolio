import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/vitest-setup.ts'],
    include: ['./tests/**/*.{spec,test}.{ts,tsx}'],
    exclude: ['./tests/app.spec.ts', './tests/logo.spec.ts'], // Exclude Playwright tests
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
