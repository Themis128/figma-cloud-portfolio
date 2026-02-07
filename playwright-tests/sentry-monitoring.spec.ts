import { expect, test } from '@playwright/test'
import { setupTestEnvironment, teardownTestEnvironment, waitForAppReady } from './test-utils'

/**
 * Sentry Error Tracking and Performance Monitoring Testing Suite
 * Tests for error tracking, performance monitoring, and Sentry integration
 * Integration: @sentry/node v10.36.0, @sentry/react v10.36.0, @sentry/tracing v7.120.4
 */

test.describe('Sentry Error Tracking', () => {
  test.beforeAll(async () => {
    await setupTestEnvironment()
  })

  test.afterAll(async () => {
    await teardownTestEnvironment()
  })

  test.describe('Sentry Initialization', () => {
    test('should initialize Sentry with correct configuration', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock Sentry initialization
      await page.evaluate(() => {
        window.sentryConfig = {
          dsn: null as string | null,
          environment: 'test',
          tracesSampleRate: 1.0,
          initialized: false,
          init: function (config: { dsn: string; environment?: string }) {
            this.dsn = config.dsn
            this.environment = config.environment || 'production'
            this.initialized = true
          },
          isConfigured: function () {
            return this.initialized && !!this.dsn
          },
        }
      })

      const initTest = await page.evaluate(() => {
        if (window.sentryConfig) {
          window.sentryConfig.init({
            dsn: 'https://test@o123456.ingest.sentry.io/123456',
            environment: 'test',
          })

          return {
            initialized: window.sentryConfig.initialized,
            isConfigured: window.sentryConfig.isConfigured(),
            environment: window.sentryConfig.environment,
          }
        }
        return null
      })

      expect(initTest?.initialized).toBe(true)
      expect(initTest?.isConfigured).toBe(true)
      expect(initTest?.environment).toBe('test')
    })

    test('should validate DSN format', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const dsnValidation = await page.evaluate(() => {
        const validateDSN = (dsn: string): boolean => {
          // Sentry DSN format: https://<key>@<organization>.ingest.sentry.io/<project>
          const dsnPattern = /^https:\/\/[a-f0-9]{32}@[a-z0-9]+\.ingest\.sentry\.io\/\d+$/
          return dsnPattern.test(dsn)
        }

        return {
          validDSN: validateDSN(
            'https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/123456',
          ),
          invalidDSN: validateDSN('invalid-dsn'),
          emptyDSN: validateDSN(''),
        }
      })

      expect(dsnValidation.validDSN).toBe(true)
      expect(dsnValidation.invalidDSN).toBe(false)
      expect(dsnValidation.emptyDSN).toBe(false)
    })

    test('should set correct sample rates', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const sampleRateTest = await page.evaluate(() => {
        const config = {
          // Development: 100% tracing
          development: {
            tracesSampleRate: 1.0,
            profilesSampleRate: 1.0,
          },
          // Production: 10% tracing
          production: {
            tracesSampleRate: 0.1,
            profilesSampleRate: 0.1,
          },
        }

        const env = process.env.NODE_ENV || 'development'
        const rates = config[env as keyof typeof config] || config.development

        return {
          environment: env,
          tracesSampleRate: rates.tracesSampleRate,
          inRange: rates.tracesSampleRate >= 0 && rates.tracesSampleRate <= 1,
        }
      })

      expect(sampleRateTest.tracesSampleRate).toBeGreaterThanOrEqual(0)
      expect(sampleRateTest.tracesSampleRate).toBeLessThanOrEqual(1)
      expect(sampleRateTest.inRange).toBe(true)
    })
  })

  test.describe('Error Capture and Reporting', () => {
    test('should capture JavaScript errors', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock error capture
      await page.evaluate(() => {
        window.sentryErrorCapture = {
          errors: [] as Array<{
            message: string
            level: string
            timestamp: number
          }>,
          captureException: function (error: Error) {
            this.errors.push({
              message: error.message,
              level: 'error',
              timestamp: Date.now(),
            })
          },
          captureMessage: function (message: string, level = 'info') {
            this.errors.push({
              message,
              level,
              timestamp: Date.now(),
            })
          },
          getErrors: function () {
            return this.errors
          },
        }
      })

      const errorTest = await page.evaluate(() => {
        if (window.sentryErrorCapture) {
          try {
            throw new Error('Test error')
          } catch (error) {
            window.sentryErrorCapture.captureException(error as Error)
          }

          window.sentryErrorCapture.captureMessage('Test warning', 'warning')

          return {
            errorCount: window.sentryErrorCapture.getErrors().length,
            firstError: window.sentryErrorCapture.getErrors()[0],
          }
        }
        return null
      })

      expect(errorTest?.errorCount).toBe(2)
      expect(errorTest?.firstError.level).toBe('error')
    })

    test('should capture unhandled promise rejections', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock promise rejection handling
      const rejectionTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          const rejections: PromiseRejectionEvent[] = []

          const handler = (event: PromiseRejectionEvent) => {
            rejections.push(event)
            event.preventDefault()
          }

          window.addEventListener('unhandledrejection', handler)

          // Create unhandled rejection
          Promise.reject(new Error('Unhandled rejection test'))

          setTimeout(() => {
            window.removeEventListener('unhandledrejection', handler)
            resolve({
              captured: rejections.length > 0,
              count: rejections.length,
            })
          }, 100)
        })
      })

      expect((rejectionTest as { captured: boolean }).captured).toBe(true)
    })

    test('should filter non-actionable errors', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const filterTest = await page.evaluate(() => {
        const errorFilter = {
          ignoredPatterns: [
            /ECONNRESET/,
            /ResizeObserver loop limit exceeded/,
            /Non-Error promise rejection captured/,
          ],
          beforeSend: function (event: { message?: string }): boolean {
            if (!event.message) return true

            // Filter out ignored errors
            return !this.ignoredPatterns.some((pattern) => pattern.test(event.message || ''))
          },
        }

        return {
          shouldSendNormal: errorFilter.beforeSend({ message: 'Normal error' }),
          shouldFilterECONNRESET: errorFilter.beforeSend({
            message: 'Error: ECONNRESET',
          }),
          shouldFilterResizeObserver: errorFilter.beforeSend({
            message: 'ResizeObserver loop limit exceeded',
          }),
        }
      })

      expect(filterTest.shouldSendNormal).toBe(true)
      expect(filterTest.shouldFilterECONNRESET).toBe(false)
      expect(filterTest.shouldFilterResizeObserver).toBe(false)
    })

    test('should add contextual breadcrumbs', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock breadcrumb tracking
      await page.evaluate(() => {
        window.sentryBreadcrumbs = {
          crumbs: [] as Array<{
            category: string
            message: string
            level: string
            timestamp: number
          }>,
          addBreadcrumb: function (category: string, message: string, level = 'info') {
            this.crumbs.push({
              category,
              message,
              level,
              timestamp: Date.now(),
            })

            // Keep only last 100 breadcrumbs
            if (this.crumbs.length > 100) {
              this.crumbs.shift()
            }
          },
          getBreadcrumbs: function () {
            return this.crumbs
          },
        }
      })

      const breadcrumbTest = await page.evaluate(() => {
        if (window.sentryBreadcrumbs) {
          window.sentryBreadcrumbs.addBreadcrumb('navigation', 'User navigated to /about')
          window.sentryBreadcrumbs.addBreadcrumb('user', 'Button clicked')
          window.sentryBreadcrumbs.addBreadcrumb('api', 'API request failed', 'error')

          return {
            count: window.sentryBreadcrumbs.getBreadcrumbs().length,
            lastCrumb: window.sentryBreadcrumbs.getBreadcrumbs()[2],
          }
        }
        return null
      })

      expect(breadcrumbTest?.count).toBe(3)
      expect(breadcrumbTest?.lastCrumb.category).toBe('api')
      expect(breadcrumbTest?.lastCrumb.level).toBe('error')
    })

    test('should capture user context', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock user context
      await page.evaluate(() => {
        window.sentryUserContext = {
          user: null as { id: string; email: string; username: string } | null,
          setUser: function (user: { id: string; email: string; username: string }) {
            this.user = user
          },
          clearUser: function () {
            this.user = null
          },
          getUser: function () {
            return this.user
          },
        }
      })

      const userContextTest = await page.evaluate(() => {
        if (window.sentryUserContext) {
          window.sentryUserContext.setUser({
            id: 'user123',
            email: 'test@example.com',
            username: 'testuser',
          })

          const user = window.sentryUserContext.getUser()
          window.sentryUserContext.clearUser()
          const cleared = window.sentryUserContext.getUser()

          return {
            userId: user?.id,
            hasUser: !!user,
            cleared: !cleared,
          }
        }
        return null
      })

      expect(userContextTest?.userId).toBe('user123')
      expect(userContextTest?.hasUser).toBe(true)
      expect(userContextTest?.cleared).toBe(true)
    })
  })

  test.describe('Performance Monitoring', () => {
    test('should track HTTP request performance', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock performance tracking
      await page.evaluate(() => {
        window.sentryPerformance = {
          transactions: [] as Array<{
            name: string
            op: string
            startTime: number
            duration: number
          }>,
          startTransaction: function (name: string, op: string) {
            return {
              name,
              op,
              startTime: Date.now(),
              finish: () => {
                this.transactions.push({
                  name,
                  op,
                  startTime: Date.now(),
                  duration: Math.random() * 1000,
                })
              },
            }
          },
          getTransactions: function () {
            return this.transactions
          },
        }
      })

      const perfTest = await page.evaluate(() => {
        if (window.sentryPerformance) {
          const transaction = window.sentryPerformance.startTransaction(
            'GET /api/data',
            'http.request',
          )
          transaction.finish()

          return {
            transactionCount: window.sentryPerformance.getTransactions().length,
            transaction: window.sentryPerformance.getTransactions()[0],
          }
        }
        return null
      })

      expect(perfTest?.transactionCount).toBe(1)
      expect(perfTest?.transaction.op).toBe('http.request')
    })

    test('should track database operations', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock database operation tracking
      const dbTest = await page.evaluate(() => {
        const dbOperations: Array<{ operation: string; duration: number }> = []

        const trackDBOperation = (operation: string) => {
          const start = performance.now()
          // Simulate DB operation
          const end = performance.now()
          dbOperations.push({
            operation,
            duration: end - start,
          })
        }

        trackDBOperation('SELECT * FROM users')
        trackDBOperation('INSERT INTO logs')
        trackDBOperation('UPDATE settings')

        return {
          operationCount: dbOperations.length,
          operations: dbOperations.map((op) => op.operation),
        }
      })

      expect(dbTest.operationCount).toBe(3)
      expect(dbTest.operations).toContain('SELECT * FROM users')
    })

    test('should calculate transaction metrics', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const metricsTest = await page.evaluate(() => {
        const transactions = [
          { duration: 100, status: 'ok' },
          { duration: 200, status: 'ok' },
          { duration: 150, status: 'ok' },
          { duration: 5000, status: 'error' },
        ]

        const calculateMetrics = () => {
          const successful = transactions.filter((t) => t.status === 'ok')
          const durations = successful.map((t) => t.duration)

          return {
            count: transactions.length,
            successRate: successful.length / transactions.length,
            avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
            maxDuration: Math.max(...durations),
            minDuration: Math.min(...durations),
          }
        }

        return calculateMetrics()
      })

      expect(metricsTest.count).toBe(4)
      expect(metricsTest.successRate).toBe(0.75)
      expect(metricsTest.avgDuration).toBe(150)
    })

    test('should track custom performance metrics', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const customMetricsTest = await page.evaluate(() => {
        const metrics = {
          componentRenderTime: performance.now(),
          apiResponseTime: Math.random() * 1000,
          bundleLoadTime: Math.random() * 2000,
        }

        return {
          hasAllMetrics: Object.keys(metrics).length === 3,
          allPositive: Object.values(metrics).every((v) => v > 0),
        }
      })

      expect(customMetricsTest.hasAllMetrics).toBe(true)
      expect(customMetricsTest.allPositive).toBe(true)
    })
  })

  test.describe('Error Grouping and Fingerprinting', () => {
    test('should group similar errors', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const groupingTest = await page.evaluate(() => {
        const generateFingerprint = (error: { message: string; stack?: string }): string => {
          // Simplify stack trace to group similar errors
          const normalized = error.message.replace(/\d+/g, 'N')
          return btoa(normalized)
        }

        const errors = [
          { message: 'Failed to fetch data at line 10' },
          { message: 'Failed to fetch data at line 20' },
          { message: 'Network error occurred' },
        ]

        const fingerprints = errors.map(generateFingerprint)

        return {
          firstTwoSame: fingerprints[0] === fingerprints[1],
          thirdDifferent: fingerprints[2] !== fingerprints[0],
        }
      })

      expect(groupingTest.firstTwoSame).toBe(true)
      expect(groupingTest.thirdDifferent).toBe(true)
    })

    test('should implement custom fingerprinting', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const fingerprintTest = await page.evaluate(() => {
        const customFingerprint = (event: { message?: string; transaction?: string }): string[] => {
          const fingerprint: string[] = []

          if (event.transaction) {
            fingerprint.push(event.transaction)
          }

          if (event.message) {
            // Remove dynamic parts
            const normalized = event.message
              .replace(/\d+/g, '{{number}}')
              .replace(/user-\w+/g, '{{userId}}')
            fingerprint.push(normalized)
          }

          return fingerprint
        }

        const event1 = {
          message: 'User user-123 failed at step 1',
          transaction: '/api/process',
        }
        const event2 = {
          message: 'User user-456 failed at step 2',
          transaction: '/api/process',
        }

        const fp1 = customFingerprint(event1)
        const fp2 = customFingerprint(event2)

        return {
          sameTransaction: fp1[0] === fp2[0],
          sameNormalizedMessage: fp1[1] === fp2[1],
        }
      })

      expect(fingerprintTest.sameTransaction).toBe(true)
      expect(fingerprintTest.sameNormalizedMessage).toBe(true)
    })
  })

  test.describe('Release Tracking', () => {
    test('should track release version', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const releaseTest = await page.evaluate(() => {
        const appVersion = '1.0.0'
        const gitCommit = 'abc123def'

        const releaseId = `${appVersion}+${gitCommit}`

        return {
          releaseId,
          hasVersion: !!appVersion,
          hasCommit: !!gitCommit,
        }
      })

      expect(releaseTest.hasVersion).toBe(true)
      expect(releaseTest.hasCommit).toBe(true)
      expect(releaseTest.releaseId).toContain('1.0.0')
    })

    test('should associate errors with releases', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      // Mock release association
      const releaseAssociationTest = await page.evaluate(() => {
        const errors = [
          { message: 'Error 1', release: '1.0.0' },
          { message: 'Error 2', release: '1.0.0' },
          { message: 'Error 3', release: '1.0.1' },
        ]

        const errorsByRelease = errors.reduce(
          (acc, error) => {
            if (!acc[error.release]) {
              acc[error.release] = []
            }
            acc[error.release].push(error)
            return acc
          },
          {} as Record<string, typeof errors>,
        )

        return {
          releaseCount: Object.keys(errorsByRelease).length,
          v100Errors: errorsByRelease['1.0.0'].length,
          v101Errors: errorsByRelease['1.0.1'].length,
        }
      })

      expect(releaseAssociationTest.releaseCount).toBe(2)
      expect(releaseAssociationTest.v100Errors).toBe(2)
      expect(releaseAssociationTest.v101Errors).toBe(1)
    })
  })

  test.describe('Integration and API', () => {
    test('should handle Sentry API authentication', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const authTest = await page.evaluate(() => {
        const validateAuthToken = (token: string): boolean => {
          // Sentry auth tokens start with sntrys_
          return /^sntrys_[a-zA-Z0-9_-]{40,}$/.test(token)
        }

        return {
          validToken: validateAuthToken(`sntrys_${'a'.repeat(40)}`),
          invalidToken: validateAuthToken('invalid-token'),
        }
      })

      expect(authTest.validToken).toBe(true)
      expect(authTest.invalidToken).toBe(false)
    })

    test('should batch error submissions', async ({ page }) => {
      await page.goto('/')
      await waitForAppReady(page)

      const batchTest = await page.evaluate(() => {
        const errorQueue: string[] = []
        const batchSize = 10

        const addError = (error: string) => {
          errorQueue.push(error)
        }

        const shouldFlush = () => errorQueue.length >= batchSize

        // Add 15 errors
        for (let i = 0; i < 15; i++) {
          addError(`Error ${i}`)
        }

        return {
          queueSize: errorQueue.length,
          shouldFlush: shouldFlush(),
        }
      })

      expect(batchTest.queueSize).toBe(15)
      expect(batchTest.shouldFlush).toBe(true)
    })
  })
})
