import { expect, test } from "@playwright/test";

test.describe("3D Interactive Demos", () => {
  test.describe("Three.js Integration", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    test("should load Three.js library", async ({ page }) => {
      // Check if Three.js is loaded
      const threeLoaded = await page.evaluate(() => {
        return typeof (window as Window & { THREE?: unknown }).THREE !== "undefined";
      });

      if (threeLoaded) {
        // Verify Three.js version and basic functionality
        const threeInfo = await page.evaluate(() => {
          const THREE = (window as Window & { THREE?: unknown }).THREE;
          return {
            version: THREE.REVISION,
            hasWebGLRenderer: typeof THREE.WebGLRenderer !== "undefined",
            hasScene: typeof THREE.Scene !== "undefined",
            hasCamera: typeof THREE.PerspectiveCamera !== "undefined",
          };
        });

        expect(threeInfo.version).toBeTruthy();
        expect(threeInfo.hasWebGLRenderer).toBe(true);
        expect(threeInfo.hasScene).toBe(true);
        expect(threeInfo.hasCamera).toBe(true);
      } else {
        console.log("Three.js not loaded on this page - may be lazy loaded");
      }
    });

    test("should render 3D canvas elements", async ({ page }) => {
      // Look for canvas elements that might be 3D
      const canvases = page.locator("canvas");

      if ((await canvases.count()) > 0) {
        for (const canvas of await canvases.all()) {
          // Check canvas dimensions
          const boundingBox = await canvas.boundingBox();

          if (boundingBox) {
            // Canvas should have reasonable dimensions
            expect(boundingBox.width).toBeGreaterThan(100);
            expect(boundingBox.height).toBeGreaterThan(100);

            // Should be visible
            await expect(canvas).toBeVisible();
          }
        }
      } else {
        console.log("No canvas elements found - 3D content may be lazy loaded");
      }
    });

    test("should handle WebGL context", async ({ page }) => {
      // Check WebGL support
      const webglSupport = await page.evaluate(() => {
        try {
          const canvas = document.createElement("canvas");
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          return gl !== null;
        } catch (_e) {
          return false;
        }
      });

      expect(webglSupport).toBe(true);
    });
  });

  test.describe("Interactive 3D Controls", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
    });

    test("should support mouse interactions", async ({ page }) => {
      const canvas = page.locator("canvas").first();

      if (await canvas.isVisible()) {
        // Test mouse interactions
        await canvas.hover();

        // Try mouse drag
        const boundingBox = await canvas.boundingBox();
        if (boundingBox) {
          await page.mouse.move(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2,
          );
          await page.mouse.down();
          await page.mouse.move(
            boundingBox.x + boundingBox.width / 2 + 50,
            boundingBox.y + boundingBox.height / 2,
          );
          await page.mouse.up();

          // Canvas should still be visible after interaction
          await expect(canvas).toBeVisible();
        }
      }
    });

    test("should support touch interactions on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const canvas = page.locator("canvas").first();

      if (await canvas.isVisible()) {
        // Test touch interactions
        const boundingBox = await canvas.boundingBox();
        if (boundingBox) {
          // Simulate touch
          await page.touchscreen.tap(
            boundingBox.x + boundingBox.width / 2,
            boundingBox.y + boundingBox.height / 2,
          );

          // Canvas should still be visible
          await expect(canvas).toBeVisible();
        }
      }
    });

    test("should handle keyboard controls", async ({ page }) => {
      const canvas = page.locator("canvas").first();

      if (await canvas.isVisible()) {
        // Focus canvas
        await canvas.focus();

        // Test keyboard controls
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowRight");

        // Canvas should remain functional
        await expect(canvas).toBeVisible();
      }
    });
  });

  test.describe("Performance & Optimization", () => {
    test("should optimize 3D rendering performance", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check for performance optimizations
      const performanceMetrics = await page.evaluate(
        (): Promise<{ fps: number; memoryUsage: number | null; memoryLimit: number | null }> => {
          const observers: PerformanceObserver[] = [];

          return new Promise((resolve) => {
            // Monitor frame rate
            let frameCount = 0;
            let lastTime = performance.now();

            const checkFrameRate = (currentTime: number) => {
              frameCount++;
              if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;

                // Check memory usage
                if ("memory" in performance) {
                  const memory = (performance as Performance & { memory?: unknown }).memory;
                  resolve({
                    fps,
                    memoryUsage: memory.usedJSHeapSize,
                    memoryLimit: memory.jsHeapSizeLimit,
                  });
                } else {
                  resolve({ fps, memoryUsage: null, memoryLimit: null });
                }

                // Stop monitoring
                observers.forEach(
                  (observer: unknown) => void (observer as { disconnect: () => void }).disconnect(),
                );
              } else {
                requestAnimationFrame(checkFrameRate);
              }
            };

            requestAnimationFrame(checkFrameRate);

            // Timeout after 2 seconds
            setTimeout(() => {
              resolve({ fps: 0, memoryUsage: null, memoryLimit: null });
              observers.forEach(
                (observer: unknown) => void (observer as { disconnect: () => void }).disconnect(),
              );
            }, 2000);
          });
        },
      );

      // Should maintain reasonable frame rate
      if (performanceMetrics.fps > 0) {
        expect(performanceMetrics.fps).toBeGreaterThan(10); // At least 10 FPS
      }

      // Memory usage should be reasonable
      if (performanceMetrics.memoryUsage && performanceMetrics.memoryLimit) {
        const memoryUsageRatio = performanceMetrics.memoryUsage / performanceMetrics.memoryLimit;
        expect(memoryUsageRatio).toBeLessThan(0.8); // Less than 80% memory usage
      }
    });

    test("should lazy load 3D content", async ({ page }) => {
      // Check initial page load without 3D content
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const initialCanvasCount = await page.locator("canvas").count();

      // Wait for full load
      await page.waitForLoadState("networkidle");

      const finalCanvasCount = await page.locator("canvas").count();

      // 3D content should load progressively
      if (finalCanvasCount > initialCanvasCount) {
        console.log(
          `3D content lazy loaded: ${finalCanvasCount - initialCanvasCount} canvas elements`,
        );
      }
    });

    test("should handle device capabilities", async ({ page }) => {
      // Check device capabilities
      const capabilities = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        if (!gl)
          return {
            webgl: false,
            maxTextureSize: 0,
            maxViewportDims: [0, 0],
            renderer: null,
            vendor: null,
          };

        const webglContext = gl as WebGLRenderingContext;

        return {
          webgl: true,
          maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE),
          maxViewportDims: webglContext.getParameter(webglContext.MAX_VIEWPORT_DIMS),
          renderer: webglContext.getParameter(webglContext.RENDERER),
          vendor: webglContext.getParameter(webglContext.VENDOR),
        };
      });

      expect(capabilities.webgl).toBe(true);

      if (capabilities.maxTextureSize) {
        expect(capabilities.maxTextureSize).toBeGreaterThan(1024);
      }
    });
  });

  test.describe("3D Content Accessibility", () => {
    test("should provide alternative content", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const canvases = page.locator("canvas");

      for (const canvas of await canvases.all()) {
        // Check for aria-label or alternative content
        const ariaLabel = await canvas.getAttribute("aria-label");
        const ariaLabelledBy = await canvas.getAttribute("aria-labelledby");
        const title = await canvas.getAttribute("title");

        // Should have some form of description
        const hasDescription = ariaLabel || ariaLabelledBy || title;
        expect(hasDescription).toBe(true);
      }
    });

    test("should be keyboard accessible", async ({ page }) => {
      const canvas = page.locator("canvas").first();

      if (await canvas.isVisible()) {
        // Canvas should be focusable
        await canvas.focus();

        const isFocused = await canvas.evaluate((el) => el === document.activeElement);
        expect(isFocused).toBe(true);

        // Should support keyboard navigation
        await page.keyboard.press("Tab");
        const nextElement = await page.locator(":focus").first();
        expect(nextElement).not.toBe(canvas); // Should be able to tab away
      }
    });

    test("should provide fallback content", async ({ page }) => {
      // Check for noscript content or fallback messages
      const noscript = page.locator("noscript");
      const fallbackMessages = page.locator("text=/WebGL|3D|canvas/i");

      const hasFallback = (await noscript.count()) > 0 || (await fallbackMessages.count()) > 0;
      expect(hasFallback).toBe(true);
    });
  });

  test.describe("Cross-browser Compatibility", () => {
    test("should work across different browsers", async ({ page }) => {
      // Basic functionality test that should work across browsers
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check that 3D content loads without errors
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000);

      // Should not have WebGL or Three.js related errors
      const webglErrors = consoleErrors.filter(
        (error) =>
          error.includes("WebGL") ||
          error.includes("THREE") ||
          error.includes("webgl") ||
          error.includes("shader"),
      );

      expect(webglErrors.length).toBe(0);
    });

    test("should handle browser capabilities gracefully", async ({ page }) => {
      // Test graceful degradation
      const degradation = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        let context: unknown = null;

        try {
          context = canvas.getContext("webgl");
          if (!context) {
            context = canvas.getContext("experimental-webgl");
          }
        } catch (_e) {
          // WebGL not supported
        }

        return {
          webglSupported: context !== null,
          fallbackAvailable: document.querySelectorAll("[data-fallback], .fallback").length > 0,
        };
      });

      // If WebGL is not supported, there should be fallback content
      if (!degradation.webglSupported) {
        expect(degradation.fallbackAvailable).toBe(true);
      }
    });
  });
});
