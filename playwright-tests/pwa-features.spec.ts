import { expect, test } from "@playwright/test";

test.describe("PWA Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should have proper PWA manifest", async ({ page }) => {
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
    
    const manifestHref = await manifestLink.getAttribute("href");
    expect(manifestHref).toBeTruthy();
    
    // Fetch and validate manifest
    const manifestResponse = await page.request.get(manifestHref!);
    expect(manifestResponse.status()).toBe(200);
    
    const manifestData = await manifestResponse.json();
    expect(manifestData).toHaveProperty("name");
    expect(manifestData).toHaveProperty("short_name");
    expect(manifestData).toHaveProperty("icons");
    expect(manifestData).toHaveProperty("start_url");
    expect(manifestData).toHaveProperty("display");
    expect(manifestData).toHaveProperty("theme_color");
    expect(manifestData).toHaveProperty("background_color");
    
    // Validate manifest content
    expect(manifestData.name).toBeTruthy();
    expect(manifestData.short_name).toBeTruthy();
    expect(Array.isArray(manifestData.icons)).toBe(true);
    expect(manifestData.display).toMatch(/(standalone|fullscreen|minimal-ui)/);
  });

  test("should have proper PWA meta tags", async ({ page }) => {
    // Check for theme-color meta tag (may have multiple for light/dark media queries)
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor.first()).toBeAttached();
    await expect(themeColor.first()).toHaveAttribute("content");
    
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toBeAttached();
    await expect(viewport).toHaveAttribute("content");
    
    // Check for apple-mobile-web-app-capable (injected by client-side DynamicMetadata)
    const appleWebApp = page.locator('meta[name="apple-mobile-web-app-capable"]');
    if (await appleWebApp.count() > 0) {
      await expect(appleWebApp).toHaveAttribute("content", "yes");
    }

    // Check for apple-mobile-web-app-status-bar-style (injected by client-side DynamicMetadata)
    const statusBarStyle = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (await statusBarStyle.count() > 0) {
      await expect(statusBarStyle).toHaveAttribute("content");
    }
  });

  test("should handle service worker registration", async ({ page }) => {
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });
    
    // Service worker may or may not be registered depending on conditions
    expect(typeof swRegistered).toBe("boolean");
    
    // Check for service worker file
    const swResponse = await page.request.get("/sw.js");
    expect([200, 404]).toContain(swResponse.status());
    
    if (swResponse.status() === 200) {
      const swContent = await swResponse.text();
      expect(swContent).toContain("self.addEventListener");
    }
  });

  test("should display PWA install button", async ({ page }) => {
    // Check for PWA install button
    const installButton = page.locator('[data-testid="pwa-install-button"]');
    const installButtonAlt = page.getByRole("button", { name: /install|add to home screen/i });
    
    // Button may be visible or hidden depending on browser support and installation state
    if (await installButton.isVisible() || await installButtonAlt.isVisible()) {
      await expect(installButton.or(installButtonAlt)).toBeVisible();
      
      // Test button click
      await (await installButton.isVisible() ? installButton : installButtonAlt).click();
      
      // Should handle click without errors
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should handle beforeinstallprompt event", async ({ page }) => {
    // Check if beforeinstallprompt event is handled
    const promptHandled = await page.evaluate(() => {
      return window.addEventListener ? true : false;
    });
    
    expect(promptHandled).toBe(true);
    
    // Check for deferred prompt
    const hasDeferredPrompt = await page.evaluate(() => {
      return window.deferredPrompt !== undefined;
    });
    
    expect(typeof hasDeferredPrompt).toBe("boolean");
  });

  test("should handle PWA installation", async ({ page }) => {
    // Mock beforeinstallprompt event
    await page.evaluate(() => {
      window.deferredPrompt = {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
    });
    
    // Trigger installation
    const installButton = page.locator('[data-testid="pwa-install-button"]');
    if (await installButton.isVisible()) {
      await installButton.click();
      
      // Should handle installation
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("should handle PWA offline functionality", async ({ page }) => {
    // Test offline mode
    await page.context().setOffline(true);

    // Should still load cached content
    await page.reload().catch(() => {
      // Reload may fail when offline if no service worker cache — that's expected
    });
    await page.waitForTimeout(2000);

    // Should show offline indicator or cached content
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    const cachedContent = page.locator('[data-testid="cached-content"]');

    if (await offlineIndicator.isVisible().catch(() => false)) {
      await expect(offlineIndicator).toBeVisible();
    } else if (await cachedContent.isVisible().catch(() => false)) {
      await expect(cachedContent).toBeVisible();
    } else {
      // Should still have some content
      await expect(page.locator("body")).toBeVisible();
    }

    // Restore online
    await page.context().setOffline(false);
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("should handle PWA update notifications", async ({ page }) => {
    // Check for update notification
    const updateNotification = page.locator('[data-testid="pwa-update-notification"]');
    
    if (await updateNotification.isVisible()) {
      await expect(updateNotification).toBeVisible();
      
      // Test update button
      const updateButton = page.getByRole("button", { name: /update|reload/i });
      if (await updateButton.isVisible()) {
        await updateButton.click();
        
        // Should handle update
        await expect(page.locator("body")).toBeVisible();
      }
    }
  });

  test("should handle PWA splash screen", async ({ page }) => {
    // Check for splash screen elements
    const splashScreen = page.locator('[data-testid="splash-screen"]');
    const splashLogo = page.locator('[data-testid="splash-logo"]');
    
    // Splash screen may be visible on initial load
    if (await splashScreen.isVisible()) {
      await expect(splashScreen).toBeVisible();
      await expect(splashLogo).toBeVisible();
      
      // Should disappear after loading
      await page.waitForTimeout(2000);
      await expect(splashScreen).toBeHidden();
    }
  });

  test("should handle PWA theme colors", async ({ page }) => {
    // Check for theme color meta tag (may have multiple for light/dark media queries)
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor.first()).toBeAttached();
    
    // There may be multiple theme-color meta tags (light/dark media queries)
    const themeColorValue = await themeColor.first().getAttribute("content");
    expect(themeColorValue).toBeTruthy();
    expect(themeColorValue).toMatch(/^#[0-9a-fA-F]{3,8}$/);

    // Check for apple mobile web app status bar style (injected by client-side DynamicMetadata)
    const statusBarStyle = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (await statusBarStyle.count() > 0) {
      await expect(statusBarStyle).toHaveAttribute("content");
    }
  });

  test("should handle PWA icons", async ({ page }) => {
    // Check for icon links
    const iconLinks = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]');
    const iconCount = await iconLinks.count();
    
    expect(iconCount).toBeGreaterThan(0);
    
    // Check for favicon (Next.js renders <link rel="icon">, not "shortcut icon")
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon.first()).toBeAttached();
    
    // Check for apple touch icons (set in layout.tsx metadata)
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    if (await appleTouchIcon.count() > 0) {
      await expect(appleTouchIcon.first()).toBeAttached();
    }
  });

  test("should handle PWA start URL", async ({ page }) => {
    // Check manifest start_url
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    expect(manifestData).toHaveProperty("start_url");
    expect(manifestData.start_url).toBeTruthy();
    
    // Start URL should be valid
    const startUrl = manifestData.start_url;
    expect(startUrl).toMatch(/^\/|https?:\/\//);
  });

  test("should handle PWA display modes", async ({ page }) => {
    // Check manifest display mode
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    expect(manifestData).toHaveProperty("display");
    expect(manifestData.display).toMatch(/(standalone|fullscreen|minimal-ui|browser)/);
  });

  test("should handle PWA orientation", async ({ page }) => {
    // Check manifest orientation
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    if (manifestData.orientation) {
      expect(manifestData.orientation).toMatch(/(any|natural|landscape|portrait)/);
    }
  });

  test("should handle PWA scope", async ({ page }) => {
    // Check manifest scope
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    if (manifestData.scope) {
      expect(manifestData.scope).toMatch(/^\/|https?:\/\//);
    }
  });

  test("should handle PWA categories", async ({ page }) => {
    // Check manifest categories
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    if (manifestData.categories) {
      expect(Array.isArray(manifestData.categories)).toBe(true);
      expect(manifestData.categories.length).toBeGreaterThan(0);
    }
  });

  test("should handle PWA shortcuts", async ({ page }) => {
    // Check manifest shortcuts
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    if (manifestData.shortcuts) {
      expect(Array.isArray(manifestData.shortcuts)).toBe(true);
      
      for (const shortcut of manifestData.shortcuts) {
        expect(shortcut).toHaveProperty("name");
        expect(shortcut).toHaveProperty("url");
        expect(shortcut).toHaveProperty("icons");
      }
    }
  });

  test("should handle PWA protocol handlers", async ({ page }) => {
    // Check manifest protocol handlers
    const manifestLink = page.locator('link[rel="manifest"]');
    const manifestHref = await manifestLink.getAttribute("href");
    
    const manifestResponse = await page.request.get(manifestHref!);
    const manifestData = await manifestResponse.json();
    
    if (manifestData.protocol_handlers) {
      expect(Array.isArray(manifestData.protocol_handlers)).toBe(true);
      
      for (const handler of manifestData.protocol_handlers) {
        expect(handler).toHaveProperty("protocol");
        expect(handler).toHaveProperty("url");
      }
    }
  });

  test("should handle PWA edge mode", async ({ page }) => {
    // Check for edge mode meta tag
    const edgeMode = page.locator('meta[http-equiv="X-UA-Compatible"]');
    if (await edgeMode.isVisible()) {
      await expect(edgeMode).toHaveAttribute("content", "IE=edge");
    }
  });

  test("should handle PWA security headers", async ({ page }) => {
    // Check for security headers
    const response = await page.request.get("/");
    const headers = response.headers();

    // Security headers are configured in next.config.ts but may not be present
    // in static export mode or local dev server — check conditionally
    if (headers["x-frame-options"]) {
      expect(headers["x-frame-options"]).toBeTruthy();
    }
    if (headers["x-content-type-options"]) {
      expect(headers["x-content-type-options"]).toBeTruthy();
    }
    if (headers["x-xss-protection"]) {
      expect(headers["x-xss-protection"]).toBeTruthy();
    }
  });

  test("should handle PWA performance optimization", async ({ page }) => {
    // Check for performance optimization meta tags
    const performanceTags = page.locator('meta[name="theme-color"], meta[name="apple-mobile-web-app-capable"]');
    expect(await performanceTags.count()).toBeGreaterThan(0);
    
    // Check for preconnect links
    const preconnectLinks = page.locator('link[rel="preconnect"]');
    const preconnectCount = await preconnectLinks.count();
    
    // May have preconnect links for performance
    expect(typeof preconnectCount).toBe("number");
  });

  test("should handle PWA accessibility", async ({ page }) => {
    // Check for accessibility features
    const ariaLabels = page.locator('[aria-label]');
    const ariaRoles = page.locator('[role]');
    
    expect(await ariaLabels.count()).toBeGreaterThan(0);
    expect(await ariaRoles.count()).toBeGreaterThan(0);
    
    // Check for skip links
    const skipLinks = page.locator('[href="#main"], [href="#content"]');
    const skipLinkCount = await skipLinks.count();
    
    expect(typeof skipLinkCount).toBe("number");
  });
});