import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/vitest-setup.ts'],
    include: ['./tests/**/*.{spec,test}.{ts,tsx}'],
    exclude: ['./isolated-tests/app.spec.ts', './isolated-tests/logo.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'json-summary', 'html', 'lcov', 'cobertura'],
      reportsDirectory: './coverage',
      // CRITICAL: Must include source files for coverage
      include: ['client/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}'],
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
          branches: 60,
          functions: 40,
          lines: 80,
          statements: 80,
        },
      },
      clean: true,
    },
    testTimeout: 10000,
    reporters: ['verbose'],
    // React 19 specific configuration
    // - Optimized dependency pre-bundling for React 19
    // - Proper handling of React's new concurrent features
    deps: {
      optimizer: {
        web: {
          include: ['react', 'react-dom', 'react-router-dom'],
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
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // React 19 compatibility configuration
  // Ensures proper transpilation for React 19's new features
  esbuild: {
    target: 'es2020',
  },
})
