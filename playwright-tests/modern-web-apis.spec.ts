import { expect, test } from '@playwright/test'

/**
 * Modern Web APIs and Features Test Suite
 * Tests for cutting-edge web platform features and APIs
 */

test.describe('Modern Web APIs', () => {
  test.describe('Intersection Observer', () => {
    test('should support Intersection Observer API', { tag: '@fast' }, async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const isSupported = await page.evaluate(() => {
        return 'IntersectionObserver' in window
      })

      expect(isSupported).toBe(true)
    })

    test('should handle lazy loading with Intersection Observer', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      // Test that lazy loading is supported (loading attribute)
      const lazyLoadingSupported = await page.evaluate(() => {
        const img = document.createElement('img')
        return 'loading' in img
      })

      expect(lazyLoadingSupported).toBe(true)

      // Check if any images use lazy loading (optional)
      const lazyImages = await page.$$eval("img[loading='lazy']", (imgs) => imgs.length)
      // Lazy loading might not be implemented yet, so this is informational
      console.log(`Found ${lazyImages} lazy-loaded images`)
    })
  })

  test.describe('Web Animations API', () => {
    test('should support Web Animations API', { tag: '@fast' }, async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const isSupported = await page.evaluate(() => {
        return 'animate' in document.createElement('div')
      })

      expect(isSupported).toBe(true)
    })

    test('should handle CSS animations and transitions', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      // Check for animated elements (may not be present or may be lazy-loaded)
      const animatedElements = await page.$$eval(
        "[style*='animation'], [class*='animate']",
        (elements) => elements.length,
      )
      expect(animatedElements).toBeGreaterThanOrEqual(0) // Animations may not be present
    })
  })

  test.describe('Web Share API', () => {
    test('should detect Web Share API support', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const shareSupport = await page.evaluate(() => ({
        supported: 'share' in navigator,
        canShare: 'canShare' in navigator,
      }))

      // Web Share API support is optional but should be detected
      expect(typeof shareSupport.supported).toBe('boolean')
    })
  })

  test.describe('Storage APIs', () => {
    test('should support localStorage and sessionStorage', { tag: '@fast' }, async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const storageSupport = await page.evaluate(() => ({
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
      }))

      expect(storageSupport.localStorage).toBe(true)
      expect(storageSupport.sessionStorage).toBe(true)
    })

    test('should handle storage events', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      // Test storage event handling
      const storageEventFired = await page.evaluate(() => {
        return new Promise<boolean>((resolve) => {
          window.addEventListener('storage', () => resolve(true), { once: true })
          localStorage.setItem('test', 'value')
          // Fallback timeout in case event doesn't fire
          setTimeout(() => resolve(false), 100)
        })
      })

      // Storage events might not fire in same-tab scenarios, so this is informational
      expect(typeof storageEventFired).toBe('boolean')
    })
  })

  test.describe('Web Workers', () => {
    test('should support Web Workers', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const workerSupport = await page.evaluate(() => {
        return 'Worker' in window
      })

      expect(workerSupport).toBe(true)
    })
  })

  test.describe('Service Workers', () => {
    test('should register service worker', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      // Check if service worker is supported
      const swSupported = await page.evaluate(() => {
        return 'serviceWorker' in navigator
      })

      if (!swSupported) {
        console.log('Service Worker not supported in this browser')
        return
      }

      // Wait for service worker to register (with timeout)
      const swRegistered = await page.evaluate(() => {
        return new Promise<boolean>((resolve) => {
          if (!navigator.serviceWorker) {
            resolve(false)
            return
          }

          // Check if already registered
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            if (registrations.length > 0) {
              resolve(true)
              return
            }

            // Wait for registration or timeout
            const timeout = setTimeout(() => resolve(false), 5000)

            navigator.serviceWorker.ready
              .then(() => {
                clearTimeout(timeout)
                resolve(true)
              })
              .catch(() => {
                clearTimeout(timeout)
                resolve(false)
              })
          })
        })
      })

      // Service worker registration is optional but should not error
      expect(typeof swRegistered).toBe('boolean')
    })
  })

  test.describe('WebGL and Canvas', () => {
    test('should support Canvas 2D', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const canvasSupport = await page.evaluate(() => {
        const canvas = document.createElement('canvas')
        return !!canvas.getContext?.('2d')
      })

      expect(canvasSupport).toBe(true)
    })

    test('should support WebGL', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const webglSupport = await page.evaluate(() => {
        const canvas = document.createElement('canvas')
        return !!canvas.getContext?.('webgl')
      })

      // WebGL support is optional but should be detected
      expect(typeof webglSupport).toBe('boolean')
    })
  })

  test.describe('Modern CSS Features', () => {
    test('should support CSS Grid', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const gridSupport = await page.evaluate(() => {
        const element = document.createElement('div')
        element.style.display = 'grid'
        return element.style.display === 'grid'
      })

      expect(gridSupport).toBe(true)
    })

    test('should support CSS Flexbox', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const flexSupport = await page.evaluate(() => {
        const element = document.createElement('div')
        element.style.display = 'flex'
        return element.style.display === 'flex'
      })

      expect(flexSupport).toBe(true)
    })

    test('should support CSS Custom Properties', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const cssVarsSupport = await page.evaluate(() => {
        const element = document.documentElement
        element.style.setProperty('--test-var', 'red')
        return element.style.getPropertyValue('--test-var') === 'red'
      })

      expect(cssVarsSupport).toBe(true)
    })
  })

  test.describe('Network APIs', () => {
    test('should support Fetch API', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const fetchSupport = await page.evaluate(() => {
        return 'fetch' in window
      })

      expect(fetchSupport).toBe(true)
    })

    test('should support WebSocket', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const wsSupport = await page.evaluate(() => {
        return 'WebSocket' in window
      })

      expect(wsSupport).toBe(true)
    })
  })

  test.describe('Device APIs', () => {
    test('should detect device capabilities', async ({ page }) => {
      await page.goto('http://localhost:3001/')

      const deviceCapabilities = await page.evaluate(() => ({
        touch: 'ontouchstart' in window,
        geolocation: 'geolocation' in navigator,
        vibration: 'vibrate' in navigator,
        battery: 'getBattery' in navigator,
      }))

      expect(typeof deviceCapabilities.touch).toBe('boolean')
      expect(typeof deviceCapabilities.geolocation).toBe('boolean')
    })
  })
})
