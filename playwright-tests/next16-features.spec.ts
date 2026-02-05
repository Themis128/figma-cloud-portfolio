import { expect, test } from '@playwright/test'

/**
 * Next.js 16 Features Test Suite
 * Tests for Next.js 16 specific features including App Router, server actions,
 * streaming, and caching.
 */

test.describe('Next.js 16 Features', () => {
  test('should render App Router pages with server components', async ({ page }) => {
    await page.goto('/')

    // Verify App Router page structure
    const appRouterElements = await page.$$('[data-next-app-router]')
    expect(appRouterElements.length).toBeGreaterThan(0)

    // Verify server components are rendered
    const serverComponents = await page.$$('[data-next-server-component]')
    expect(serverComponents.length).toBeGreaterThan(0)
  })

  test('should support server actions for form submissions', async ({ page }) => {
    await page.goto('/contact')

    // Fill out and submit a form using server actions
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="message"]', 'This is a test message')

    await Promise.all([page.waitForNavigation(), page.click('[data-testid="submit-button"]')])

    // Verify submission success
    const successMessage = await page.textContent('[data-testid="success-message"]')
    expect(successMessage).toContain('Thank you for your message')
  })

  test('should stream responses for dynamic content', async ({ page }) => {
    await page.goto('/blog')

    // Measure time to first contentful paint
    const firstContentfulPaint = await page.evaluate(async () => {
      const perfEntries = performance.getEntriesByType('paint')
      const fcp = perfEntries.find((entry) => entry.name === 'first-contentful-paint')
      return fcp?.startTime || 0
    })

    // Verify content is streamed (FCP should be under 2 seconds)
    expect(firstContentfulPaint).toBeLessThan(2000)

    // Verify dynamic content is loaded
    const dynamicElements = await page.$$('[data-dynamic-content]')
    expect(dynamicElements.length).toBeGreaterThan(0)
  })

  test('should cache static content properly', async ({ page }) => {
    await page.goto('/')

    // Check for cache-control headers
    const cacheControl = await page.evaluate(() => {
      return document.querySelector('[data-cache-control]')?.textContent
    })

    expect(cacheControl).toContain('public')
    expect(cacheControl).toContain('max-age')

    // Verify static assets are loaded from cache
    const staticAssets = await page.$$('[data-static-asset]')
    expect(staticAssets.length).toBeGreaterThan(0)
  })

  test('should handle nested routes in App Router', async ({ page }) => {
    await page.goto('/projects/1')

    // Verify nested route structure
    const nestedRouteElements = await page.$$('[data-nested-route]')
    expect(nestedRouteElements.length).toBeGreaterThan(0)

    // Verify navigation between nested routes
    await page.click('[data-testid="project-link-2"]')
    await page.waitForURL('/projects/2')

    expect(page.url()).toContain('/projects/2')
  })
})
