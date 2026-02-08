import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './',
  timeout: 60000,
  workers: 1,
  retries: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:8082',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: [
    {
      command: 'npx tsx server/dev-server.ts',
      url: 'http://localhost:3000/api/ping',
      reuseExistingServer: true,
      timeout: 60000,
      cwd: '../',
    },
    {
      command: 'npx vite --host localhost --port 8082',
      url: 'http://localhost:8082',
      reuseExistingServer: true,
      timeout: 60000,
      cwd: '../',
    },
  ],
})
