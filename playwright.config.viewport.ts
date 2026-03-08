import { type Config, type Project } from "@playwright/test";
import { createPlaywrightConfig } from "./playwright.config.shared";

/**
 * Viewport Configuration for Playwright Tests
 * 
 * This configuration provides predefined viewport sizes for different device categories:
 * - Large Desktop (1280x800)
 * - Small Desktop (900x600) 
 * - Tablet (768x1024)
 * - Mobile (360x640)
 * 
 * Usage:
 * - Use this config for viewport-specific testing
 * - Can be combined with other configurations using environment variables
 */

// Predefined viewport configurations
export const VIEWPORTS = {
  // Desktop configurations
  LARGE_DESKTOP: { width: 1280, height: 800 },
  SMALL_DESKTOP: { width: 900, height: 600 },
  FULL_HD: { width: 1920, height: 1080 },
  ULTRA_WIDE: { width: 2560, height: 1440 },
  
  // Tablet configurations
  TABLET_PORTRAIT: { width: 768, height: 1024 },
  TABLET_LANDSCAPE: { width: 1024, height: 768 },
  IPAD_PRO: { width: 1024, height: 1366 },
  
  // Mobile configurations
  MOBILE_SMALL: { width: 360, height: 640 },
  MOBILE_MEDIUM: { width: 375, height: 667 },
  MOBILE_LARGE: { width: 414, height: 896 },
  IPHONE_SE: { width: 375, height: 667 },
  IPHONE_12: { width: 390, height: 844 },
  IPHONE_14_PRO_MAX: { width: 430, height: 932 },
  
  // Additional common viewports
  MACBOOK_13: { width: 1280, height: 800 },
  MACBOOK_15: { width: 1440, height: 900 },
  GOOGLE_PIXEL: { width: 411, height: 731 },
  SAMSUNG_GALAXY: { width: 360, height: 640 },
} as const;

// Device presets for quick access
export const DEVICE_PRESETS = {
  "Large Desktop": VIEWPORTS.LARGE_DESKTOP,
  "Small Desktop": VIEWPORTS.SMALL_DESKTOP,
  "Tablet": VIEWPORTS.TABLET_PORTRAIT,
  "Mobile": VIEWPORTS.MOBILE_SMALL,
} as const;

// Environment-specific viewport configurations
interface ViewportEnvironmentConfig {
  defaultViewport: { width: number; height: number };
  additionalViewports?: Array<{ width: number; height: number }>;
  includeMobileFirst?: boolean;
  includeTabletFirst?: boolean;
}

const viewportEnvironmentSettings: Record<string, ViewportEnvironmentConfig> = {
  development: {
    defaultViewport: VIEWPORTS.LARGE_DESKTOP,
    additionalViewports: [
      VIEWPORTS.SMALL_DESKTOP,
      VIEWPORTS.TABLET_PORTRAIT,
      VIEWPORTS.MOBILE_SMALL,
    ],
    includeMobileFirst: true,
    includeTabletFirst: true,
  },
  ci: {
    defaultViewport: VIEWPORTS.LARGE_DESKTOP,
    additionalViewports: [
      VIEWPORTS.TABLET_PORTRAIT,
      VIEWPORTS.MOBILE_MEDIUM,
    ],
  },
  fast: {
    defaultViewport: VIEWPORTS.LARGE_DESKTOP,
    additionalViewports: [VIEWPORTS.MOBILE_SMALL],
  },
  isolated: {
    defaultViewport: VIEWPORTS.LARGE_DESKTOP,
    additionalViewports: [
      VIEWPORTS.SMALL_DESKTOP,
      VIEWPORTS.TABLET_PORTRAIT,
      VIEWPORTS.TABLET_LANDSCAPE,
      VIEWPORTS.MOBILE_SMALL,
      VIEWPORTS.MOBILE_MEDIUM,
      VIEWPORTS.MOBILE_LARGE,
    ],
    includeMobileFirst: true,
    includeTabletFirst: true,
  },
};

