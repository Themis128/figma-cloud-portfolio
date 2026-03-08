import { createPlaywrightConfig } from "./playwright.config.shared";
import { 
  createViewportConfig, 
  VIEWPORTS, 
  DEVICE_PRESETS 
} from "./playwright.config.viewport";

// Main development configuration with viewport support
const config = createViewportConfig("development", {
  // Custom overrides for development environment
  testMatch: [
    "**/*.spec.ts",
    "**/*.accessibility.spec.ts",
    "**/*.performance.spec.ts",
    "**/*.e2e.spec.ts",
    "**/*.viewport.spec.ts",
    "**/*.responsive.spec.ts",
  ],
  // Add custom projects for specific testing needs
  projects: [
    // Default browser projects from shared config
    ...createPlaywrightConfig("development").projects,
    
    // Viewport-specific projects for the requested sizes
    {
      name: "large-desktop-1280x800",
      use: {
        viewport: VIEWPORTS.LARGE_DESKTOP,
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
    {
      name: "small-desktop-900x600",
      use: {
        viewport: VIEWPORTS.SMALL_DESKTOP,
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
    {
      name: "tablet-768x1024",
      use: {
        viewport: VIEWPORTS.TABLET_PORTRAIT,
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
    {
      name: "mobile-360x640",
      use: {
        viewport: VIEWPORTS.MOBILE_SMALL,
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
    
    // Additional common device presets
    {
      name: "iphone-se",
      use: {
        viewport: VIEWPORTS.IPHONE_SE,
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
    {
      name: "ipad-pro",
      use: {
        viewport: VIEWPORTS.IPAD_PRO,
        launchOptions: {
          args: ["--disable-web-security", "--allow-running-insecure-content"],
        },
      },
    },
  ],
  // Use environment-aware base URL
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  },
});

// Export the configuration
export default config;
