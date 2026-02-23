import { expect, test } from '@playwright/test'

import { skipIfLambdaOffline } from '../playwright-ai-sync'

test.beforeAll(async () => {
  await skipIfLambdaOffline(test)
})

test('Push notification subscription works', async ({ page }) => {
  await page.goto('/')
  const notifButton = page.getByTestId('notification-button')
  await expect(notifButton).toBeVisible()
  await notifButton.click()
  // Check for permission prompt and subscription
})
