import { createPlaywrightConfig } from "./playwright.config.shared";

// Isolated configuration for debugging and single-worker testing
const baseConfig = createPlaywrightConfig("isolated", {
  trace: "on",
  video: "retain-on-failure",
  screenshot: "only-on-failure",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  },
});

const config = {
  ...baseConfig,
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
};

// Export the configuration
export default config;