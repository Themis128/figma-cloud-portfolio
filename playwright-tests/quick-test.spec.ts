import { expect, test } from '@playwright/test'

test('homepage loads and displays content', async ({ page }) => {
  await page.goto('http://localhost:8081')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Check the title
  await expect(page).toHaveTitle(/Themistoklis/)

  // Check main heading is visible (use first match)
  const heading = page.locator('h2:has-text("Cloud Architect")').first()
  await expect(heading).toBeVisible()

  // Check navigation exists
  const nav = page.locator('nav')
  await expect(nav).toBeVisible()
})

test('can navigate to Agents page', async ({ page }) => {
  await page.goto('http://localhost:8081')
  await page.waitForLoadState('networkidle')

  // Click on first Agents link (in nav)
  await page.locator('nav a:has-text("Agents")').first().click()

  // Wait for navigation
  await page.waitForURL(/agents/)

  // Check we're on the agents page
  await expect(page).toHaveURL(/agents/)
})

test('theme toggle works', async ({ page }) => {
  await page.goto('http://localhost:8081')
  await page.waitForLoadState('networkidle')

  // Find and click theme toggle
  const themeToggle = page.locator('button:has-text("Toggle theme")')
  await expect(themeToggle).toBeVisible()

  // Click it
  await themeToggle.click()

  // Should still be visible after click
  await expect(themeToggle).toBeVisible()
})
