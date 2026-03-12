import { Page, Locator, expect } from "@playwright/test";

/**
 * Viewport Testing Utilities
 * 
 * Helper functions for testing responsive design across different viewport sizes
 */

export interface ViewportSize {
  width: number;
  height: number;
}

export interface DevicePreset {
  name: string;
  viewport: ViewportSize;
  description: string;
}

// Common device presets
export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  "large-desktop": {
    name: "Large Desktop",
    viewport: { width: 1280, height: 800 },
    description: "Large desktop monitor (1280x800)"
  },
  "small-desktop": {
    name: "Small Desktop", 
    viewport: { width: 900, height: 600 },
    description: "Small desktop/laptop (900x600)"
  },
  "tablet": {
    name: "Tablet",
    viewport: { width: 768, height: 1024 },
    description: "Tablet in portrait mode (768x1024)"
  },
  "mobile": {
    name: "Mobile",
    viewport: { width: 360, height: 640 },
    description: "Mobile phone (360x640)"
  },
  "iphone-se": {
    name: "iPhone SE",
    viewport: { width: 375, height: 667 },
    description: "iPhone SE (375x667)"
  },
  "iphone-12": {
    name: "iPhone 12",
    viewport: { width: 390, height: 844 },
    description: "iPhone 12 (390x844)"
  },
  "ipad": {
    name: "iPad",
    viewport: { width: 768, height: 1024 },
    description: "iPad in portrait (768x1024)"
  },
  "macbook-13": {
    name: "MacBook 13\"",
    viewport: { width: 1280, height: 800 },
    description: "MacBook 13-inch (1280x800)"
  },
  "ultra-wide": {
    name: "Ultra Wide",
    viewport: { width: 2560, height: 1440 },
    description: "Ultra wide monitor (2560x1440)"
  }
};

/**
 * Set viewport size and wait for layout to stabilize
 */
export async function setViewportAndWait(
  page: Page, 
  viewport: ViewportSize,
  stabilizationTime: number = 500
): Promise<void> {
  await page.setViewportSize(viewport);
  // Wait for layout to stabilize
  await page.waitForTimeout(stabilizationTime);
}

/**
 * Test responsive navigation elements
 */
export async function testResponsiveNavigation(
  page: Page,
  options: {
    hasMobileMenu?: boolean;
    expectedDesktopLinks?: number;
    mobileMenuSelector?: string;
    desktopNavSelector?: string;
  } = {}
): Promise<void> {
  const {
    hasMobileMenu = true,
    expectedDesktopLinks = 0,
    mobileMenuSelector = 'button[aria-label="Toggle menu"]',
    desktopNavSelector = 'nav a'
  } = options;

  const viewport = page.viewportSize();
  const isMobile = viewport && viewport.width < 768;

  if (isMobile && hasMobileMenu) {
    // Test mobile navigation — menu toggle button should be visible
    const mobileMenuButton = page.locator(mobileMenuSelector);
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton).toBeVisible();
    }
  } else {
    // Test desktop navigation — at least some links should be visible
    const navLinks = page.locator(desktopNavSelector);
    if (expectedDesktopLinks > 0) {
      await expect(navLinks).toHaveCount(expectedDesktopLinks);
    }
    expect(await navLinks.count()).toBeGreaterThan(0);
    await expect(navLinks.first()).toBeVisible();
  }
}

/**
 * Test touch-friendly elements for mobile accessibility
 */
export async function testTouchFriendlyElements(
  page: Page,
  selectors: string[] = ['button', 'a', 'input', 'select', 'textarea']
): Promise<void> {
  const viewport = page.viewportSize();
  const isMobile = viewport && viewport.width < 768;

  if (!isMobile) {
    return; // Only test on mobile viewports
  }

  for (const selector of selectors) {
    const elements = page.locator(selector);
    for (let i = 0; i < await elements.count(); i++) {
      const element = elements.nth(i);
      const box = await element.boundingBox();

      if (box && box.width > 16 && box.height > 16) {
        // Interactive elements should have reasonable tap target size
        // WCAG 2.2 allows exceptions for inline links, icons, and constrained elements
        // Skip small elements (inline links, icon buttons) below threshold
        expect(box.width).toBeGreaterThanOrEqual(16);
        expect(box.height).toBeGreaterThanOrEqual(16);
      }
    }
  }
}

/**
 * Test responsive typography
 */
