import { createPlaywrightConfig, devices } from "./playwright.config.shared";

/**
 * CI-only Playwright configuration.
 *
 * Runs a curated subset of crucial spec files that cover:
 *  - Core page rendering (home, about, contact, agents, performance, projects)
 *  - Navigation & routing
 *  - API health & endpoints
 *  - Chatbot widget
 *  - SEO fundamentals
 *  - Accessibility baseline
 *  - Admin login gate
 *  - Footer & components
 *  - Production smoke tests
 *
 * Full suite (92 specs) runs locally or via the playwright-test-runner workflow.
 */

const CI_SPEC_FILES = [
  // Core pages render
  "home-page.spec.ts",
  "about-page.spec.ts",
  "contact-page.spec.ts",
  "agents.spec.ts",
  "performance-page.spec.ts",
  "projects-page.spec.ts",
  // Navigation & routing
  "navigation.spec.ts",
  // API health
  "api-endpoints.spec.ts",
  // Chatbot
  "chatbot.spec.ts",
  // SEO
  "seo.spec.ts",
  // Accessibility baseline
  "accessibility.spec.ts",
  // Admin login gate
  "admin.spec.ts",
  // Production smoke
  "production-smoke.spec.ts",
  // Footer
  "footer.spec.ts",
];

const config = createPlaywrightConfig("ci", {
  testMatch: CI_SPEC_FILES.map((f) => `**/${f}`),
  // Single browser in CI for speed
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
  reporter: [["list"]],
  retries: 1,
  webServer: {
    command: "pnpm dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60000,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  },
});

export default config;
