import { defineConfig, devices } from "@playwright/test";

/**
 * Isolated Playwright config to avoid Vitest conflicts
 */
export default defineConfig({
  testDir: "./isolated-tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "line",

  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    actionTimeout: 10000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
        actionTimeout: 5000,
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
