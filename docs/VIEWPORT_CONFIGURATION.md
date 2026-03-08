# Viewport Configuration for Playwright Testing

This document explains how to configure and use viewport testing for your Next.js portfolio project with Playwright.

## Overview

The viewport configuration system allows you to test your portfolio across different screen sizes and devices:

- **Large Desktop (1280x800)** - Standard desktop monitors
- **Small Desktop (900x600)** - Smaller desktops and laptops
- **Tablet (768x1024)** - Tablet devices in portrait mode
- **Mobile (360x640)** - Mobile phones

## Configuration Files

### 1. Main Configuration (`playwright.config.ts`)

The main Playwright configuration now includes viewport-specific projects:

```typescript
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
// ... more viewport projects
```

### 2. Viewport Configuration (`playwright.config.viewport.ts`)

This file contains all viewport definitions and utilities:

```typescript
export const VIEWPORTS = {
  LARGE_DESKTOP: { width: 1280, height: 800 },
  SMALL_DESKTOP: { width: 900, height: 600 },
  TABLET_PORTRAIT: { width: 768, height: 1024 },
  MOBILE_SMALL: { width: 360, height: 640 },
  // ... more presets
} as const;
```

### 3. Testing Utilities (`playwright-tests/utils/viewport-helpers.ts`)

Helper functions for consistent viewport testing:

```typescript
// Set viewport and wait for stabilization
await setViewportAndWait(page, { width: 1280, height: 800 });

// Test responsive navigation
await testResponsiveNavigation(page);

// Test touch-friendly elements
await testTouchFriendlyElements(page);
```

## Running Viewport-Specific Tests

### Run All Viewport Tests

```bash
npx playwright test --project="large-desktop-1280x800"
npx playwright test --project="small-desktop-900x600"
npx playwright test --project="tablet-768x1024"
npx playwright test --project="mobile-360x640"
```

### Run Specific Test Files

```bash
# Run viewport demo tests
npx playwright test playwright-tests/viewport-demo.spec.ts

# Run comprehensive responsive tests
npx playwright test playwright-tests/responsive-design.spec.ts

# Run both with specific viewport
npx playwright test --project="mobile-360x640" playwright-tests/viewport-demo.spec.ts playwright-tests/responsive-design.spec.ts
```

### Run All Tests Across All Viewports

```bash
# This will run all tests in all viewport configurations
npx playwright test
```

## Test Examples

### Basic Viewport Test

```typescript
import { test, expect } from "@playwright/test";

test("should display correctly on Large Desktop", async ({ page }) => {
  // Viewport is automatically set by the project configuration
  
  // Verify viewport size
  const viewport = page.viewportSize();
  expect(viewport?.width).toBe(1280);
  expect(viewport?.height).toBe(800);

  // Test desktop-specific elements
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('header h1')).toBeVisible();
  
  // Test that mobile menu button is hidden on desktop
  const mobileMenuButton = page.locator('button[aria-label="Open menu"]');
  await expect(mobileMenuButton).toBeHidden();
});
```

### Using Viewport Helpers

```typescript
import { test, expect } from "@playwright/test";
import { 
  setViewportAndWait, 
  testResponsiveNavigation,
  DEVICE_PRESETS 
} from "./utils/viewport-helpers";

test("should handle responsive navigation", async ({ page }) => {
  // Set specific viewport
  await setViewportAndWait(page, DEVICE_PRESETS["mobile"].viewport);
  
  // Test responsive navigation
  await testResponsiveNavigation(page, {
    hasMobileMenu: true,
    expectedDesktopLinks: 5,
    mobileMenuSelector: 'button[aria-label="Open menu"]',
    desktopNavSelector: 'nav a'
  });
});
```

## Available Viewport Presets

### Standard Viewports
- `LARGE_DESKTOP`: 1280x800
- `SMALL_DESKTOP`: 900x600
- `TABLET_PORTRAIT`: 768x1024
- `MOBILE_SMALL`: 360x640

### Additional Device Presets
- `IPHONE_SE`: 375x667
- `IPHONE_12`: 390x844
- `IPAD_PRO`: 1024x1366
- `FULL_HD`: 1920x1080
- `ULTRA_WIDE`: 2560x1440

## Testing Best Practices

### 1. Test Critical User Journeys

Test the most important user flows across all viewports:
- Navigation and menu interactions
- Form submissions
- Content readability
- Image and media display

### 2. Check Responsive Elements

