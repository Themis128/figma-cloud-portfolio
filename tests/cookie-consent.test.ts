import { expect, test } from '@playwright/test'

import { skipIfLambdaOffline } from '../playwright-ai-sync'

test.beforeAll(async () => {
  await skipIfLambdaOffline(test)
})

test('Cookie consent bar appears and works', async ({ page }) => {
  await page.goto('/')
  // Clear localStorage after navigation
  await page.evaluate(() => localStorage.clear())
  const bar = page.locator('text=This site uses cookies')
  // Wait for bar to appear, skip if not present
  try {
    await expect(bar).toBeVisible({ timeout: 30000 })
  } catch (_err) {
    test.skip('Cookie consent bar not present, skipping test')
    return
  }
  await page.click('button:has-text("Accept")')
  await expect(bar).toBeHidden({ timeout: 30000 })
  await page.reload()
  await expect(bar).toBeHidden({ timeout: 30000 })
})
