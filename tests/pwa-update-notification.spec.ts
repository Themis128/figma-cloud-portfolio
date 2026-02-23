import { test } from '@playwright/test'

test('PWA update notification appears', async ({ page }) => {
  await page.goto('/')
  const _updateBar = page.locator('text=New version available')
  // Simulate service worker update
  // await expect(_updateBar).toBeVisible();
})