Ensure responsive elements work correctly:
- Mobile hamburger menus
- Touch-friendly buttons (minimum 44x44px)
- Responsive typography
- Flexible layouts

### 3. Verify Accessibility

Test accessibility features across viewports:
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Touch target sizes

### 4. Test Edge Cases

Include tests for:
- Very small viewports (320x568)
- Very large viewports (2560x1440)
- Orientation changes (portrait/landscape)
- Dynamic content resizing

## Common Test Patterns

### Navigation Testing

```typescript
test("navigation adapts to viewport", async ({ page }) => {
  const viewports = [
    { width: 360, height: 640, isMobile: true },
    { width: 768, height: 1024, isMobile: false },
    { width: 1280, height: 800, isMobile: false },
  ];

  for (const { width, height, isMobile } of viewports) {
    await page.setViewportSize({ width, height });
    
    if (isMobile) {
      await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();
    } else {
      await expect(page.locator('nav a')).toBeVisible();
    }
  }
});
```

### Form Testing

```typescript
test("forms are accessible on all viewports", async ({ page }) => {
  await page.goto("/contact");
  
  const viewports = [
    DEVICE_PRESETS["mobile"].viewport,
    DEVICE_PRESETS["tablet"].viewport,
    DEVICE_PRESETS["desktop"].viewport,
  ];

  for (const viewport of viewports) {
    await setViewportAndWait(page, viewport);
    
    // Test form accessibility
    const inputs = page.locator('input, textarea, select');
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const box = await input.boundingBox();
      
      if (box) {
        // Form inputs should be large enough to tap on mobile
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});
```

## Troubleshooting

### Viewport Not Changing

If viewport changes aren't taking effect:

1. Check that you're using the correct project name:
   ```bash
   npx playwright test --project="large-desktop-1280x800"
   ```

2. Verify the viewport configuration is loaded:
   ```typescript
   const viewport = page.viewportSize();
   console.log(`Current viewport: ${viewport?.width}x${viewport?.height}`);
   ```

### Tests Failing on Specific Viewports

If tests fail on certain viewports:

1. Check for viewport-specific CSS that might hide elements
2. Verify touch targets are large enough for mobile
3. Test that navigation adapts correctly
4. Ensure content fits within the viewport

### Performance Issues

For better performance when testing multiple viewports:

1. Use the `fast` environment configuration
2. Limit the number of viewport projects in your test run
3. Use `--grep` to run only specific tests

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Run viewport tests
  run: |
    npx playwright test --project="large-desktop-1280x800"
    npx playwright test --project="mobile-360x640"
```

### Parallel Execution

```bash
# Run multiple viewport tests in parallel
npx playwright test --project="large-desktop-1280x800" --project="mobile-360x640" --workers=2
```

## Custom Viewport Configuration

### Adding New Viewports

Add new viewport presets to `playwright.config.viewport.ts`:

```typescript
export const VIEWPORTS = {
  // ... existing viewports
  CUSTOM_VIEWPORT: { width: 1366, height: 768 },
} as const;
```

Then add a project to `playwright.config.ts`:

```typescript
{
  name: "custom-viewport-1366x768",
  use: {
    viewport: VIEWPORTS.CUSTOM_VIEWPORT,
  },
},
```

### Environment-Specific Viewports

Use different viewports for different environments:

```typescript
const config = createViewportConfig("development", {
  projects: [
    // ... other projects
    {
      name: "ci-viewports",
      use: {
        viewport: process.env.CI ? 
          VIEWPORTS.LARGE_DESKTOP : 
          VIEWPORTS.MOBILE_SMALL,
      },
    },
  ],
});
```

## Next Steps

1. **Run the tests**: Start with the demo tests to see how viewport testing works
2. **Customize for your needs**: Modify the test files to match your portfolio's specific components
3. **Add to CI/CD**: Integrate viewport testing into your deployment pipeline
4. **Monitor performance**: Use the viewport tests to catch responsive design regressions

## Files Created

- `playwright.config.viewport.ts` - Main viewport configuration
- `playwright-tests/viewport-demo.spec.ts` - Example viewport tests
- `playwright-tests/responsive-design.spec.ts` - Comprehensive responsive tests
- `playwright-tests/utils/viewport-helpers.ts` - Testing utilities
- `docs/VIEWPORT_CONFIGURATION.md` - This documentation file

The viewport configuration is now ready to use and will help ensure your portfolio looks great and functions properly across all device sizes!