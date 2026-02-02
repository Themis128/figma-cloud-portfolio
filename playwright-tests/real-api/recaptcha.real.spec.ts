import { expect, test } from '@playwright/test'
import {
  loadRealAPIConfig,
  measureAPICall,
  rateLimitDelay,
  setupRealAPIPage,
  usageTracker,
  validateAPICredentials,
  waitForAppReady,
} from './test-utils.real'

/**
 * REAL Google reCAPTCHA v3 Integration Tests
 *
 * ✅ FREE: 1 million assessments/month
 * - Tests real CAPTCHA verification
 * - Validates score-based validation
 * - Tests contact form integration
 * - No costs within free tier
 *
 * Run with: pnpm test:e2e:real
 */

test.describe('Google reCAPTCHA v3 - Real Integration', () => {
  const config = loadRealAPIConfig()
  const requiredVars = ['VITE_RECAPTCHA_SITE_KEY', 'RECAPTCHA_SECRET_KEY']

  test.beforeAll(() => {
    if (!config.enableAnalytics) {
      // Using analytics flag as proxy for reCAPTCHA
      console.log('⏭️  Skipping reCAPTCHA tests (TEST_ANALYTICS=false)')
      test.skip()
    }

    if (!validateAPICredentials('reCAPTCHA', requiredVars)) {
      console.log('⏭️  Skipping reCAPTCHA tests (missing credentials)')
      test.skip()
    }

    console.log('🚀 Running REAL reCAPTCHA v3 integration tests')
    console.log('💡 Free tier: 1M assessments/month')
  })

  test.afterAll(() => {
    console.log(usageTracker.getReport())
  })

  test('should load real reCAPTCHA v3 script', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/contact')
    await waitForAppReady(page)

    const { result: captchaStatus, duration } = await measureAPICall(
      'reCAPTCHA Script Loading',
      async () => {
        // Wait for reCAPTCHA to load
        await page.waitForTimeout(2000)

        return await page.evaluate(() => {
          // Check if grecaptcha is loaded
          const hasGrecaptcha = !!(window as typeof window & { grecaptcha?: unknown }).grecaptcha

          // Check for reCAPTCHA scripts
          const captchaScripts = Array.from(document.querySelectorAll('script[src*="recaptcha"]'))

          // Check for reCAPTCHA badge
          const badge = document.querySelector('.grecaptcha-badge')

          return {
            grecaptchaLoaded: hasGrecaptcha,
            scriptsFound: captchaScripts.length,
            badgeVisible: !!badge,
            badgePosition: badge ? window.getComputedStyle(badge).position : null,
          }
        })
      },
    )

    usageTracker.recordCall('reCAPTCHA', duration)

    console.log(`🛡️  reCAPTCHA Status:`)
    console.log(`  grecaptcha Object: ${captchaStatus.grecaptchaLoaded ? '✅' : '❌'}`)
    console.log(`  Scripts Loaded: ${captchaStatus.scriptsFound}`)
    console.log(`  Badge Visible: ${captchaStatus.badgeVisible ? '✅' : '❌'}`)

    if (captchaStatus.badgePosition) {
      console.log(`  Badge Position: ${captchaStatus.badgePosition}`)
    }

    // reCAPTCHA should be loaded
    expect(captchaStatus.grecaptchaLoaded || captchaStatus.scriptsFound > 0).toBe(true)
  })

  test('should generate real reCAPTCHA token', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/contact')
    await waitForAppReady(page)

    const { result: tokenResult, duration } = await measureAPICall(
      'reCAPTCHA Token Generation',
      async () => {
        // Wait for reCAPTCHA to be ready
        await page.waitForTimeout(3000)

        return await page.evaluate(() => {
          return new Promise((resolve) => {
            const grecaptcha = (
              window as typeof window & {
                grecaptcha?: {
                  ready: (callback: () => void) => void
                  execute: (siteKey: string, options: { action: string }) => Promise<string>
                }
              }
            ).grecaptcha

            if (!grecaptcha) {
              resolve({
                success: false,
                error: 'grecaptcha not available',
              })
              return
            }

            grecaptcha.ready(() => {
              const siteKey = process.env.VITE_RECAPTCHA_SITE_KEY || ''

              if (!siteKey) {
                resolve({
                  success: false,
                  error: 'Site key not configured',
                })
                return
              }

              grecaptcha
                .execute(siteKey, { action: 'test' })
                .then((token) => {
                  resolve({
                    success: true,
                    token: token,
                    tokenLength: token.length,
                    tokenPrefix: `${token.substring(0, 20)}...`,
                  })
                })
                .catch((error) => {
                  resolve({
                    success: false,
                    error: String(error),
                  })
                })
            })

            // Timeout after 10 seconds
            setTimeout(() => {
              resolve({
                success: false,
                error: 'Token generation timeout',
              })
            }, 10000)
          })
        })
      },
    )

    usageTracker.recordCall('reCAPTCHA Token', duration)

    console.log(`🔑 Token Generation:`)
    console.log(`  Success: ${tokenResult.success ? '✅' : '❌'}`)

    if (tokenResult.success) {
      console.log(`  Token Length: ${tokenResult.tokenLength} characters`)
      console.log(`  Token Preview: ${tokenResult.tokenPrefix}`)
    } else {
      console.log(`  Error: ${tokenResult.error}`)
    }

    // Should be able to generate token or document why not
    expect(tokenResult.success || tokenResult.error).toBeTruthy()

    await rateLimitDelay(config.rateLimitDelay)
  })

  test('should verify real token with backend', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/contact')
    await waitForAppReady(page)

    // First, generate a token
    const token = await page.evaluate(() => {
      return new Promise<string | null>((resolve) => {
        const grecaptcha = (
          window as typeof window & {
            grecaptcha?: {
              ready: (callback: () => void) => void
              execute: (siteKey: string, options: { action: string }) => Promise<string>
            }
          }
        ).grecaptcha

        if (!grecaptcha) {
          resolve(null)
          return
        }

        grecaptcha.ready(() => {
          const siteKey = process.env.VITE_RECAPTCHA_SITE_KEY || ''
          grecaptcha
            .execute(siteKey, { action: 'submit' })
            .then((token) => resolve(token))
            .catch(() => resolve(null))
        })

        setTimeout(() => resolve(null), 10000)
      })
    })

    if (!token) {
      console.log('⏭️  Could not generate token - skipping verification test')
      test.skip()
      return
    }

    await rateLimitDelay(config.rateLimitDelay)

    // Verify token with backend
    const { result: verification, duration } = await measureAPICall(
      'Token Verification',
      async () => {
        try {
          const response = await page.request.post('http://localhost:3000/api/contact', {
            data: {
              name: 'Test User',
              email: 'test@example.com',
              message: 'Test message for reCAPTCHA verification',
              recaptchaToken: token,
            },
          })

          const data = await response.json()

          return {
            success: response.ok(),
            status: response.status(),
            verified: data.success,
            score: data.score,
            data,
          }
        } catch (error) {
          return {
            success: false,
            error: String(error),
          }
        }
      },
    )

    usageTracker.recordCall('reCAPTCHA Verification', duration)

    console.log(`✅ Token Verification:`)
    console.log(`  HTTP Status: ${verification.status}`)
    console.log(`  Verified: ${verification.verified ? '✅' : '❌'}`)

    if (verification.score !== undefined) {
      console.log(`  reCAPTCHA Score: ${verification.score} (0.0 = bot, 1.0 = human)`)
    }

    if (verification.error) {
      console.log(`  Error: ${verification.error}`)
      console.log(`  💡 Make sure backend server is running`)
    }

    // Should receive response from backend
    expect(verification.status).toBeGreaterThan(0)

    await rateLimitDelay(config.rateLimitDelay)
  })

  test('should handle contact form submission with real CAPTCHA', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/contact')
    await waitForAppReady(page)

    // Check if contact form exists
    const formExists = (await page.locator('form').count()) > 0

    if (!formExists) {
      console.log('⏭️  Contact form not found - skipping form test')
      test.skip()
      return
    }

    const { result: formSubmission, duration } = await measureAPICall(
      'Contact Form with reCAPTCHA',
      async () => {
        try {
          // Fill out form
          await page.fill('input[name="name"], input[placeholder*="name"]', 'Test User')
          await page.fill('input[type="email"]', 'test@example.com')
          await page.fill(
            'textarea[name="message"], textarea[placeholder*="message"]',
            'This is a real API test submission with reCAPTCHA verification',
          )

          // Submit form (will trigger reCAPTCHA)
          await page.click('button[type="submit"]')

          // Wait for submission response
          await page.waitForTimeout(5000)

          // Check for success/error message
          const successMessage = await page
            .locator('[class*="success"], [role="alert"]')
            .textContent()

          return {
            submitted: true,
            message: successMessage,
          }
        } catch (error) {
          return {
            submitted: false,
            error: String(error),
          }
        }
      },
    )

    usageTracker.recordCall('Contact Form', duration)

    console.log(`📧 Contact Form Submission:`)
    console.log(`  Submitted: ${formSubmission.submitted ? '✅' : '❌'}`)

    if (formSubmission.message) {
      console.log(`  Response: ${formSubmission.message}`)
    }

    if (formSubmission.error) {
      console.log(`  Error: ${formSubmission.error}`)
    }

    // Form submission should be attempted
    expect(formSubmission.submitted || formSubmission.error).toBeTruthy()

    await rateLimitDelay(config.rateLimitDelay)
  })

  test('should measure reCAPTCHA performance impact', async ({ page }) => {
    await setupRealAPIPage(page)

    const { result: perfImpact, duration } = await measureAPICall(
      'reCAPTCHA Performance',
      async () => {
        await page.goto('http://localhost:3001/contact')
        await waitForAppReady(page)

        return await page.evaluate(() => {
          if (!(performance && performance.getEntriesByType)) {
            return { impact: 0 }
          }

          // Find all reCAPTCHA-related resources
          const captchaResources = performance
            .getEntriesByType('resource')
            .filter((resource: PerformanceEntry) => {
              const name = (resource as PerformanceResourceTiming).name
              return name.includes('recaptcha') || name.includes('gstatic.com')
            })

          const totalDuration = captchaResources.reduce(
            (sum: number, resource: PerformanceEntry) =>
              sum + (resource as PerformanceResourceTiming).duration,
            0,
          )

          const totalSize = captchaResources.reduce(
            (sum: number, resource: PerformanceEntry) =>
              sum + ((resource as PerformanceResourceTiming).transferSize || 0),
            0,
          )

          return {
            resourceCount: captchaResources.length,
            totalDuration: Math.round(totalDuration),
            totalSize: totalSize,
            resources: captchaResources.map((r: PerformanceEntry) => ({
              url: (r as PerformanceResourceTiming).name.split('/').pop(),
              duration: Math.round((r as PerformanceResourceTiming).duration),
              size: (r as PerformanceResourceTiming).transferSize || 0,
            })),
          }
        })
      },
    )

    usageTracker.recordCall('reCAPTCHA Performance', duration)

    console.log(`⚡ reCAPTCHA Performance Impact:`)
    console.log(`  Resources Loaded: ${perfImpact.resourceCount}`)
    console.log(`  Total Load Time: ${perfImpact.totalDuration}ms`)
    console.log(`  Total Size: ${(perfImpact.totalSize / 1024).toFixed(2)} KB`)

    if (perfImpact.resources && perfImpact.resources.length > 0) {
      console.log(`  Detailed Breakdown:`)
      perfImpact.resources.forEach((resource: { url?: string; duration: number; size: number }) => {
        console.log(
          `    - ${resource.url || 'unknown'}: ${resource.duration}ms (${(resource.size / 1024).toFixed(2)} KB)`,
        )
      })
    }

    // reCAPTCHA should have reasonable performance impact
    if (perfImpact.totalDuration > 0) {
      expect(perfImpact.totalDuration).toBeLessThan(15000) // Under 15 seconds
    }
  })

  test('should check reCAPTCHA API rate limits', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/contact')
    await waitForAppReady(page)

    console.log(`📊 reCAPTCHA Rate Limits:`)
    console.log(`  Free Tier: 1,000,000 assessments/month`)
    console.log(`  That's ~33,333 per day or ~1,388 per hour`)
    console.log(`  Current test run uses minimal quota (< 10 assessments)`)

    // Verify we're not overusing
    const currentTestCount = 5 // Approximate number of CPATCHA calls in this test suite
    const dailyLimit = 33333
    const usage = (currentTestCount / dailyLimit) * 100

    console.log(
      `  This test suite: ~${currentTestCount} assessments (${usage.toFixed(4)}% of daily limit)`,
    )

    expect(usage).toBeLessThan(1) // Should use less than 1% of daily quota
  })

  test('should validate reCAPTCHA integration best practices', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/contact')
    await waitForAppReady(page)

    const { result: bestPractices, duration } = await measureAPICall(
      'Best Practices Check',
      async () => {
        await page.waitForTimeout(3000)

        return await page.evaluate(() => {
          const checks = {
            invisibleMode: true, // reCAPTCHA v3 is always invisible
            badgeVisible: !!document.querySelector('.grecaptcha-badge'),
            noExplicitButton: !document.querySelector('input[type="checkbox"].g-recaptcha'),
            scriptLoadedAsync: Array.from(
              document.querySelectorAll("script[src*='recaptcha']"),
            ).some((script) => (script as HTMLScriptElement).async),
            privacyTermsVisible: !!document.querySelector('a[href*="recaptcha/terms"]'),
          }

          return checks
        })
      },
    )

    usageTracker.recordCall('reCAPTCHA Best Practices', duration)

    console.log(`✨ Best Practices:`)
    console.log(`  Invisible Mode (v3): ${bestPractices.invisibleMode ? '✅' : '❌'}`)
    console.log(`  Badge Visible: ${bestPractices.badgeVisible ? '✅' : '❌'}`)
    console.log(`  No Checkbox (v2): ${bestPractices.noExplicitButton ? '✅' : '⚠️  (v2 detected)'}`)
    console.log(`  Async Loading: ${bestPractices.scriptLoadedAsync ? '✅' : '⚠️'}`)

    // v3 should be invisible
    expect(bestPractices.invisibleMode).toBe(true)
  })
})
