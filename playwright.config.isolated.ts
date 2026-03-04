import { createPlaywrightConfig } from "./playwright.config.shared";

// Isolated configuration for debugging and single-worker testing
const config = createPlaywrightConfig("isolated", {
  // Custom overrides for isolated testing
  testMatch: [
    "**/*.spec.ts",
    "**/*.accessibility.spec.ts",
    "**/*.performance.spec.ts",
    "**/*.e2e.spec.ts",
  ],
  // Single browser for focused debugging
  projects: [
    {
      name: "chromium",
      use: {
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
        // Add environment-specific viewport if needed
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
  ],
  // Comprehensive reporting for debugging
  reporter: [
    ["html"],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["junit", { outputFile: "playwright-report/results.xml" }],
    ["list"],
    ["line"],
  ],
  // Enhanced tracing for debugging
  use: {
    trace: "on",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082", // Updated for current app architecture
  },
});

// Export the configuration
export default config;