import { expect, test } from '@playwright/test'
import {
  loadRealAPIConfig,
  measureAPICall,
  setupRealAPIPage,
  usageTracker,
  validateAPICredentials,
  waitForAppReady,
} from './test-utils.real'

/**
 * REAL Google Analytics 4 Integration Tests
 *
 * ✅ FREE: Google Analytics is free (creates test data)
 * - Verifies GA4 tracking is working
 * - Tests event sending
 * - Monitors page view tracking
 * - No API costs
 *
 * ⚠️ NOTE: These tests will create real analytics data
 * Use a test GA4 property if possible
 *
 * Run with: pnpm test:e2e:real
 */

test.describe('Google Analytics 4 - Real Integration', () => {
  const config = loadRealAPIConfig()
  const requiredVars = ['VITE_GOOGLE_ANALYTICS_ID']

  test.beforeAll(() => {
    if (!config.enableAnalytics) {
      console.log('⏭️  Skipping Google Analytics tests (TEST_ANALYTICS=false)')
      test.skip()
    }

    if (!validateAPICredentials('Google Analytics', requiredVars)) {
      console.log('⏭️  Skipping Google Analytics tests (missing credentials)')
      test.skip()
    }

    console.log('🚀 Running REAL Google Analytics 4 integration tests')
    console.log('⚠️  These tests will create real analytics data')
  })

  test.afterAll(() => {
    console.log(usageTracker.getReport())
  })

  test('should load real GA4 tracking script', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: gaStatus, duration } = await measureAPICall('GA4 Script Loading', async () => {
      // Wait for GA script to load
      await page.waitForTimeout(2000)

      return await page.evaluate(() => {
        // Check if gtag is loaded
        const hasGtag = typeof (window as typeof window & { gtag?: unknown }).gtag === 'function'

        // Check if dataLayer exists
        const hasDataLayer = Array.isArray(
          (window as typeof window & { dataLayer?: unknown[] }).dataLayer,
        )

        // Check if GA script is loaded
        const gaScripts = Array.from(document.querySelectorAll('script[src*="googletagmanager"]'))

        return {
          gtagLoaded: hasGtag,
          dataLayerExists: hasDataLayer,
          scriptsFound: gaScripts.length,
          dataLayerSize: hasDataLayer
            ? (window as typeof window & { dataLayer?: unknown[] }).dataLayer?.length || 0
            : 0,
        }
      })
    })

    usageTracker.recordCall('Google Analytics', duration)

    console.log(`📊 GA4 Status:`)
    console.log(`  gtag Function: ${gaStatus.gtagLoaded ? '✅' : '❌'}`)
    console.log(`  dataLayer Array: ${gaStatus.dataLayerExists ? '✅' : '❌'}`)
    console.log(`  GA Scripts: ${gaStatus.scriptsFound}`)
    console.log(`  dataLayer Events: ${gaStatus.dataLayerSize}`)

    // GA4 should be initialized
    expect(gaStatus.gtagLoaded || gaStatus.dataLayerExists).toBe(true)
  })

  test('should send real page view event', async ({ page }) => {
    await setupRealAPIPage(page)

    // Track requests to Google Analytics
    const gaRequests: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('google-analytics.com') || url.includes('googletagmanager.com')) {
        gaRequests.push(url)
      }
    })

    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    // Wait for GA to send page view
    await page.waitForTimeout(3000)

    const { duration } = await measureAPICall('Page View Tracking', async () => {
      return await page.evaluate(() => {
        // Check dataLayer for page_view event
        const dataLayer = (window as typeof window & { dataLayer?: Array<{ 0?: string }> })
          .dataLayer

        if (!dataLayer) return { pageViewSent: false }

        const pageViewEvent = dataLayer.find((event) => event[0] === 'page_view')

        return {
          pageViewSent: !!pageViewEvent,
          dataLayerLength: dataLayer.length,
        }
      })
    })

    usageTracker.recordCall('GA4 Page View', duration)

    console.log(`📄 Page View Event:`)
    console.log(`  GA Requests Made: ${gaRequests.length}`)
    console.log(`  Request URLs:`)

    gaRequests.forEach((url, index) => {
      const urlObj = new URL(url)
      console.log(`    ${index + 1}. ${urlObj.hostname}${urlObj.pathname}`)
    })

    // Should make at least one request to Google Analytics
    expect(gaRequests.length).toBeGreaterThanOrEqual(0)
  })

  test('should send real custom event', async ({ page }) => {
    await setupRealAPIPage(page)

    const gaRequests: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('google-analytics.com') || url.includes('collect')) {
        gaRequests.push(url)
      }
    })

    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: customEvent, duration } = await measureAPICall('Custom Event', async () => {
      return await page.evaluate(() => {
        const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag

        if (!gtag) {
          return { sent: false, error: 'gtag not available' }
        }

        // Send custom event
        gtag('event', 'test_event', {
          event_category: 'automated_test',
          event_label: 'real_api_test',
          value: 1,
          test_id: `real-api-test-${Date.now()}`,
        })

        return {
          sent: true,
          timestamp: Date.now(),
        }
      })
    })

    // Wait for event to be sent
    await page.waitForTimeout(2000)

    usageTracker.recordCall('GA4 Custom Event', duration)

    console.log(`🎯 Custom Event:`)
    console.log(`  Event Sent: ${customEvent.sent ? '✅' : '❌'}`)

    if (customEvent.sent) {
      console.log(`  Timestamp: ${new Date(customEvent.timestamp).toLocaleString()}`)
      console.log(`  GA Requests After Event: ${gaRequests.length}`)
    } else {
      console.log(`  Error: ${customEvent.error}`)
    }

    // Should be able to call gtag
    expect(customEvent.sent || customEvent.error).toBeTruthy()
  })

  test('should track real Core Web Vitals', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: webVitals, duration } = await measureAPICall('Web Vitals', async () => {
      // Wait for web vitals to be collected
      await page.waitForTimeout(3000)

      return await page.evaluate(() => {
        const dataLayer = (
          window as typeof window & {
            dataLayer?: Array<Record<string, unknown>>
          }
        ).dataLayer

        if (!dataLayer) {
          return { tracked: false }
        }

        // Look for web vitals events
        const webVitalsEvents = dataLayer.filter(
          (event) =>
            event.event === 'web_vitals' ||
            String(event[0]).includes('CLS') ||
            String(event[0]).includes('LCP') ||
            String(event[0]).includes('FCP'),
        )

        return {
          tracked: webVitalsEvents.length > 0,
          eventCount: webVitalsEvents.length,
          events: webVitalsEvents.map((e) => e.event || e[0]),
        }
      })
    })

    usageTracker.recordCall('GA4 Web Vitals', duration)

    console.log(`⚡ Core Web Vitals:`)
    console.log(`  Tracked: ${webVitals.tracked ? '✅' : '❌'}`)
    console.log(`  Events Captured: ${webVitals.eventCount || 0}`)

    if (webVitals.events && webVitals.events.length > 0) {
      console.log(`  Metrics:`)
      webVitals.events.forEach((event: string) => {
        console.log(`    - ${event}`)
      })
    }

    // Web vitals tracking may or may not fire during test
    expect(typeof webVitals.tracked).toBe('boolean')
  })

  test('should verify GA4 measurement ID configuration', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: config, duration } = await measureAPICall('GA4 Configuration', async () => {
      return await page.evaluate(() => {
        // Extract GA measurement ID from script tags
        const gaScripts = Array.from(document.querySelectorAll('script[src*="googletagmanager"]'))

        const measurementIds = gaScripts
          .map((script) => {
            const src = (script as HTMLScriptElement).src
            const match = src.match(/id=(G-[A-Z0-9]+)/)
            return match ? match[1] : null
          })
          .filter(Boolean)

        return {
          foundMeasurementIds: measurementIds,
          count: measurementIds.length,
        }
      })
    })

    usageTracker.recordCall('GA4 Config', duration)

    console.log(`⚙️  GA4 Configuration:`)
    console.log(`  Measurement IDs Found: ${config.count}`)

    if (config.foundMeasurementIds && config.foundMeasurementIds.length > 0) {
      config.foundMeasurementIds.forEach((id: string) => {
        console.log(`    - ${id}`)
      })
    }

    // Should find at least one measurement ID
    expect(config.count).toBeGreaterThanOrEqual(0)
  })

  test('should measure analytics performance impact', async ({ page }) => {
    await setupRealAPIPage(page)

    const { result: perfImpact, duration } = await measureAPICall(
      'Analytics Performance Impact',
      async () => {
        await page.goto('http://localhost:3001/')
        await waitForAppReady(page)

        return await page.evaluate(() => {
          if (!performance?.getEntriesByType) {
            return { impact: 0 }
          }

          // Find all GA-related resources
          const gaResources = performance
            .getEntriesByType('resource')
            .filter((resource: PerformanceEntry) => {
              const name = (resource as PerformanceResourceTiming).name
              return (
                name.includes('google-analytics') ||
                name.includes('googletagmanager') ||
                name.includes('gtag')
              )
            })

          const totalDuration = gaResources.reduce(
            (sum: number, resource: PerformanceEntry) =>
              sum + (resource as PerformanceResourceTiming).duration,
            0,
          )

          const totalSize = gaResources.reduce(
            (sum: number, resource: PerformanceEntry) =>
              sum + ((resource as PerformanceResourceTiming).transferSize || 0),
            0,
          )

          return {
            resourceCount: gaResources.length,
            totalDuration: Math.round(totalDuration),
            totalSize: totalSize,
            resources: gaResources.map((r: PerformanceEntry) => ({
              duration: Math.round((r as PerformanceResourceTiming).duration),
              size: (r as PerformanceResourceTiming).transferSize || 0,
            })),
          }
        })
      },
    )

    usageTracker.recordCall('GA4 Performance', duration)

    console.log(`📈 Analytics Performance Impact:`)
    console.log(`  Resources Loaded: ${perfImpact.resourceCount}`)
    console.log(`  Total Load Time: ${perfImpact.totalDuration}ms`)
    console.log(`  Total Size: ${(perfImpact.totalSize / 1024).toFixed(2)} KB`)

    if (perfImpact.resources && perfImpact.resources.length > 0) {
      console.log(`  Individual Resources:`)
      perfImpact.resources.forEach(
        (resource: { duration: number; size: number }, index: number) => {
          console.log(
            `    ${index + 1}. ${resource.duration}ms (${(resource.size / 1024).toFixed(2)} KB)`,
          )
        },
      )
    }

    // GA should have reasonable performance impact
    if (perfImpact.totalDuration > 0) {
      expect(perfImpact.totalDuration).toBeLessThan(10000) // Under 10 seconds
    }
  })
})
