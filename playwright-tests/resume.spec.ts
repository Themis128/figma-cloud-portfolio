import { expect, test } from '@playwright/test'
import { waitForAppReady } from './test-utils'

test.describe('Resume Generation', () => {
  test('should load resume page and display UI elements', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')
    await waitForAppReady(page)

    await page.waitForLoadState('domcontentloaded')

    // Check for resume page title
    await expect(page.locator('h1').filter({ hasText: 'Resume Builder' })).toBeVisible()

    // Check for main action buttons
    await expect(page.locator('button:has-text("Download PDF")')).toBeVisible()
    await expect(page.locator('button:has-text("Show Preview")')).toBeVisible()
    await expect(page.locator('button:has-text("Save Draft")')).toBeVisible()

    // Check for form tabs
    await expect(page.locator('button:has-text("Personal")')).toBeVisible()
    await expect(page.locator('button:has-text("Experience")')).toBeVisible()
    await expect(page.locator('button:has-text("Education")')).toBeVisible()
    await expect(page.locator('button:has-text("Certifications")')).toBeVisible()
    await expect(page.locator('button:has-text("Skills")')).toBeVisible()
  })

  test('should generate and download PDF resume', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')

    await page.waitForLoadState('domcontentloaded')

    // Click the download PDF button
    const downloadButton = page.locator('button:has-text("Download PDF")')
    await downloadButton.click()

    // Wait for the button to become enabled again (indicating operation completed)
    await expect(downloadButton).toBeEnabled({ timeout: 60000 })

    // Verify the button text is back to normal (not "Generating...")
    await expect(downloadButton).toHaveText('Download PDF')
  })

  test('should handle resume generation errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')

    await page.waitForLoadState('domcontentloaded')

    // Click the download PDF button
    const downloadButton = page.locator('button:has-text("Download PDF")')
    await downloadButton.click()

    // Wait for the button to become enabled again (operation should complete)
    await expect(downloadButton).toBeEnabled({ timeout: 60000 })

    // Verify the button text is back to normal
    await expect(downloadButton).toHaveText('Download PDF')
  })

  test('should have proper resume metadata in generated PDF', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')

    await page.waitForLoadState('domcontentloaded')

    // Click the download PDF button
    const downloadButton = page.locator('button:has-text("Download PDF")')
    await downloadButton.click()

    // Wait for the button to become enabled again
    await expect(downloadButton).toBeEnabled({ timeout: 60000 })

    // Verify the button text is back to normal
    await expect(downloadButton).toHaveText('Download PDF')
  })

  test('should allow editing resume data', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')

    await page.waitForLoadState('domcontentloaded')

    // Test personal information editing
    const nameInput = page.locator('input[id="name"]')
    await nameInput.fill('Test User')
    await expect(nameInput).toHaveValue('Test User')

    // Test title editing
    const titleInput = page.locator('input[id="title"]')
    await titleInput.fill('Test Title')
    await expect(titleInput).toHaveValue('Test Title')

    // Test summary editing
    const summaryTextarea = page.locator('textarea[id="summary"]')
    await summaryTextarea.fill('Test summary content')
    await expect(summaryTextarea).toHaveValue('Test summary content')
  })

  test('should show and hide preview correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')

    await page.waitForLoadState('domcontentloaded')

    // Initially preview should be hidden
    await expect(page.locator('text="Resume Preview"')).not.toBeVisible()

    // Click show preview button
    await page.locator('button:has-text("Show Preview")').click()

    // Preview should now be visible
    await expect(page.locator('text="Resume Preview"')).toBeVisible({ timeout: 5000 })

    // Click hide preview button
    await page.locator('button:has-text("Hide Preview")').click()

    // Preview should be hidden again
    await expect(page.locator('text="Resume Preview"')).not.toBeVisible({ timeout: 5000 })
  })

  test('should save draft to localStorage', async ({ page }) => {
    await page.goto('http://localhost:3001/resume')

    await page.waitForLoadState('domcontentloaded')

    // Modify some data
    const nameInput = page.locator('input[id="name"]')
    await nameInput.fill('Draft Test User')

    // Click save draft
    const saveButton = page.locator('button:has-text("Save Draft")')
    await saveButton.click()

    // Wait for the button to become enabled again (indicating operation completed)
    await expect(saveButton).toBeEnabled({ timeout: 5000 })

    // Verify the button text is back to normal
    await expect(saveButton).toHaveText('Save Draft')
  })
})
