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
    baseURL: "http://localhost:9091",
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

  // webServer: [
  //   {
  //     command: "npx tsx server/dev-server.ts",
  //     url: "http://localhost:3001/api/ping",
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //   },
  //   // {
  //   //   command: "npx vite --host localhost --port 8082",
  //   //   url: "http://localhost:8082",
  //   //   reuseExistingServer: !process.env.CI,
  //   //   timeout: WEBSERVER_TIMEOUT,
  //   // },
  // ],
});
