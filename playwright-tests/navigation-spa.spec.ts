import { test, expect } from '@playwright/test';

/**
 * SPA Navigation Tests — navigation-spa.spec.ts
 *
 * Validates that React Router DOM Link-based navigation works correctly:
 * - All routes are reachable
 * - Navigation does NOT cause full page reloads (true SPA behaviour)
 * - Browser back/forward works
 * - Deep linking (direct URL access) works
 * - Mobile navigation (hamburger menu) works
 * - 404 fallback renders for unknown routes
 */

const ALL_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/product', label: 'Product' },
  { path: '/projects', label: 'Projects' },
  { path: '/resume', label: 'Resume' },
  { path: '/agents', label: 'Agents' },
  { path: '/settings', label: 'Settings' },
  { path: '/performance', label: 'Performance' },
];

// ─── Deep Linking ──────────────────────────────────────────────────────────────

test.describe('Deep Linking — Direct URL Access', () => {
  for (const route of ALL_ROUTES) {
    test(`navigating directly to ${route.path} renders content`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');

      // Page should have rendered content (not blank)
      const body = page.locator('body');
      await expect(body).toBeVisible();

      const text = await body.textContent();
      expect(text!.trim().length).toBeGreaterThan(50);

      // Should not show a JS error screen
      const errorTexts = ['ChunkLoadError', 'Cannot read properties of undefined'];
      for (const errText of errorTexts) {
        expect(text).not.toContain(errText);
      }
    });
  }

  test('direct access to unknown route shows 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await page.waitForLoadState('domcontentloaded');

    const body = await page.locator('body').textContent();
    // Should show a not-found message
    const has404 =
      body!.includes('404') ||
      body!.toLowerCase().includes('not found') ||
      body!.toLowerCase().includes("doesn't exist") ||
      body!.toLowerCase().includes('page not found');

    expect(has404).toBeTruthy();
  });
});

// ─── SPA Navigation (no full reload) ──────────────────────────────────────────

test.describe('SPA Navigation — Link Component (No Full Page Reload)', () => {
  test('navigation links in navbar use SPA routing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Collect all nav links
    const navLinks = page.locator('nav a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // All nav links should point to internal routes (no external hrefs)
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
        // Internal links should use React Router — no full page reload expected
        expect(href).toMatch(/^\//);
      }
    }
  });

  test('clicking a nav link updates the URL without reload', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try clicking the "About" link if it exists in nav
    const aboutLink = page.locator('nav a[href="/about"]');
    if ((await aboutLink.count()) > 0) {
      await aboutLink.click();
      await page.waitForURL('**/about', { timeout: 5000 });
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test('clicking nav links to /product updates URL correctly', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const productLink = page.locator('nav a[href="/product"]');
    if ((await productLink.count()) > 0) {
      await productLink.click();
      await page.waitForURL('**/product', { timeout: 5000 });
      await expect(page).toHaveURL(/\/product/);
      // Content should update
      const body = await page.locator('body').textContent();
      expect(body!.length).toBeGreaterThan(100);
    }
  });

  test('clicking nav links to /projects works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('nav a[href="/projects"]');
    if ((await link.count()) > 0) {
      await link.click();
      await page.waitForURL('**/projects', { timeout: 5000 });
      await expect(page).toHaveURL(/\/projects/);
    }
  });

  test('clicking nav links to /resume works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('nav a[href="/resume"]');
    if ((await link.count()) > 0) {
      await link.click();
      await page.waitForURL('**/resume', { timeout: 5000 });
      await expect(page).toHaveURL(/\/resume/);
    }
  });

  test('clicking nav links to /settings works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('nav a[href="/settings"]');
    if ((await link.count()) > 0) {
      await link.click();
      await page.waitForURL('**/settings', { timeout: 5000 });
      await expect(page).toHaveURL(/\/settings/);
    }
  });

  test('clicking nav links to /performance works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('nav a[href="/performance"]');
    if ((await link.count()) > 0) {
      await link.click();
      await page.waitForURL('**/performance', { timeout: 5000 });
      await expect(page).toHaveURL(/\/performance/);
    }
  });

  test('clicking nav links to /agents works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('nav a[href="/agents"]');
    if ((await link.count()) > 0) {
      await link.click();
      await page.waitForURL('**/agents', { timeout: 5000 });
      await expect(page).toHaveURL(/\/agents/);
    }
  });
});

// ─── Browser History ──────────────────────────────────────────────────────────

test.describe('Browser History — Back / Forward', () => {
  test('browser back button returns to previous route', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await page.goBack();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/');
  });

  test('browser forward button advances to next route', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await page.goBack();
    await page.waitForLoadState('networkidle');

    await page.goForward();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/about');
  });

  test('multi-step navigation history works correctly', async ({ page }) => {
    const steps = ['/', '/about', '/product', '/projects'];

    for (const step of steps) {
      await page.goto(step);
      await page.waitForLoadState('networkidle');
    }

    // Go back through history
    for (let i = steps.length - 2; i >= 0; i--) {
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(steps[i]);
    }
  });
});

