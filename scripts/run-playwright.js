#!/usr/bin/env node

// Isolated Playwright test runner to avoid Vitest conflicts
import { execSync } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  // Run playwright tests with isolated environment
  const result = execSync('npx playwright test --config playwright.config.ts', {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      // Isolate from Vitest
      NODE_PATH: '',
      VITEST: 'false',
    },
  })
  console.log('Playwright tests completed successfully!')
} catch (error) {
  console.error('Playwright tests failed:', error.message)
  process.exit(1)
}
