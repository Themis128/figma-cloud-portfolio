import { createPlaywrightConfig, devices } from "./playwright.config.shared";

// Fast configuration for quick testing
const config = createPlaywrightConfig("fast", {
  // Custom overrides for fast testing
  testMatch: ["**/*.spec.ts", "**/*.unit.spec.ts", "**/*.integration.spec.ts"],
  // Only use Chromium for speed
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
  ],
  // Minimal reporting for speed
  reporter: [["list"]],
  // Reuse running dev server with correct URL
  webServer: {
    command: "pnpm dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082",
    reuseExistingServer: true,
    timeout: 30000,
  },
  // Use environment-aware base URL
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082", // Updated for current app architecture
  },
});

// Export the configuration
export default config;
