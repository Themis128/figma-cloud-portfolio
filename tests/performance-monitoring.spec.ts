import { expect, test } from '@playwright/test'

test('Performance metrics are tracked', async ({ page }) => {
  await page.goto('/performance')
  const metrics = page.getByTestId('core-web-vitals-section')
  await expect(metrics).toBeVisible()
  // Optionally check analytics requests
})