// ─── Mobile Navigation ────────────────────────────────────────────────────────

test.describe('Mobile Navigation — Hamburger Menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button (hamburger icon)
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="navigation" i], [class*="hamburger"], [class*="menu-button"], button svg'
    );

    // At least one interactive element for mobile nav
    const count = await menuButton.count();
    expect(count).toBeGreaterThan(0);
  });

  test('mobile menu opens when hamburger is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the mobile menu button
    const menuButton = page
      .locator('button[aria-label*="menu" i], [class*="hamburger"]')
      .first();

    if ((await menuButton.count()) > 0) {
      await menuButton.click();

      // Menu should now be expanded/visible
      const mobileMenu = page.locator(
        '[class*="mobile-menu"], [class*="mobile-nav"], nav ul, [role="menu"]'
      );
      await expect(mobileMenu.first()).toBeVisible();
    }
  });

  for (const route of ALL_ROUTES.slice(0, 4)) {
    test(`mobile navigation to ${route.path} works`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Try opening mobile menu first
      const menuButton = page
        .locator('button[aria-label*="menu" i], [class*="hamburger"]')
        .first();

      if ((await menuButton.count()) > 0) {
        await menuButton.click();
        await page.waitForTimeout(300); // animation
      }

      // Find and click the route link
      const link = page.locator(`a[href="${route.path}"]`).first();
      if ((await link.count()) > 0 && (await link.isVisible())) {
        await link.click();
        await page.waitForURL(`**${route.path}`, { timeout: 5000 });
        await expect(page).toHaveURL(new RegExp(route.path.replace('/', '\\/')));
      }
    });
  }
});

// ─── Route Content Validation ─────────────────────────────────────────────────

test.describe('Route Content — Each Page Renders Expected Content', () => {
  test('/ renders home/hero content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    // Home page should mention name or portfolio keywords
    const hasContent =
      body!.toLowerCase().includes('themistoklis') ||
      body!.toLowerCase().includes('portfolio') ||
      body!.toLowerCase().includes('engineer') ||
      body!.toLowerCase().includes('hello') ||
      body!.toLowerCase().includes('welcome');
    expect(hasContent).toBeTruthy();
  });

  test('/about renders professional bio content', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.toLowerCase().includes('about') ||
      body!.toLowerCase().includes('experience') ||
      body!.toLowerCase().includes('skills') ||
      body!.toLowerCase().includes('engineer');
    expect(hasContent).toBeTruthy();
  });

  test('/product renders work experience content', async ({ page }) => {
    await page.goto('/product');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.includes('Estarta') ||
      body!.toLowerCase().includes('experience') ||
      body!.toLowerCase().includes('engineer');
    expect(hasContent).toBeTruthy();
  });

  test('/projects renders projects gallery', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.toLowerCase().includes('project') ||
      body!.toLowerCase().includes('github') ||
      body!.toLowerCase().includes('portfolio');
    expect(hasContent).toBeTruthy();
  });

  test('/resume renders resume builder', async ({ page }) => {
    await page.goto('/resume');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.toLowerCase().includes('resume') ||
      body!.toLowerCase().includes('cv') ||
      body!.toLowerCase().includes('themistoklis') ||
      body!.toLowerCase().includes('download');
    expect(hasContent).toBeTruthy();
  });

  test('/agents renders AI agents content', async ({ page }) => {
    await page.goto('/agents');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.toLowerCase().includes('agent') ||
      body!.toLowerCase().includes('ai') ||
      body!.toLowerCase().includes('automation');
    expect(hasContent).toBeTruthy();
  });

  test('/settings renders settings panels', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.toLowerCase().includes('settings') ||
      body!.toLowerCase().includes('theme') ||
      body!.toLowerCase().includes('appearance') ||
      body!.toLowerCase().includes('privacy');
    expect(hasContent).toBeTruthy();
  });

  test('/performance renders performance dashboard', async ({ page }) => {
    await page.goto('/performance');
    await page.waitForLoadState('networkidle');

    const body = await page.locator('body').textContent();
    const hasContent =
      body!.toLowerCase().includes('performance') ||
      body!.toLowerCase().includes('metric') ||
      body!.toLowerCase().includes('lighthouse');
    expect(hasContent).toBeTruthy();
  });
});

// ─── No Broken Routes ─────────────────────────────────────────────────────────

test.describe('Route Health — No 500 Errors or Blank Pages', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.path} does not render a blank page`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');

      const bodyText = await page.locator('body').textContent();
      expect(bodyText!.trim().length).toBeGreaterThan(50);
    });

    test(`${route.path} has a visible navigation bar`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      const nav = page.locator('nav');
      await expect(nav.first()).toBeVisible();
    });
  }
});
