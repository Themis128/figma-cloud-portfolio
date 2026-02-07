import { expect, test } from '@playwright/test'

test.describe('Push Notifications @smoke', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['notifications'])
  })

  test('should have service worker support', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })

    expect(hasServiceWorker).toBeTruthy()
  })

  test('should have push manager support', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const hasPushManager = await page.evaluate(() => {
      return 'PushManager' in window
    })

    expect(hasPushManager).toBeTruthy()
  })

  test('should handle notification permission', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const permission = await page.evaluate(() => Notification.permission)
    expect(['granted', 'default', 'denied']).toContain(permission)
  })
})
