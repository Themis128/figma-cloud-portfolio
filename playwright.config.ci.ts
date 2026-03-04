import { createPlaywrightConfig, devices } from "./playwright.config.shared";

// CI-optimized configuration
const config = createPlaywrightConfig("ci", {
  // Custom overrides for CI environment
  testMatch: [
    "**/*.spec.ts",
    "**/*.accessibility.spec.ts",
    "**/*.performance.spec.ts",
    "**/*.e2e.spec.ts",
  ],
  // Add custom projects for CI needs
  projects: [
    // Default browser projects from shared config
    ...createPlaywrightConfig("ci").projects,
    // Additional mobile device projects for CI
    {
      name: "mobile-ios",
      use: {
        ...devices["iPhone 14 Pro"],
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
    {
      name: "mobile-android",
      use: {
        ...devices["Pixel 7"],
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
  ],
  // Enhanced reporting for CI
  reporter: [
    ["html"],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["junit", { outputFile: "playwright-report/results.xml" }],
    ["list"],
    ["github"],
  ],
  // Use environment-aware base URL
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082", // Updated for current app architecture
  },
  // No webServer in CI - assumes application is already running
  webServer: undefined,
});

// Export the configuration
export default config;
