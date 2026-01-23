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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/vitest',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'playwright-report/',
        'test-results/',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        'scripts/',
        '.codacy/',
        'amplify/',
        'public/',
        'docs/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  define: {
    global: 'globalThis',
    // Ensure React uses development build for testing
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    // Ensure React dev build is used
    include: ['react', 'react-dom'],
  },
})
