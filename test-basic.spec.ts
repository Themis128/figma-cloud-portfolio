import { expect, test } from '@playwright/test'

test('basic page load', async ({ page }) => {
  await page.goto('/')
  console.log('Page loaded')
  const bodyVisible = await page.locator('body').isVisible()
  console.log('Body visible:', bodyVisible)
  expect(bodyVisible).toBe(true)
})
