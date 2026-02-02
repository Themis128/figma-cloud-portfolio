import { expect, test } from '@playwright/test'

test('basic page load', async ({ page }) => {
  await page.goto('/')

  const bodyVisible = await page.locator('body').isVisible()

  expect(bodyVisible).toBe(true)
})
