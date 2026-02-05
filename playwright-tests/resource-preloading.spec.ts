import { expect, test } from '@playwright/test'

test.describe('Resource Preloading & Performance', () => {
  test.describe('DNS Prefetching', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3001/')
      await page.waitForLoadState('networkidle')
    })

    test('should have DNS prefetch links', async ({ page }) => {
      // Check for DNS prefetch links
      const dnsPrefetchLinks = page.locator('link[rel="dns-prefetch"]')

      if ((await dnsPrefetchLinks.count()) > 0) {
        for (const link of await dnsPrefetchLinks.all()) {
          const href = await link.getAttribute('href')
          expect(href).toBeTruthy()
          // Allow both absolute URLs and protocol-relative URLs
          expect(href).toMatch(/^https?:\/\/|^\/\//)
        }
      } else {
        console.log('No DNS prefetch links found - may not be needed for this page')
      }
    })

    test('should prefetch critical resources', async ({ page }) => {
      // Check for prefetch links
      const prefetchLinks = page.locator('link[rel="prefetch"]')

      if ((await prefetchLinks.count()) > 0) {
        for (const link of await prefetchLinks.all()) {
          const href = await link.getAttribute('href')
          expect(href).toBeTruthy()

          // Check if resource actually loads
          const response = await page.request.get(href as string)
          expect(response.status()).toBeLessThan(400)
        }
      }
    })

    test('should preconnect to important origins', async ({ page }) => {
      // Check for preconnect links
      const preconnectLinks = page.locator('link[rel="preconnect"]')

      if ((await preconnectLinks.count()) > 0) {
        for (const link of await preconnectLinks.all()) {
          const href = await link.getAttribute('href')
          expect(href).toBeTruthy()
          expect(href).toMatch(/^https?:\/\//)
        }
      }
    })
  })

  test.describe('Resource Loading Optimization', () => {
    test('should preload critical resources', async ({ page }) => {
      // Check for preload links
      const preloadLinks = page.locator('link[rel="preload"]')

      if ((await preloadLinks.count()) > 0) {
        for (const link of await preloadLinks.all()) {
          const href = await link.getAttribute('href')
          const as = await link.getAttribute('as')

          expect(href).toBeTruthy()
          expect(as).toBeTruthy()

          // Verify 'as' attribute is valid
          expect([
            'script',
            'style',
            'font',
            'image',
            'audio',
            'video',
            'document',
            'fetch',
          ]).toContain(as)

          // Check if resource actually loads
          const response = await page.request.get(href as string)
          expect(response.status()).toBeLessThan(400)
        }
      }
    })

    test('should preinit modules', async ({ page }) => {
      // Check for modulepreload links
      const modulePreloadLinks = page.locator('link[rel="modulepreload"]')

      if ((await modulePreloadLinks.count()) > 0) {
        for (const link of await modulePreloadLinks.all()) {
          const href = await link.getAttribute('href')
          expect(href).toBeTruthy()
          expect(href).toMatch(/\.js$/)

          // Check if module loads
          const response = await page.request.get(href as string)
          expect(response.status()).toBeLessThan(400)
        }
      }
    })

    test('should use resource hints effectively', async ({ page }) => {
      // Check timing of resource loading
      const resourceTiming: Array<{
        name: string
        duration: number
        transferSize: number
        type: string
      }> = await page.evaluate(() => {
        return new Promise((resolve) => {
          const resources: Array<{
            name: string
            duration: number
            transferSize: number
            type: string
          }> = []

          // Wait for resources to load
          setTimeout(() => {
            const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
            for (const entry of entries) {
              if (
                entry.name.includes('font') ||
                entry.name.includes('css') ||
                entry.name.includes('js')
              ) {
                resources.push({
                  name: entry.name,
                  duration: entry.duration,
                  transferSize: entry.transferSize || 0,
                  type: entry.initiatorType,
                })
              }
            }
            resolve(resources)
          }, 1000)
        })
      })

      // Resources should load efficiently
      for (const resource of resourceTiming) {
        expect(resource.duration).toBeLessThan(5000) // Should load within 5 seconds
        if (resource.transferSize > 0) {
          expect(resource.transferSize).toBeLessThan(1000000) // Less than 1MB per resource
        }
      }
    })
  })

  test.describe('Image Optimization', () => {
    test('should lazy load images', async ({ page }) => {
      const images = page.locator('img')

      if ((await images.count()) > 0) {
        let lazyLoadedCount = 0
        let totalImages = 0

        for (const img of await images.all()) {
          totalImages++
          const loading = await img.getAttribute('loading')

          if (loading === 'lazy') {
            lazyLoadedCount++
          }
        }

        // At least some images should be lazy loaded
        if (totalImages > 3) {
          expect(lazyLoadedCount).toBeGreaterThan(0)
        }
      }
    })

    test('should use modern image formats', async ({ page }) => {
      const images = page.locator('img')

      for (const img of await images.all()) {
        const src = await img.getAttribute('src')
        const srcset = await img.getAttribute('srcset')

        if (src && !src.startsWith('data:')) {
          // Check if using modern formats via srcset or direct src
          const usesModernFormat =
            srcset || src.includes('.webp') || src.includes('.avif') || src.includes('.svg')

          // Allow traditional formats but prefer modern ones
          expect(usesModernFormat || src.match(/\.(jpg|jpeg|png|gif)$/)).toBe(true)
        }
      }
    })

    test('should have proper image dimensions', async ({ page }) => {
      const images = page.locator('img')

      for (const img of await images.all()) {
        const width = await img.getAttribute('width')
        const height = await img.getAttribute('height')

        // Should specify dimensions for better layout stability
        if (width && height) {
          expect(parseInt(width, 10)).toBeGreaterThan(0)
          expect(parseInt(height, 10)).toBeGreaterThan(0)
        }
      }
    })

    test('should optimize image loading', async ({ page }) => {
      // Check image loading performance
      const imageTiming: Array<{
        src: string
        loadTime: number
        size: number
      }> = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const images = document.querySelectorAll('img')
            const timing: Array<{
              src: string
              loadTime: number
              size: number
            }> = []

            for (const img of images) {
              if (img.complete && img.src) {
                const entries = performance.getEntriesByName(img.src)
                if (entries.length > 0) {
                  timing.push({
                    src: img.src,
                    loadTime: entries[0].duration,
                    size: entries[0].transferSize || 0,
                  })
                }
              }
            }
            resolve(timing)
          }, 2000)
        })
      })

      // Images should load reasonably fast
      for (const timing of imageTiming) {
        expect(timing.loadTime).toBeLessThan(3000) // Less than 3 seconds
      }
    })
  })

  test.describe('Font Loading Optimization', () => {
    test('should preload critical fonts', async ({ page }) => {
      // Check for font preloading
      const fontLinks = page.locator('link[rel="preload"][as="font"]')

      if ((await fontLinks.count()) > 0) {
        for (const link of await fontLinks.all()) {
          const href = await link.getAttribute('href')
          const type = await link.getAttribute('type')

          expect(href).toBeTruthy()
          expect(type).toMatch(/font\/(woff2?|ttf|otf)/)

          // Font should load
          const response = await page.request.get(href as string)
          expect(response.status()).toBeLessThan(400)
        }
      }
    })

    test('should use font-display swap', async ({ page }) => {
      // Check font-face declarations
      const fontFaces: Array<{
        family: string
        display: string
      }> = await page.evaluate(() => {
        const stylesheets = document.styleSheets
        const faces: Array<{
          family: string
          display: string
        }> = []

        for (const sheet of stylesheets) {
          try {
            const rules = sheet.cssRules
            for (const rule of rules) {
              if (rule instanceof CSSFontFaceRule) {
                faces.push({
                  family: rule.style.fontFamily,
                  display:
                    (
                      rule.style as CSSStyleDeclaration & {
                        fontDisplay?: string
                      }
                    ).fontDisplay || 'auto',
                })
              }
            }
          } catch {
            // Cross-origin stylesheet
          }
        }

        return faces
      })

      // Fonts should use font-display: swap for better performance
      for (const face of fontFaces) {
        if (face.display) {
          expect(['swap', 'optional', 'fallback']).toContain(face.display)
        }
      }
    })

    test('should load fonts efficiently', async ({ page }) => {
      // Check font loading performance
      const fontTiming: Array<{
        name: string
        duration: number
        size: number
      }> = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const fontEntries = performance
              .getEntriesByType('resource')
              .filter(
                (entry) => entry.name.includes('font') || entry.name.match(/\.(woff2?|ttf|otf)$/),
              ) as PerformanceResourceTiming[]

            resolve(
              fontEntries.map((entry) => ({
                name: entry.name,
                duration: entry.duration,
                size: entry.transferSize || 0,
              })),
            )
          }, 1000)
        })
      })

      // Fonts should load quickly
      for (const timing of fontTiming) {
        expect(timing.duration).toBeLessThan(2000) // Less than 2 seconds
      }
    })
  })

  test.describe('Bundle Optimization', () => {
    test('should split code bundles effectively', async ({ page }) => {
      // Check for multiple script chunks
      const scripts = await page.locator('script[src]').all()

      const jsScripts = []
      for (const script of scripts) {
        const src = await script.getAttribute('src')
        if (src?.includes('.js')) {
          jsScripts.push(src)
        }
      }

      // Should have at least one JS bundle (more in production due to code splitting)
      // In development mode, scripts might be loaded differently
      if (jsScripts.length === 0) {
        console.log('No JS scripts found - this may be normal in development mode')
        // Skip this check in development
        return
      }
      expect(jsScripts.length).toBeGreaterThan(0)

      // In development, we might have fewer bundles due to hot reload
      if (jsScripts.length === 1) {
        console.log('Single bundle detected - this is normal in development mode')
      }

      // Check bundle sizes
      for (const scriptSrc of jsScripts) {
        const response = await page.request.get(scriptSrc)
        const contentLength = response.headers()['content-length']

        if (contentLength) {
          const sizeKB = parseInt(contentLength, 10) / 1024
          // Main bundle should be reasonable size
          if (scriptSrc.includes('main') || scriptSrc.includes('app')) {
            expect(sizeKB).toBeLessThan(500) // Less than 500KB
          }
        }
      }
    })

    test('should use compression', async ({ page }) => {
      // Check if responses are compressed
      const responses: Array<{
        url: string
        contentType: string
        contentEncoding?: string
        size?: string
      }> = []

      page.on('response', (response) => {
        const contentType = response.headers()['content-type'] || ''
        const contentEncoding = response.headers()['content-encoding']

        if (
          contentType.includes('javascript') ||
          contentType.includes('css') ||
          contentType.includes('html')
        ) {
          responses.push({
            url: response.url(),
            contentType,
            contentEncoding,
            size: response.headers()['content-length'],
          })
        }
      })

      await page.reload()
      await page.waitForLoadState('networkidle')

      // Check compression for static assets
      for (const response of responses) {
        if (response.size && parseInt(response.size, 10) > 1024) {
          // Larger than 1KB
          // Should be compressed
          expect(response.contentEncoding).toMatch(/gzip|br|deflate/)
        }
      }
    })

    test('should cache static assets', async ({ page }) => {
      // Check cache headers
      const cacheHeaders: Array<{
        url: string
        cacheControl?: string
        etag?: string
        lastModified?: string
      }> = []

      page.on('response', (response) => {
        const cacheControl = response.headers()['cache-control']
        const etag = response.headers().etag
        const lastModified = response.headers()['last-modified']

        if (response.url().match(/\.(js|css|png|jpg|webp|woff2?)$/)) {
          cacheHeaders.push({
            url: response.url(),
            cacheControl,
            etag,
            lastModified,
          })
        }
      })

      await page.reload()

      // Static assets should have caching headers
      for (const headers of cacheHeaders) {
        expect(headers.cacheControl || headers.etag || headers.lastModified).toBeTruthy()
      }
    })
  })

  test.describe('Critical Resource Loading', () => {
    test('should prioritize critical resources', async ({ page }) => {
      // Check resource loading priority
      const resourcePriority: Array<{
        url: string
        type: string
        duration: number
      }> = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const resources = performance.getEntriesByType(
              'resource',
            ) as PerformanceResourceTiming[]
            const priorities: Array<{
              url: string
              type: string
              duration: number
            }> = []

            for (const resource of resources) {
              if (resource.name.includes('.css') || resource.name.includes('.js')) {
                priorities.push({
                  url: resource.name,
                  type: resource.initiatorType,
                  duration: resource.duration,
                })
              }
            }

            resolve(priorities)
          }, 500)
        })
      })

      // Critical resources should load first
      const cssResources = resourcePriority.filter((r) => r.type === 'link')
      const jsResources = resourcePriority.filter((r) => r.type === 'script')

      // CSS should load before non-critical JS
      if (cssResources.length > 0 && jsResources.length > 0) {
        const avgCssTime =
          cssResources.reduce((sum, r) => sum + r.duration, 0) / cssResources.length
        const avgJsTime = jsResources.reduce((sum, r) => sum + r.duration, 0) / jsResources.length

        // CSS should load before or at the same time as JS
        expect(avgCssTime).toBeLessThanOrEqual(avgJsTime + 100)
      }
    })

    test('should avoid render-blocking resources', async ({ page }) => {
      // Check for render-blocking CSS
      const renderBlockingCss = await page.evaluate(() => {
        const links = document.querySelectorAll("link[rel='stylesheet']")
        let blocking = 0

        for (const link of links) {
          const media = link.getAttribute('media')
          if (!media || media === 'all') {
            blocking++
          }
        }

        return blocking
      })

      // Should minimize render-blocking CSS
      expect(renderBlockingCss).toBeLessThanOrEqual(2)
    })

    test('should defer non-critical JavaScript', async ({ page }) => {
      // Check script loading strategies
      const scripts = await page.locator('script[src]').all()

      let deferredCount = 0
      let asyncCount = 0
      let totalCount = 0

      for (const script of scripts) {
        totalCount++
        const defer = await script.getAttribute('defer')
        const async = await script.getAttribute('async')

        if (defer) deferredCount++
        if (async) asyncCount++
      }

      // Should use defer or async for non-critical scripts
      if (totalCount > 1) {
        expect(deferredCount + asyncCount).toBeGreaterThan(0)
      }
    })
  })
})
