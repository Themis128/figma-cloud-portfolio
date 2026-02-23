import { expect, test } from '@playwright/test'

test('Push notification subscription works', async ({ page }) => {
  await page.goto('/')
  const notifButton = page.getByTestId('notification-button')
  await expect(notifButton).toBeVisible()
  await notifButton.click()
  // Check for permission prompt and subscription
})