// Create viewport-specific projects
function createViewportProjects(
  environment: string,
  baseProjects: Project[],
): Project[] {
  const settings = viewportEnvironmentSettings[environment];
  if (!settings) {
    throw new Error(`Unknown viewport environment: ${environment}`);
  }

  const projects: Project[] = [];

  // Add default viewport project
  projects.push({
    name: "default-viewport",
    use: {
      viewport: settings.defaultViewport,
    },
  });

  // Add additional viewport projects if specified
  if (settings.additionalViewports) {
    for (const viewport of settings.additionalViewports) {
      const viewportName = `${viewport.width}x${viewport.height}`;
      projects.push({
        name: viewportName,
        use: {
          viewport,
        },
      });
    }
  }

  // Add mobile-first project if requested
  if (settings.includeMobileFirst) {
    projects.push({
      name: "mobile-first",
      use: {
        viewport: VIEWPORTS.MOBILE_SMALL,
        // Add mobile-specific settings
        launchOptions: {
          args: [
            "--disable-web-security",
            "--allow-running-insecure-content",
            "--ignore-certificate-errors",
          ],
        },
      },
    });
  }

  // Add tablet-first project if requested
  if (settings.includeTabletFirst) {
    projects.push({
      name: "tablet-first",
      use: {
        viewport: VIEWPORTS.TABLET_PORTRAIT,
        // Add tablet-specific settings
        launchOptions: {
          args: [
            "--disable-web-security",
            "--allow-running-insecure-content",
            "--ignore-certificate-errors",
          ],
        },
      },
    });
  }

  return projects;
}

// Main viewport configuration factory
export function createViewportConfig(
  environment: string,
  overrides: Partial<Config> = {},
): Config {
  // Get base configuration
  const baseConfig = createPlaywrightConfig(environment);
  
  // Create viewport-specific projects
  const viewportProjects = createViewportProjects(environment, baseConfig.projects || []);
  
  // Combine base projects with viewport projects
  const allProjects = [...(baseConfig.projects || []), ...viewportProjects];

  const viewportConfig: Config = {
    ...baseConfig,
    projects: allProjects,
    // Override test directory if needed for viewport-specific tests
    testDir: overrides.testDir || baseConfig.testDir,
    // Add viewport-specific test match patterns
    testMatch: [
      ...(baseConfig.testMatch || []),
      "**/*.viewport.spec.ts",
      "**/*.responsive.spec.ts",
    ],
  };

  return { ...viewportConfig, ...overrides };
}

// Convenience functions for common viewport configurations
export function createLargeDesktopConfig(overrides: Partial<Config> = {}) {
  return createViewportConfig("development", {
    projects: [
      {
        name: "large-desktop",
        use: {
          viewport: VIEWPORTS.LARGE_DESKTOP,
        },
      },
    ],
    ...overrides,
  });
}

export function createSmallDesktopConfig(overrides: Partial<Config> = {}) {
  return createViewportConfig("development", {
    projects: [
      {
        name: "small-desktop",
        use: {
          viewport: VIEWPORTS.SMALL_DESKTOP,
        },
      },
    ],
    ...overrides,
  });
}

export function createTabletConfig(overrides: Partial<Config> = {}) {
  return createViewportConfig("development", {
    projects: [
      {
        name: "tablet",
        use: {
          viewport: VIEWPORTS.TABLET_PORTRAIT,
        },
      },
    ],
    ...overrides,
  });
}

export function createMobileConfig(overrides: Partial<Config> = {}) {
  return createViewportConfig("development", {
    projects: [
      {
        name: "mobile",
        use: {
          viewport: VIEWPORTS.MOBILE_SMALL,
        },
      },
    ],
    ...overrides,
  });
}

// Combined responsive testing configuration
export function createResponsiveConfig(overrides: Partial<Config> = {}) {
  return createViewportConfig("development", {
    projects: [
      {
        name: "responsive-large-desktop",
        use: {
          viewport: VIEWPORTS.LARGE_DESKTOP,
        },
      },
      {
        name: "responsive-small-desktop",
        use: {
          viewport: VIEWPORTS.SMALL_DESKTOP,
        },
      },
      {
        name: "responsive-tablet",
        use: {
          viewport: VIEWPORTS.TABLET_PORTRAIT,
        },
      },
      {
        name: "responsive-mobile",
        use: {
          viewport: VIEWPORTS.MOBILE_SMALL,
        },
      },
    ],
    ...overrides,
  });
}

// Export default configuration
export default createViewportConfig("development");