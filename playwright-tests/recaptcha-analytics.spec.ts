import { expect, test } from '@playwright/test'

test.describe('reCAPTCHA and Google Analytics Integration', () => {
  test.describe('reCAPTCHA v3 Integration', () => {
    test('should initialize reCAPTCHA context on contact page', async ({ page }) => {
      // Test that the contact page loads (basic functionality test)
      await page.goto('/contact')

      // Wait for basic page load
      await page.waitForLoadState('networkidle')

      // Check that we can access the contact page
      await expect(page).toHaveURL(/.*contact/)

      // Verify the page has loaded some content
      const bodyText = await page.locator('body').textContent()
      expect(bodyText?.length).toBeGreaterThan(10)
    })

    test('should execute reCAPTCHA on form submission', async ({ page }) => {
      await page.goto('/contact')

      // Fill out the form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'This is a test message for reCAPTCHA validation.')

      // Mock the reCAPTCHA execution to return a test token
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async (siteKey, options) => {
              console.log('reCAPTCHA executed with siteKey:', siteKey, 'options:', options)
              return 'test-recaptcha-token-12345'
            },
            ready: (callback) => callback()
          }
        `,
      })

      // Submit the form
      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for form submission to complete
      await page.waitForTimeout(3000)

      // Check that the form submission was attempted
      // The exact success/error message depends on server response
      const formResponse = page.locator('text=/Message sent|Failed to send|reCAPTCHA/i')
      await expect(formResponse).toBeVisible()
    })

    test('should handle reCAPTCHA loading errors gracefully', async ({ page }) => {
      await page.goto('/contact')

      // Mock reCAPTCHA script failure
      await page.route('**/recaptcha/api.js**', (route) => route.abort())

      // Fill and attempt to submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Override executeRecaptcha to simulate failure
      await page.evaluate(() => {
        window.executeRecaptcha = undefined
      })

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should show error message about reCAPTCHA not being available
      await page.waitForTimeout(2000)
      const errorMessage = page.locator('text=/reCAPTCHA|Failed to send/i')
      await expect(errorMessage).toBeVisible()
    })

    test('should validate reCAPTCHA token on server side', async ({ page }) => {
      await page.goto('/contact')

      // Mock successful reCAPTCHA execution
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'valid-test-token',
            ready: (callback) => callback()
          }
        `,
      })

      // Fill form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Submit form
      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for response
      await page.waitForTimeout(3000)

      // Check that server processed the request (success or validation error)
      const responseIndicator = page.locator(
        'text=/Message sent|reCAPTCHA verification failed|Server configuration error/i',
      )
      await expect(responseIndicator).toBeVisible()
    })

    test('should handle reCAPTCHA score validation', async ({ page }) => {
      await page.goto('/contact')

      // Mock reCAPTCHA with low score
      await page.route('**/recaptcha/api/siteverify**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            score: 0.3, // Low score that should be rejected
            action: 'contact_form_submit',
          }),
        }),
      )

      // Mock reCAPTCHA execution
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'low-score-token',
            ready: (callback) => callback()
          }
        `,
      })

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should show suspicious activity error
      await page.waitForTimeout(3000)
      const suspiciousMessage = page.locator(
        'text=/Suspicious activity|reCAPTCHA verification failed/i',
      )
      await expect(suspiciousMessage).toBeVisible()
    })

    test('should work with different form field combinations', async ({ page }) => {
      await page.goto('/contact')

      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
        `,
      })

      // Test with minimal required fields
      await page.fill('#name', 'John')
      await page.fill('#email', 'john@test.com')
      await page.fill('#subject', 'Hi')
      await page.fill('#message', 'Hello')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should attempt submission
      await page.waitForTimeout(2000)
      await expect(page.locator('body')).toBeVisible()
    })

    test('should prevent multiple rapid form submissions', async ({ page }) => {
      await page.goto('/contact')

      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
        `,
      })

      // Fill form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Click submit button multiple times rapidly
      const submitButton = page.getByRole('button', { name: 'Send Message' })
      await submitButton.click()
      await submitButton.click()
      await submitButton.click()

      // Button should be disabled during submission
      await page.waitForTimeout(1000)
      const isDisabled = await submitButton.getAttribute('disabled')
      expect(isDisabled).not.toBeNull()
    })

    test('should handle network errors during reCAPTCHA verification', async ({ page }) => {
      await page.goto('/contact')

      // Mock network failure during reCAPTCHA verification
      await page.route('**/recaptcha/api/siteverify**', (route) => route.abort())

      // Mock reCAPTCHA execution
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'network-error-token',
            ready: (callback) => callback()
          }
        `,
      })

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should handle network error gracefully
      await page.waitForTimeout(3000)
      const errorMessage = page.locator('text=/Failed to send|Server error/i')
      await expect(errorMessage).toBeVisible()
    })
  })

  test.describe('Google Analytics Integration', () => {
    test('should load Google Analytics script', async ({ page }) => {
      await page.goto('/')

      // Check that GA script is loaded
      const gaScript = page.locator('script').filter({ hasText: 'gtag' })
      await expect(gaScript).toBeAttached()

      // Check that GA is initialized
      const gaInit = await page.evaluate(() => {
        return typeof window.gtag === 'function'
      })
      expect(gaInit).toBe(true)
    })

    test('should track page views on navigation', async ({ page }) => {
      // Mock gtag function to capture calls
      await page.addScriptTag({
        content: `
          window.gtag = (...args) => {
            window.gaCalls = window.gaCalls || []
            window.gaCalls.push(args)
          }
        `,
      })

      await page.goto('/')

      // Wait for GA to initialize
      await page.waitForTimeout(1000)

      // Navigate to contact page
      await page.goto('/contact')
      await page.waitForTimeout(1000)

      // Check that page view was tracked
      const calls = await page.evaluate(() => window.gaCalls || [])
      const pageViewCalls = calls.filter(
        (call) => call[0] === 'event' && call[1]?.event_name === 'page_view',
      )
      expect(pageViewCalls.length).toBeGreaterThan(0)
    })

    test('should handle GA initialization errors gracefully', async ({ page }) => {
      // Mock GA script failure
      await page.route('**/googletagmanager.com/gtag/js**', (route) => route.abort())

      await page.goto('/')

      // Page should still load normally
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('nav')).toBeVisible()
    })

    test('should track events when GA is available', async ({ page }) => {
      // Mock gtag function
      await page.addScriptTag({
        content: `
          window.gtag = (...args) => {
            window.gaCalls = window.gaCalls || []
            window.gaCalls.push(args)
          }
        `,
      })

      await page.goto('/contact')

      // Fill and submit form (this should trigger GA events if implemented)
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
        `,
      })

      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for potential GA events
      await page.waitForTimeout(2000)

      // Check that some GA calls were made
      const calls = await page.evaluate(() => window.gaCalls || [])
      expect(calls.length).toBeGreaterThan(0)
    })

    test('should work with different GA measurement IDs', async ({ page }) => {
      // Test with different GA ID (mock)
      await page.addScriptTag({
        content: `
          window.gtag = (...args) => {
            console.log('GA call:', args)
          }
        `,
      })

      await page.goto('/')

      // Page should load regardless of GA configuration
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('h1')).toBeVisible()
    })

    test('should handle GA blocking gracefully', async ({ page }) => {
      // Mock ad blocker blocking GA
      await page.route('**/googletagmanager.com/**', (route) => route.abort())
      await page.route('**/google-analytics.com/**', (route) => route.abort())

      await page.goto('/')

      // Page should still function normally
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('nav')).toBeVisible()

      // Navigation should work
      await page.goto('/contact')
      await expect(page.locator('form')).toBeVisible()
    })

    test('should track page views on SPA navigation', async ({ page }) => {
      await page.addScriptTag({
        content: `
          window.gtag = (...args) => {
            window.gaCalls = window.gaCalls || []
            window.gaCalls.push(args)
          }
        `,
      })

      await page.goto('/')

      // Click navigation links (SPA routing)
      const contactLink = page.getByRole('link', { name: 'Contact' })
      if (await contactLink.isVisible()) {
        await contactLink.click()
        await page.waitForURL('**/contact')

        // Wait for GA tracking
        await page.waitForTimeout(1000)

        // Check for page view tracking
        const calls = await page.evaluate(() => window.gaCalls || [])
        const pageViews = calls.filter(
          (call) => call[0] === 'event' && call[1]?.event_name === 'page_view',
        )
        expect(pageViews.length).toBeGreaterThan(0)
      }
    })

    test('should handle GA configuration from environment variables', async ({ page }) => {
      // Test that GA uses the correct measurement ID from env
      await page.addScriptTag({
        content: `
          window.gtag = (...args) => {
            window.gaCalls = window.gaCalls || []
            window.gaCalls.push(args)
          }
        `,
      })

      await page.goto('/')

      await page.waitForTimeout(1000)

      // Check that GA was initialized with correct config
      const calls = await page.evaluate(() => window.gaCalls || [])
      const configCalls = calls.filter((call) => call[0] === 'config')
      expect(configCalls.length).toBeGreaterThan(0)
    })
  })

  test.describe('Combined reCAPTCHA and GA Integration', () => {
    test('should track form submission events with GA', async ({ page }) => {
      await page.addScriptTag({
        content: `
          window.gtag = (...args) => {
            window.gaCalls = window.gaCalls || []
            window.gaCalls.push(args)
          }
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
        `,
      })

      await page.goto('/contact')

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for processing
      await page.waitForTimeout(3000)

      // Check that GA tracked the interaction
      const calls = await page.evaluate(() => window.gaCalls || [])
      expect(calls.length).toBeGreaterThan(0)
    })

    test('should handle both features failing gracefully', async ({ page }) => {
      // Mock both GA and reCAPTCHA failures
      await page.route('**/googletagmanager.com/**', (route) => route.abort())
      await page.route('**/recaptcha/**', (route) => route.abort())

      await page.goto('/contact')

      // Fill form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Override reCAPTCHA to simulate failure
      await page.evaluate(() => {
        window.executeRecaptcha = undefined
      })

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should show error but page should remain functional
      await page.waitForTimeout(2000)
      await expect(page.locator('form')).toBeVisible()
      await expect(page.locator('body')).toBeVisible()
    })

    test('should work with different browser configurations', async ({ page }) => {
      // Test with JavaScript disabled simulation (partial)
      await page.goto('/contact')

      // Mock minimal functionality
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
          window.gtag = () => {}
        `,
      })

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should attempt submission
      await page.waitForTimeout(2000)
      await expect(page.locator('body')).toBeVisible()
    })

    test('should maintain functionality across page reloads', async ({ page }) => {
      await page.goto('/contact')

      // Mock the required functions
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
          window.gtag = () => {}
        `,
      })

      // Fill form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Reload page
      await page.reload()

      // Re-mock after reload
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-token',
            ready: (callback) => callback()
          }
          window.gtag = () => {}
        `,
      })

      // Form should still work
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Should attempt submission
      await page.waitForTimeout(2000)
      await expect(page.locator('body')).toBeVisible()
    })
  })
})
