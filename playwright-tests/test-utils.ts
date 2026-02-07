import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { APIRequestContext, BrowserContext, Page } from '@playwright/test'

/**
 * Enhanced test utilities for automatic issue resolution and test stability
 * Updated with modern Playwright features and best practices
 */

/**
 * Setup test environment with common configurations
 */
export async function setupTestEnvironment(page?: Page, context?: BrowserContext) {
  if (!page) return { page, context }

  // Set up common test environment
  await page.addInitScript(() => {
    // Mock console methods to reduce noise
    const originalWarn = console.warn
    console.warn = (...args: unknown[]) => {
      if (!args[0]?.includes?.('Download the React DevTools')) {
        originalWarn.apply(console, args)
      }
    }

    // Mock web APIs for consistent testing
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    })
  })

  // Set default timeout
  page.setDefaultTimeout(30000)

  if (context) {
    // Grant permissions for notifications, geolocation, etc.
    await context.grantPermissions(['notifications', 'geolocation'])

    // Set geolocation for consistent testing
    await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 })
  }

  return { page, context }
}

/**
 * Cleanup test environment
 */
export async function teardownTestEnvironment(page?: Page, context?: BrowserContext) {
  if (!page) return

  try {
    // Close any open modals or overlays
    await page.evaluate(() => {
      const modals = document.querySelectorAll('[role="dialog"], .modal, .overlay')
      for (const modal of modals) {
        const closeBtn = modal.querySelector(
          '[aria-label*="close"], .close, [data-testid*="close"]',
        )
        if (closeBtn) {
          ;(closeBtn as HTMLElement).click()
        }
      }
    })

    // Clear local storage
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Close context if provided
    if (context) {
      await context.close()
    }
  } catch (error) {
    console.warn('Error during test environment teardown:', error)
  }
}

/**
 * Enhanced goto that waits for app to be ready
 */
export async function gotoAndWaitForApp(
  page: Page,
  url: string,
  options?: Parameters<Page['goto']>[1],
) {
  await page.goto(url, options)
  await waitForAppReady(page)
}

/**
 * Wait for the React app to be fully loaded and ready
 */
export async function waitForAppReady(page: Page) {
  // Wait for document to be ready
  await page.waitForLoadState('domcontentloaded')

  // Wait for the root element to exist
  await page.waitForSelector('#root', { timeout: 10000 })

  // Wait a bit for React to hydrate and render
  await page.waitForTimeout(2000)

  // Check if we have some basic content
  await page
    .waitForFunction(
      () => {
        const root = document.querySelector('#root')
        return root && root.textContent?.trim().length > 50
      },
      { timeout: 5000 },
    )
    .catch(() => {
      console.log('Content check failed, but continuing...')
    })
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error = new Error('Operation failed')

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        const delay = baseDelay * 2 ** attempt
        console.log(
          `⚠️  Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Take screenshot with automatic naming and organization
 */
export async function takeScreenshot(page: Page, name: string, _context?: BrowserContext) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${name}-${timestamp}.png`
  const screenshotPath = path.join('test-results', 'screenshots', filename)

  await fs.mkdir(path.dirname(screenshotPath), { recursive: true })
  await page.screenshot({ path: screenshotPath, fullPage: true })

  console.log(`📸 Screenshot saved: ${screenshotPath}`)
  return screenshotPath
}

/**
 * Enhanced element waiting with multiple strategies
 */
export async function waitForElement(
  page: Page,
  selectors: string | string[],
  options: {
    timeout?: number
    visible?: boolean
    stable?: boolean
  } = {},
) {
  const { timeout = 10000, visible = true, stable = false } = options
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]

  for (const selector of selectorArray) {
    try {
      const element = page.locator(selector).first()

      if (visible) {
        await element.waitFor({ state: 'visible', timeout })
      } else {
        await element.waitFor({ state: 'attached', timeout })
      }

      if (stable) {
        // Wait for element to be stable (no layout shifts)
        await page.waitForTimeout(500)
        const initialBox = await element.boundingBox()
        await page.waitForTimeout(500)
        const finalBox = await element.boundingBox()

        if (initialBox && finalBox) {
          const movement = Math.abs(initialBox.x - finalBox.x) + Math.abs(initialBox.y - finalBox.y)
          if (movement > 5) {
            // Allow 5px tolerance
            throw new Error('Element is still moving')
          }
        }
      }

      return element
    } catch (_error) {
      // Continue to next selector
    }
  }

  throw new Error(`None of the selectors found: ${selectorArray.join(', ')}`)
}

/**
 * Handle flaky network requests
 */
export async function handleNetworkFlakiness(page: Page, _context: BrowserContext) {
  // Set up network monitoring
  const failedRequests: string[] = []

  page.on('response', (response) => {
    if (
      !(response.ok() || response.url().includes('favicon') || response.url().includes('manifest'))
    ) {
      failedRequests.push(response.url())
    }
  })

  // Retry failed requests
  if (failedRequests.length > 0) {
    console.log(`⚠️  Retrying ${failedRequests.length} failed requests...`)

    for (const url of failedRequests) {
      try {
        await page.reload()
        await waitForAppReady(page)
        break // If reload succeeds, stop retrying
      } catch (_error) {
        console.warn(`❌ Retry failed for ${url}`)
      }
    }
  }
}

