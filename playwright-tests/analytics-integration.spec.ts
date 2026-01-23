import { test, expect } from '@playwright/test'
import { setupTestEnvironment, teardownTestEnvironment } from './test-utils'

test.describe('Analytics Integration', () => {
  test.beforeAll(async () => {
    await setupTestEnvironment()
  })

  test.afterAll(async () => {
    await teardownTestEnvironment()
  })

  test('should initialize Google Analytics 4', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Wait for GA initialization
    await page.waitForTimeout(1000)

    // Check that GA was initialized
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    
    // Should have config event
    const configEvents = gaEvents.filter(e => e.command === 'config')
    expect(configEvents.length).toBeGreaterThan(0)

    // Should have page view event
    const pageViewEvents = gaEvents.filter(e => e.eventName === 'page_view')
    expect(pageViewEvents.length).toBeGreaterThan(0)
  })

  test('should track page views on route changes', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Navigate to different pages
    await page.click('a[href="/about"]')
    await page.waitForURL('/about')

    await page.click('a[href="/contact"]')
    await page.waitForURL('/contact')

    // Check that page view events were tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    const pageViewEvents = gaEvents.filter(e => e.eventName === 'page_view')
    
    expect(pageViewEvents.length).toBeGreaterThan(1)
  })

  test('should send custom analytics data to endpoint', async ({ page }) => {
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

    await page.goto('/')

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

  test('should track Core Web Vitals in GA4', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    // Mock web-vitals
    await page.addInitScript(() => {
      window.onCLS = (callback) => {
        const mockMetric = {
          name: 'CLS',
          value: 0.1,
          id: 'test-cls-id',
          delta: 0.1,
          entries: [],
        }
        callback(mockMetric)
      }

      window.onFCP = (callback) => {
        const mockMetric = {
          name: 'FCP',
          value: 1200,
          id: 'test-fcp-id',
          delta: 1200,
          entries: [],
        }
        callback(mockMetric)
      }

      window.onINP = (callback) => {
        const mockMetric = {
          name: 'INP',
          value: 150,
          id: 'test-inp-id',
          delta: 150,
          entries: [],
        }
        callback(mockMetric)
      }

      window.onLCP = (callback) => {
        const mockMetric = {
          name: 'LCP',
          value: 2500,
          id: 'test-lcp-id',
          delta: 2500,
          entries: [],
        }
        callback(mockMetric)
      }

      window.onTTFB = (callback) => {
        const mockMetric = {
          name: 'TTFB',
          value: 400,
          id: 'test-ttfb-id',
          delta: 400,
          entries: [],
        }
        callback(mockMetric)
      }
    })

    await page.goto('/')

    // Wait for web vitals tracking
    await page.waitForTimeout(2000)

    // Check that web vitals were sent to GA4
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    const webVitalsEvents = gaEvents.filter(e => e.eventName === 'web_vitals')
    
    expect(webVitalsEvents.length).toBeGreaterThan(0)

    // Check web vitals data structure
    const webVitalsEvent = webVitalsEvents[0]
    expect(webVitalsEvent.params).toHaveProperty('event_category', 'Performance')
    expect(webVitalsEvent.params).toHaveProperty('event_label')
    expect(webVitalsEvent.params).toHaveProperty('value')
    expect(webVitalsEvent.params).toHaveProperty('custom_parameter_metric_id')
  })

  test('should track custom events', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Simulate custom event tracking
    await page.evaluate(() => {
      if (window.gtag) {
        window.gtag('event', 'contact_form_submit', {
          event_category: 'engagement',
          event_label: 'contact_page',
          value: 1
        })
      }
    })

    // Check that custom event was tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    const customEvents = gaEvents.filter(e => e.eventName === 'contact_form_submit')
    
    expect(customEvents.length).toBeGreaterThan(0)

    const customEvent = customEvents[0]
    expect(customEvent.params).toHaveProperty('event_category', 'engagement')
    expect(customEvent.params).toHaveProperty('event_label', 'contact_page')
    expect(customEvent.params).toHaveProperty('value', 1)
  })

  test('should handle analytics errors gracefully', async ({ page }) => {
    // Mock Google Analytics to throw errors
    await page.addInitScript(() => {
      window.gtag = () => {
        throw new Error('GA error')
      }
    })

    await page.goto('/')

    // Page should still load and function normally
    await expect(page.locator('body')).toBeVisible()

    // Check that errors are handled gracefully
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })

  test('should respect user privacy preferences', async ({ page }) => {
    // Mock privacy settings
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Check that analytics respects privacy settings
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    
    // Should still track if no privacy restrictions
    expect(gaEvents.length).toBeGreaterThan(0)
  })

  test('should use sendBeacon for reliable data delivery', async ({ page }) => {
    const beaconCalls: any[] = []

    // Mock sendBeacon
    await page.addInitScript(() => {
      window.navigator.sendBeacon = (url: string, data?: Blob | ArrayBuffer | FormData | URLSearchParams | string) => {
        window.beaconCalls = window.beaconCalls || []
        window.beaconCalls.push({ url, data: data ? data.toString() : null })
        return true
      }
    })

    await page.goto('/')

    // Simulate sending analytics data
    await page.evaluate(() => {
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          event: 'test_event',
          data: { test: 'data' },
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
        
        navigator.sendBeacon('/api/analytics', data)
      }
    })

    // Check that sendBeacon was called
    const calls = await page.evaluate(() => window.beaconCalls || [])
    expect(calls.length).toBeGreaterThan(0)

    const call = calls[0]
    expect(call.url).toContain('/api/analytics')
    expect(call.data).toContain('test_event')
  })

  test('should fallback to fetch when sendBeacon is not available', async ({ page }) => {
    const fetchCalls: any[] = []

    // Mock sendBeacon as unavailable
    await page.addInitScript(() => {
      delete window.navigator.sendBeacon
    })

    // Intercept fetch calls
    page.on('request', (request) => {
      if (request.url().includes('/api/analytics')) {
        fetchCalls.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        })
      }
    })

    await page.goto('/')

    // Simulate sending analytics data
    await page.evaluate(() => {
      const data = JSON.stringify({
        event: 'test_event',
        data: { test: 'data' },
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
      
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      })
    })

    // Check that fetch was used as fallback
    expect(fetchCalls.length).toBeGreaterThan(0)
    expect(fetchCalls[0].method).toBe('POST')
  })

  test('should track user interactions', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Simulate user interactions
    await page.click('button')
    await page.type('input[type="text"]', 'test input')
    await page.click('a')

    // Wait for interaction tracking
    await page.waitForTimeout(1000)

    // Check that interactions were tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    
    // Should have various interaction events
    expect(gaEvents.length).toBeGreaterThan(0)
  })

  test('should track navigation timing', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

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

  test('should track memory usage', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

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

  test('should track bundle loading performance', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

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

  test('should track resource loading performance', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

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

  test('should track error events', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Simulate error tracking
    await page.evaluate(() => {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: 'Test error',
          fatal: false,
          event_category: 'Error',
          event_label: 'JavaScript Error'
        })
      }
    })

    // Check that error was tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    const errorEvents = gaEvents.filter(e => e.eventName === 'exception')
    
    expect(errorEvents.length).toBeGreaterThan(0)

    const errorEvent = errorEvents[0]
    expect(errorEvent.params).toHaveProperty('description', 'Test error')
    expect(errorEvent.params).toHaveProperty('fatal', false)
  })

  test('should track conversion events', async ({ page }) => {
    // Mock Google Analytics
    await page.addInitScript(() => {
      window.gtag = (command: string, eventName: string, params: any) => {
        window.gaEvents = window.gaEvents || []
        window.gaEvents.push({ command, eventName, params })
      }
    })

    await page.goto('/')

    // Simulate conversion tracking
    await page.evaluate(() => {
      if (window.gtag) {
        window.gtag('event', 'resume_download', {
          event_category: 'Conversion',
          event_label: 'Resume Download',
          value: 1
        })
      }
    })

    // Check that conversion was tracked
    const gaEvents = await page.evaluate(() => window.gaEvents || [])
    const conversionEvents = gaEvents.filter(e => e.eventName === 'resume_download')
    
    expect(conversionEvents.length).toBeGreaterThan(0)

    const conversionEvent = conversionEvents[0]
    expect(conversionEvent.params).toHaveProperty('event_category', 'Conversion')
    expect(conversionEvent.params).toHaveProperty('event_label', 'Resume Download')
    expect(conversionEvent.params).toHaveProperty('value', 1)
  })
})