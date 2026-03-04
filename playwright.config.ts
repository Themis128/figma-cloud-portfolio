import { createPlaywrightConfig } from "./playwright.config.shared";

// Main development configuration
const config = createPlaywrightConfig("development", {
  // Custom overrides for development environment
  testMatch: [
    "**/*.spec.ts",
    "**/*.accessibility.spec.ts",
    "**/*.performance.spec.ts",
    "**/*.e2e.spec.ts",
  ],
  // Add custom projects for specific testing needs
  projects: [
    // Default browser projects from shared config
    ...createPlaywrightConfig("development").projects,
    // Additional mobile device projects
    {
      name: "mobile-ios",
      use: {
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
        // Add environment-specific viewport if needed
        viewport: {
          width: 375,
          height: 667,
        },
      },
    },
    {
      name: "mobile-android",
      use: {
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
        // Add environment-specific viewport if needed
        viewport: {
          width: 360,
          height: 640,
        },
      },
    },
  ],
  // Use environment-aware base URL
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8082", // Updated for current app architecture
  },
});

// Export the configuration
export default config;
