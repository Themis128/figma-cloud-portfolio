import { test, expect } from '@playwright/test'

// E2E test for the /agents page: template selection, creation, and agent build flow

test.describe('AI Agent Builder E2E', () => {
  test('User can view, select, and build an agent from a template', async ({ page }) => {
    // Go to the agents page
    await page.goto('http://localhost:8082/agents')

    // Wait for the header
    await expect(page.getByRole('heading', { name: /AI Agent Builder/i })).toBeVisible()

    // Select a template (first visible template card)
    const templateCard = page.locator('[data-testid="template-card"]').first()
    await expect(templateCard).toBeVisible()
    await templateCard.click()

    // Wait for the template configuration view
    await expect(page.getByRole('heading', { name: /Ready to Build Your Agent/i })).toBeVisible()

    // Start building the agent
    await page.getByRole('button', { name: /Start Building Agent/i }).click()

    // Wait for AgentBuilder to load
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()

    // Optionally, run the agent (if UI supports it)
    if (await page.getByRole('button', { name: /Run Agent/i }).isVisible()) {
      await page.getByRole('button', { name: /Run Agent/i }).click()
      await expect(page.getByText(/Execution Result|Result/i)).toBeVisible()
    }

    // Save the agent
    await page.getByRole('button', { name: /Save/i }).click()
    // Should return to template selection
    await expect(page.getByText(/custom template|template/i, { exact: false })).toBeVisible()
  })
})
