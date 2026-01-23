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
    exclude: ['./tests/app.spec.ts', './tests/logo.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov', 'cobertura'],
      reportsDirectory: './coverage',
      // CRITICAL: Must include source files for coverage
      include: [
        'client/**/*.{ts,tsx}',
        'shared/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'playwright-report/**',
        'test-results/**',
        '**/*.d.ts',
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js,mjs,cjs}',
        'scripts/**',
        '.codacy/**',
        'amplify/**',
        'public/**',
        'docs/**',
        'server/**',
        'client/main.tsx',
        'client/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 20,
          functions: 20,
          lines: 20,
          statements: 20,
        },
      },
      clean: true,
    },
    testTimeout: 10000,
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