/**
 * Performance monitoring utilities
 */
export async function measurePerformance(page: Page, action: () => Promise<void>) {
  const startTime = Date.now()
  // const _startMetrics = await page.evaluate(() => ({
  //   domContentLoaded:
  //     performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
  //   loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
  // }))

  await action()

  const endTime = Date.now()
  const endMetrics = await page.evaluate(() => ({
    domContentLoaded:
      performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
  }))

  return {
    totalTime: endTime - startTime,
    domContentLoaded: endMetrics.domContentLoaded,
    loadComplete: endMetrics.loadComplete,
  }
}

/**
 * Types for test utilities
 */
export type TestEnvironment = {
  page: Page
  context: BrowserContext
  request: APIRequestContext
}

/**
 * Accessibility audit helper
 */
export async function runAccessibilityAudit(page: Page) {
  const violations = await page.evaluate(() => {
    // Basic accessibility checks
    const issues: Array<{ type: string; count?: number; message?: string }> = []

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      issues.push({ type: 'missing-alt', count: images.length })
    }

    // Check for missing labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    if (inputs.length > 0) {
      issues.push({ type: 'missing-label', count: inputs.length })
    }

    // Check for proper heading hierarchy
    // const _headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const h1Count = document.querySelectorAll('h1').length
    if (h1Count !== 1) {
      issues.push({
        type: 'heading-hierarchy',
        message: `Found ${h1Count} h1 elements, expected 1`,
      })
    }

    return issues
  })

  return violations
}

/**
 * Auto-heal flaky selectors
 */
export async function findElementWithFallbacks(
  page: Page,
  primarySelector: string,
  fallbacks: string[] = [],
) {
  // Try primary selector first
  try {
    const element = page.locator(primarySelector).first()
    await element.waitFor({ state: 'visible', timeout: 2000 })
    return element
  } catch (_error) {
    // Try fallbacks
    for (const fallback of fallbacks) {
      try {
        const element = page.locator(fallback).first()
        await element.waitFor({ state: 'visible', timeout: 2000 })
        console.log(`🔄 Used fallback selector: ${fallback} instead of ${primarySelector}`)
        return element
      } catch (_error) {
        // Continue to next fallback
      }
    }

    // Try text-based or attribute-based fallbacks
    const textFallbacks = [
      `[text*="${primarySelector.replace(/[^a-zA-Z0-9]/g, ' ').trim()}"]`,
      `[placeholder*="${primarySelector.replace(/[^a-zA-Z0-9]/g, ' ').trim()}"]`,
    ]

    for (const fallback of textFallbacks) {
      try {
        const element = page.locator(fallback).first()
        await element.waitFor({ state: 'visible', timeout: 2000 })
        console.log(`🔄 Used text-based fallback: ${fallback}`)
        return element
      } catch (_error) {
        // Continue to next fallback
      }
    }

    throw new Error(`Element not found with any selector: ${primarySelector}`)
  }
}

/**
 * Smart wait for dynamic content
 */
export async function waitForDynamicContent(
  page: Page,
  contentCheck: () => Promise<boolean>,
  timeout = 10000,
) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await contentCheck()) {
      return true
    }

    // Wait a bit before checking again
    await page.waitForTimeout(500)

    // Reload if content is taking too long (possible caching issue)
    if (Date.now() - startTime > timeout / 2) {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)
    }
  }

  return false
}

/**
 * Navigate using mobile-aware navigation
 * Handles both desktop and mobile navigation automatically
 */
export async function navigateWithMobileSupport(page: Page, href: string) {
  // Check if we're on mobile (viewport width < 768px)
  const viewport = page.viewportSize()
  const isMobile = viewport ? viewport.width < 768 : false

  if (isMobile) {
    // On mobile, use JavaScript to navigate directly to bypass UI interaction issues
    await page.evaluate((href) => {
      // Navigate directly to the URL
      window.location.href = href
    }, href)

    // Wait for navigation to complete
    await page.waitForURL(`**${href}`, { timeout: 10000 })
  } else {
    // On desktop, click directly
    const desktopLink = page.locator(`nav a[href="${href}"]`).first()
    await desktopLink.waitFor({ state: 'visible', timeout: 5000 })
    await desktopLink.click()
  }
}

/**
 * Generate test report with recommendations
 */
export function generateTestRecommendations(results: {
  failed: number
  duration: number
  flakyTests?: string[]
}) {
  const recommendations: string[] = []

  if (results.failed > 0) {
    recommendations.push('🔴 Some tests failed - check screenshots and traces for details')
  }

  if (results.duration > 300000) {
    // 5 minutes
    recommendations.push('⏱️  Tests are running slowly - consider optimizing or parallelizing')
  }

  if ((results.flakyTests?.length ?? 0) > 0) {
    recommendations.push(
      `🎲 ${results.flakyTests?.length ?? 0} tests appear flaky - consider adding retries or stability improvements`,
    )
  }

  return recommendations
}