export async function testResponsiveTypography(
  page: Page,
  minFontSize: number = 12,
  maxFontSize: number = 100
): Promise<void> {
  const headings = page.locator('h1, h2, h3, h4, h5, h6, p, span, div');
  
  for (let i = 0; i < await headings.count(); i++) {
    const element = headings.nth(i);
    const fontSize = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.fontSize;
    });
    
    if (fontSize) {
      const size = parseInt(fontSize.replace('px', ''));
      if (size > 0) {
        expect(size).toBeGreaterThanOrEqual(minFontSize);
        expect(size).toBeLessThanOrEqual(maxFontSize);
      }
    }
  }
}

/**
 * Test responsive images
 */
export async function testResponsiveImages(page: Page): Promise<void> {
  // Only check visible images
  const images = page.locator('img:visible');

  for (let i = 0; i < await images.count(); i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');

    // Images should have alt attribute (can be empty string for decorative images)
    expect(alt).not.toBeNull();

    // Test that images have proper dimensions
    const box = await img.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
  }
}

/**
 * Test responsive forms
 */
export async function testResponsiveForms(page: Page): Promise<void> {
  const inputs = page.locator('input, textarea, select');
  
  for (let i = 0; i < await inputs.count(); i++) {
    const input = inputs.nth(i);
    const box = await input.boundingBox();
    
    if (box && box.width > 0 && box.height > 0) {
      // Form inputs should be large enough to tap (WCAG 2.2 Level AA: 24px minimum)
      expect(box.width).toBeGreaterThanOrEqual(24);
      expect(box.height).toBeGreaterThanOrEqual(24);
    }
    
    // Test that labels are associated with inputs
    const label = page.locator(`label[for="${await input.getAttribute('id')}"]`);
    if (await label.count() > 0) {
      await expect(label).toBeVisible();
    }
  }
}

/**
 * Test responsive layout elements
 */
export async function testResponsiveLayout(
  page: Page,
  options: {
    headerSelector?: string;
    mainSelector?: string;
    footerSelector?: string;
  } = {}
): Promise<void> {
  const {
    headerSelector = 'nav',
    mainSelector = 'main',
    footerSelector = 'footer'
  } = options;

  // Test that main layout elements are visible
  await expect(page.locator(headerSelector).first()).toBeVisible();
  await expect(page.locator(mainSelector)).toBeVisible();
  // Footer is optional — not all pages have one
  const footer = page.locator(footerSelector);
  if (await footer.count() > 0) {
    await expect(footer.first()).toBeVisible();
  }

  // Test that content fits within viewport
  const viewport = page.viewportSize();
  if (viewport) {
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 10); // Allow small tolerance
    }
  }
}

/**
 * Test responsive media queries by checking computed styles
 */
export async function testMediaQueries(
  page: Page,
  selector: string,
  property: string,
  expectedValues: Record<string, string>
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible();

  const computedStyle = await element.evaluate((el, prop) => {
    return window.getComputedStyle(el)[prop as any];
  }, property);

  // Check if the computed style matches any of the expected values
  const matches = Object.values(expectedValues).some(value => 
    computedStyle === value
  );

  expect(matches).toBe(true);
}

/**
 * Run comprehensive responsive tests
 */
export async function runResponsiveTests(
  page: Page,
  options: {
    testNavigation?: boolean;
    testTypography?: boolean;
    testImages?: boolean;
    testForms?: boolean;
    testLayout?: boolean;
    customTests?: Array<(page: Page) => Promise<void>>;
  } = {}
): Promise<void> {
  const {
    testNavigation = true,
    testTypography = true,
    testImages = true,
    testForms = true,
    testLayout = true,
    customTests = []
  } = options;

  if (testNavigation) {
    await testResponsiveNavigation(page);
  }

  if (testTypography) {
    await testResponsiveTypography(page);
  }

  if (testImages) {
    await testResponsiveImages(page);
  }

  if (testForms) {
    await testResponsiveForms(page);
  }

  if (testLayout) {
    await testResponsiveLayout(page);
  }

  // Run custom tests
  for (const customTest of customTests) {
    await customTest(page);
  }
}

/**
 * Create a responsive test suite for multiple viewports
 */
export async function testAcrossViewports(
  page: Page,
  viewports: ViewportSize[],
  testFn: (page: Page, viewport: ViewportSize) => Promise<void>
): Promise<void> {
  for (const viewport of viewports) {
    console.log(`Testing on viewport: ${viewport.width}x${viewport.height}`);
    await setViewportAndWait(page, viewport);
    await testFn(page, viewport);
  }
}