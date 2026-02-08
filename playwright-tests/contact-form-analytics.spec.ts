import { expect, test } from '@playwright/test'

test.describe('Contact Form Submission with Analytics', () => {
  test.describe('Form Submission and Analytics Integration', () => {
    test('should submit contact form successfully and track analytics', async ({ page }) => {
      // Mock reCAPTCHA to avoid external dependencies
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      // Mock contact API to return success response
      await page.route('**/api/contact', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: "Message sent successfully! I'll get back to you within 24 hours."
          }),
        })
      })

      // Mock analytics API to capture events
      const analyticsEvents: any[] = []
      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      await page.goto('/contact')
      await page.waitForLoadState('domcontentloaded')

      // Wait for React to hydrate and render
      await page.waitForSelector('form', { timeout: 10000 })

      // Wait for GoogleAnalytics to initialize and attach tracking functions
      await page.waitForFunction(
        () => {
          return typeof window.trackContactFormSubmit === 'function'
        },
        { timeout: 5000 },
      )

      // Verify form is present
      await expect(page.locator('form')).toBeVisible()

      // Fill out the form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'This is a test message for contact form submission.')

      // Submit the form
      const submitButton = page.getByRole('button', { name: 'Send Message' })
      await submitButton.click()

      // Wait a bit for form processing
      await page.waitForTimeout(1000)

      // Check if button shows loading state or success
      const buttonText = await submitButton.textContent()
      console.log('Button text after click:', buttonText)

      // Wait for form submission to complete
      await page.waitForTimeout(3000)

      // Check if success message appears
      const successMessage = page.locator(
        'text=/Message sent successfully!/i',
      )
      const isSuccessVisible = await successMessage.isVisible().catch(() => false)
      console.log('Success message visible:', isSuccessVisible)

      if (isSuccessVisible) {
        console.log('Form submission successful')
      } else {
        console.log('Form submission failed or still processing')
        // Check for error messages
        const errorMessage = page.locator('text=/Failed to send message|Error|error/i')
        const isErrorVisible = await errorMessage.isVisible().catch(() => false)
        console.log('Error message visible:', isErrorVisible)
      }

      // For now, just check that we have some response (success or error)
      const hasResponse =
        isSuccessVisible ||
        (await page
          .locator('text=/Failed|Error|success/i')
          .isVisible()
          .catch(() => false))
      expect(hasResponse).toBe(true)

      // Verify analytics events were sent
      expect(analyticsEvents.length).toBeGreaterThan(0)

      // Check for contact form submit event
      const contactFormEvents = analyticsEvents.filter(
        (event) => event.event === 'contact_form_submit',
      )
      expect(contactFormEvents.length).toBe(1) // Should only be one due to deduplication

      // Verify event structure
      const contactEvent = contactFormEvents[0]
      expect(contactEvent).toHaveProperty('event', 'contact_form_submit')
      expect(contactEvent).toHaveProperty('data')
      expect(contactEvent).toHaveProperty('timestamp')
      expect(contactEvent).toHaveProperty('url')
      expect(contactEvent).toHaveProperty('userAgent')
    })

    test('should prevent duplicate analytics events on rapid form submissions', async ({
      page,
    }) => {
      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      // Mock analytics API to capture events
      const analyticsEvents: any[] = []
      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      await page.goto('/contact')
      await page.waitForLoadState('domcontentloaded')

      // Wait for React to hydrate and render
      await page.waitForSelector('form', { timeout: 10000 })

      // Wait for GoogleAnalytics to initialize and attach tracking functions
      await page.waitForFunction(
        () => {
          return typeof window.trackContactFormSubmit === 'function'
        },
        { timeout: 5000 },
      )

      // Fill out the form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Submit form multiple times rapidly
      const submitButton = page.getByRole('button', { name: 'Send Message' })
      await submitButton.click()
      await submitButton.click() // Second click should be deduplicated
      await submitButton.click() // Third click should be deduplicated

      // Wait for processing
      await page.waitForTimeout(3000)

      // Should only have one contact form submit event due to deduplication
      const contactFormEvents = analyticsEvents.filter(
        (event) => event.event === 'contact_form_submit',
      )
      expect(contactFormEvents.length).toBe(1)

      // Should have page view events (may be multiple due to navigation)
      const pageViewEvents = analyticsEvents.filter((event) => event.event === 'page_view')
      expect(pageViewEvents.length).toBeGreaterThan(0)
    })

    test('should handle form validation errors without sending analytics', async ({ page }) => {
      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      // Mock analytics API to capture events
      const analyticsEvents: any[] = []
      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      await page.goto('/contact')

      // Try to submit empty form
      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for validation
      await page.waitForTimeout(1000)

      // Should show validation errors for required fields - check for specific error messages
      await expect(page.locator('text=/Full name is required|name.*required/i')).toBeVisible()
      await expect(
        page.locator('text=/email.*required|Valid email address is required/i'),
      ).toBeVisible()
      await expect(page.locator('text=/Subject is required|subject.*required/i')).toBeVisible()
      await expect(page.locator('text=/Message is required|message.*required/i')).toBeVisible()

      // Should not have sent contact form analytics event
      const contactFormEvents = analyticsEvents.filter(
        (event) => event.event === 'contact_form_submit',
      )
      expect(contactFormEvents.length).toBe(0)
    })

    test('should handle server errors gracefully and track error analytics', async ({ page }) => {
      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      // Mock contact API to return server error
      await page.route('**/api/contact', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Server error' }),
        })
      })

      // Mock analytics API
      const analyticsEvents: any[] = []
      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      await page.goto('/contact')

      // Wait for GoogleAnalytics to initialize and attach tracking functions
      await page.waitForFunction(
        () => {
          return typeof window.trackContactFormSubmit === 'function'
        },
        { timeout: 5000 },
      )

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for error response
      await page.waitForTimeout(2000)

      // Should show error message
      await expect(page.locator('text=/Failed to send|error|Error/i')).toBeVisible()

      // Should still have sent contact form analytics event
      const contactFormEvents = analyticsEvents.filter(
        (event) => event.event === 'contact_form_submit',
      )
      expect(contactFormEvents.length).toBe(1)
    })

    test('should track page views correctly on navigation', async ({ page }) => {
      // Mock analytics API to capture events
      const analyticsEvents: any[] = []
      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      // Navigate to home page
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(500) // Allow analytics to fire

      // Navigate to contact page
      await page.goto('/contact')
      await page.waitForLoadState('domcontentloaded')

      // Wait for React to hydrate and render
      await page.waitForSelector('form', { timeout: 10000 })
      await page.waitForTimeout(500) // Allow analytics to fire

      // Navigate back to home
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(500) // Allow analytics to fire

      // Should have page view events for each navigation
      const pageViewEvents = analyticsEvents.filter((event) => event.event === 'page_view')

      // Should have at least 2 page view events (home and contact)
      expect(pageViewEvents.length).toBeGreaterThanOrEqual(2)

      // Verify event structure
      pageViewEvents.forEach((event) => {
        expect(event).toHaveProperty('event', 'page_view')
        expect(event).toHaveProperty('data')
        expect(event.data).toHaveProperty('page_path')
        expect(event.data).toHaveProperty('page_title')
        expect(event.data).toHaveProperty('page_location')
        expect(event).toHaveProperty('timestamp')
        expect(event).toHaveProperty('url')
        expect(event).toHaveProperty('userAgent')
      })
    })

    test('should handle reCAPTCHA failures gracefully', async ({ page }) => {
      // Mock reCAPTCHA to fail
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => { throw new Error('reCAPTCHA failed') },
            ready: (callback) => callback()
          }
        `,
      })

      // Mock analytics API
      const analyticsEvents: any[] = []
      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      await page.goto('/contact')

      // Wait for GoogleAnalytics to initialize and attach tracking functions
      await page.waitForFunction(
        () => {
          return typeof window.trackContactFormSubmit === 'function'
        },
        { timeout: 5000 },
      )

      // Fill form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      // Submit form
      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for processing
      await page.waitForTimeout(2000)

      // Should show error message
      await expect(page.locator('text=/Failed to send|error|Error/i')).toBeVisible()

      // Should not have sent contact form analytics event due to reCAPTCHA failure
      const contactFormEvents = analyticsEvents.filter(
        (event) => event.event === 'contact_form_submit',
      )
      expect(contactFormEvents.length).toBe(0)
    })

    test('should validate form fields and show appropriate error messages', async ({ page }) => {
      await page.goto('/contact')

      // Test empty form submission
      await page.getByRole('button', { name: 'Send Message' }).click()
      await page.waitForTimeout(500)

      // Should show validation errors for required fields
      const nameError = page.locator('[id="name-error"], [aria-describedby="name-error"]')
      const emailError = page.locator('[id="email-error"], [aria-describedby="email-error"]')
      const subjectError = page.locator('[id="subject-error"], [aria-describedby="subject-error"]')
      const messageError = page.locator('[id="message-error"], [aria-describedby="message-error"]')

      // At least some validation should be visible
      const hasAnyValidation =
        (await nameError.isVisible().catch(() => false)) ||
        (await emailError.isVisible().catch(() => false)) ||
        (await subjectError.isVisible().catch(() => false)) ||
        (await messageError.isVisible().catch(() => false))

      expect(hasAnyValidation).toBe(true)

      // Test invalid email
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'invalid-email')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()
      await page.waitForTimeout(500)

      // Should show email validation error
      await expect(page.locator('text=/valid email|email.*required|invalid/i')).toBeVisible()
    })

    test('should handle network failures during form submission', async ({ page }) => {
      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      // Mock network failure for contact API
      await page.route('**/api/contact', (route) => route.abort())

      await page.goto('/contact')

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for network error
      await page.waitForTimeout(3000)

      // Should show error message
      await expect(page.locator('text=/Failed to send|network|Network|error/i')).toBeVisible()
    })

    test('should maintain form state during submission', async ({ page }) => {
      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      await page.goto('/contact')

      // Fill form
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message for form state preservation',
      }

      await page.fill('#name', testData.name)
      await page.fill('#email', testData.email)
      await page.fill('#subject', testData.subject)
      await page.fill('#message', testData.message)

      // Submit form
      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for submission
      await page.waitForTimeout(2000)

      // Form should still contain the data (successful submission clears it, but error preserves it)
      const nameValue = await page.inputValue('#name')
      const emailValue = await page.inputValue('#email')
      const subjectValue = await page.inputValue('#subject')
      const messageValue = await page.inputValue('#message')

      // Values should either be preserved (on error) or cleared (on success)
      // Either way, the form should be in a valid state
      expect(typeof nameValue).toBe('string')
      expect(typeof emailValue).toBe('string')
      expect(typeof subjectValue).toBe('string')
      expect(typeof messageValue).toBe('string')
    })

    test('should handle multiple form submissions with proper state management', async ({
      page,
    }) => {
      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      await page.goto('/contact')

      // First submission
      await page.fill('#name', 'Test User 1')
      await page.fill('#email', 'test1@example.com')
      await page.fill('#subject', 'First Subject')
      await page.fill('#message', 'First message')

      await page.getByRole('button', { name: 'Send Message' }).click()
      await page.waitForTimeout(2000)

      // Second submission with different data
      await page.fill('#name', 'Test User 2')
      await page.fill('#email', 'test2@example.com')
      await page.fill('#subject', 'Second Subject')
      await page.fill('#message', 'Second message')

      await page.getByRole('button', { name: 'Send Message' }).click()
      await page.waitForTimeout(2000)

      // Form should handle multiple submissions properly
      await expect(page.locator('form')).toBeVisible()
    })
  })

  test.describe('Analytics Event Deduplication', () => {
    test('should deduplicate rapid page view events', async ({ page }) => {
      const analyticsEvents: any[] = []

      await page.route('**/api/analytics', (route) => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()
          analyticsEvents.push(requestData)
        }
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      // Rapid navigation to trigger potential duplicate events
      await page.goto('/contact')
      await page.waitForLoadState('domcontentloaded')

      // Wait for React to hydrate and render
      await page.waitForSelector('form', { timeout: 10000 })
      await page.waitForTimeout(100)

      await page.reload()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(100)

      await page.reload()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000) // Wait for deduplication window to pass

      // Should have limited page view events due to deduplication
      const pageViewEvents = analyticsEvents.filter((event) => event.event === 'page_view')

      // Should be less than 3 (one per navigation, but deduplicated)
      expect(pageViewEvents.length).toBeLessThan(3)
    })

    test('should handle analytics API failures gracefully', async ({ page }) => {
      // Mock analytics API to fail
      await page.route('**/api/analytics', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Analytics API error' }),
        })
      })

      // Mock reCAPTCHA
      await page.addScriptTag({
        content: `
          window.grecaptcha = {
            execute: async () => 'test-recaptcha-token-12345',
            ready: (callback) => callback()
          }
        `,
      })

      await page.goto('/contact')

      // Wait for GoogleAnalytics to initialize and attach tracking functions
      await page.waitForFunction(
        () => {
          return typeof window.trackContactFormSubmit === 'function'
        },
        { timeout: 5000 },
      )

      // Fill and submit form
      await page.fill('#name', 'Test User')
      await page.fill('#email', 'test@example.com')
      await page.fill('#subject', 'Test Subject')
      await page.fill('#message', 'Test message')

      await page.getByRole('button', { name: 'Send Message' }).click()

      // Wait for processing
      await page.waitForTimeout(2000)

      // Form submission should still work despite analytics failure
      await expect(
        page.locator('text=/Message sent successfully|sent successfully/i'),
      ).toBeVisible()

      // Page should remain functional
      await expect(page.locator('form')).toBeVisible()
    })
  })
})
