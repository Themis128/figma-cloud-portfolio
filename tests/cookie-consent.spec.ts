import { expect, test } from '@playwright/test'

test('Cookie consent bar appears and works', async ({ page }) => {
  await page.goto('/')
  // Clear localStorage after navigation
  await page.evaluate(() => localStorage.clear())
  const bar = page.locator('text=This site uses cookies')
  await expect(bar).toBeVisible()
  await page.click('button:has-text("Accept")')
  await expect(bar).toBeHidden()
  await page.reload()
  await expect(bar).toBeHidden()
})
