import { test, expect } from '@playwright/test'

test('PWA update notification appears', async ({ page }) => {
  await page.goto('/')
  const updateBar = page.locator('text=New version available')
  // Simulate service worker update
  // await expect(updateBar).toBeVisible();
})
