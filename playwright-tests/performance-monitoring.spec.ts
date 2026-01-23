import { test, expect } from '@playwright/test'
import { setupTestEnvironment, teardownTestEnvironment } from './test-utils'

test.describe('Performance Monitoring', () => {
  test.beforeAll(async () => {
    await setupTestEnvironment()
  })

  test.afterAll(async () => {
    await teardownTestEnvironment()
  })

  test('should track Core Web Vitals metrics', async ({ page }) => {
    // Mock web-vitals library to capture metrics
    await page.addInitScript(() => {
      window.webVitalsMetrics = []
      
      // Mock onCLS
      window.onCLS = (callback) => {
        const mockMetric = {
          name: 'CLS',
          value: 0.1,
          id: 'test-cls-id',
          delta: 0.1,
          entries: [],
        }
        window.webVitalsMetrics.push(mockMetric)
        callback(mockMetric)
      }

      // Mock onFCP
      window.onFCP = (callback) => {
        const mockMetric = {
          name: 'FCP',
          value: 1200,
          id: 'test-fcp-id',
          delta: 1200,
          entries: [],
        }
        window.webVitalsMetrics.push(mockMetric)
        callback(mockMetric)
      }

      // Mock onINP
      window.onINP = (callback) => {
        const mockMetric = {
          name: 'INP',
          value: 150,
          id: 'test-inp-id',
          delta: 150,
          entries: [],
        }
        window.webVitalsMetrics.push(mockMetric)
        callback(mockMetric)
      }

      // Mock onLCP
      window.onLCP = (callback) => {
        const mockMetric = {
          name: 'LCP',
          value: 2500,
          id: 'test-lcp-id',
          delta: 2500,
          entries: [],
        }
        window.webVitalsMetrics.push(mockMetric)
        callback(mockMetric)
      }

      // Mock onTTFB
      window.onTTFB = (callback) => {
        const mockMetric = {
          name: 'TTFB',
          value: 400,
          id: 'test-ttfb-id',
          delta: 400,
          entries: [],
        }
        window.webVitalsMetrics.push(mockMetric)
        callback(mockMetric)
      }
    })

    await page.goto('/performance')

    // Wait for performance monitoring to initialize
    await page.waitForTimeout(1000)

    // Check that web-vitals metrics were captured
    const metrics = await page.evaluate(() => window.webVitalsMetrics)
    expect(metrics).toHaveLength(5)
    
    const metricNames = metrics.map(m => m.name)
    expect(metricNames).toContain('CLS')
    expect(metricNames).toContain('FCP')
    expect(metricNames).toContain('INP')
    expect(metricNames).toContain('LCP')
    expect(metricNames).toContain('TTFB')
  })

  test('should send analytics data to custom endpoint', async ({ page }) => {
    const analyticsRequests: any[] = []

    // Intercept analytics requests
    page.on('request', (request) => {
      if (request.url().includes('/api/analytics')) {
        analyticsRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        })
      }
    })

    await page.goto('/performance')

    // Wait for analytics to be sent
    await page.waitForTimeout(2000)

    // Check that analytics requests were made
    expect(analyticsRequests.length).toBeGreaterThan(0)

    // Verify analytics data structure
    const analyticsRequest = analyticsRequests[0]
    expect(analyticsRequest.method).toBe('POST')
    expect(analyticsRequest.url).toContain('/api/analytics')

    const analyticsData = JSON.parse(analyticsRequest.postData)
    expect(analyticsData).toHaveProperty('event')
    expect(analyticsData).toHaveProperty('data')
    expect(analyticsData).toHaveProperty('timestamp')
    expect(analyticsData).toHaveProperty('url')
    expect(analyticsData).toHaveProperty('userAgent')
  })

  test('should track navigation timing', async ({ page }) => {
    await page.goto('/')

    // Navigate to different pages
    await page.click('a[href="/about"]')
    await page.waitForURL('/about')

    await page.click('a[href="/contact"]')
    await page.waitForURL('/contact')

    // Check navigation timing in performance API
    const navigationTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation')
      return entries[0]
    })

    expect(navigationTiming).toBeDefined()
    expect(navigationTiming).toHaveProperty('loadEventEnd')
    expect(navigationTiming).toHaveProperty('domContentLoadedEventEnd')
  })

  test('should track resource loading performance', async ({ page }) => {
    await page.goto('/')

    // Wait for resources to load
    await page.waitForLoadState('networkidle')

    // Check resource timing
    const resourceTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource')
      return entries.filter(entry => entry.name.includes('.js') || entry.name.includes('.css'))
    })

    expect(resourceTiming.length).toBeGreaterThan(0)

    // Check that resources loaded successfully
    resourceTiming.forEach(resource => {
      expect(resource.duration).toBeGreaterThan(0)
      expect(resource.transferSize).toBeGreaterThan(0)
    })
  })

  test('should track memory usage', async ({ page }) => {
    await page.goto('/')

    // Check memory usage if available
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        }
      }
      return null
    })

    if (memoryInfo) {
      expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0)
      expect(memoryInfo.totalJSHeapSize).toBeGreaterThan(0)
      expect(memoryInfo.jsHeapSizeLimit).toBeGreaterThan(0)
    }
  })

  test('should handle performance monitoring errors gracefully', async ({ page }) => {
    // Mock web-vitals to throw an error
    await page.addInitScript(() => {
      window.onCLS = () => {
        throw new Error('Test error')
      }
    })

    await page.goto('/performance')

    // Page should still load and function normally
    await expect(page.locator('body')).toBeVisible()

    // Check that error was handled gracefully (no uncaught exceptions)
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })

  test('should display performance dashboard', async ({ page }) => {
    await page.goto('/performance')

    // Check that performance dashboard components are visible
    await expect(page.locator('[data-testid="performance-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="core-web-vitals"]')).toBeVisible()
    await expect(page.locator('[data-testid="bundle-analysis"]')).toBeVisible()
    await expect(page.locator('[data-testid="performance-tips"]')).toBeVisible()
  })

  test('should track route changes', async ({ page }) => {
    const routeChanges: string[] = []

    // Track route changes
    await page.addInitScript(() => {
      window.routeChanges = []
      
      // Override history.pushState to track changes
      const originalPushState = history.pushState
      history.pushState = function(...args) {
        window.routeChanges.push(window.location.pathname)
        return originalPushState.apply(history, args)
      }
    })

    await page.goto('/')

    // Navigate to different routes
    await page.click('a[href="/about"]')
    await page.waitForURL('/about')

    await page.click('a[href="/contact"]')
    await page.waitForURL('/contact')

    // Check route changes were tracked
    const changes = await page.evaluate(() => window.routeChanges)
    expect(changes).toContain('/about')
    expect(changes).toContain('/contact')
  })

  test('should measure interaction responsiveness', async ({ page }) => {
    await page.goto('/')

    // Measure button click responsiveness
    const startTime = Date.now()
    
    await page.click('button')
    
    const endTime = Date.now()
    const interactionTime = endTime - startTime

    // Interaction should be reasonably fast
    expect(interactionTime).toBeLessThan(1000)
  })

  test('should track bundle loading performance', async ({ page }) => {
    await page.goto('/')

    // Wait for all scripts to load
    await page.waitForLoadState('networkidle')

    // Check script loading performance
    const scriptTiming = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script')
      const timingData: any[] = []

      scripts.forEach(script => {
        if (script.src) {
          const entries = performance.getEntriesByName(script.src)
          if (entries.length > 0) {
            timingData.push({
              src: script.src,
              duration: entries[0].duration,
              transferSize: entries[0].transferSize,
            })
          }
        }
      })

      return timingData
    })

    expect(scriptTiming.length).toBeGreaterThan(0)

    // Check that scripts loaded with reasonable performance
    scriptTiming.forEach(script => {
      expect(script.duration).toBeGreaterThan(0)
      expect(script.transferSize).toBeGreaterThan(0)
    })
  })

  test('should handle Google Analytics integration', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/performance')

    // Wait for GA initialization
    await page.waitForTimeout(1000)

    // Check that GA events were tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    
    // Should have page view events
    const pageViewEvents = gaEvents.filter(e => e.eventName === 'page_view')
    expect(pageViewEvents.length).toBeGreaterThan(0)
  })
})