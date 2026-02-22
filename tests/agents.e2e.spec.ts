import { test, expect } from '@playwright/test'

// E2E test for the /agents page: template selection, creation, and agent build flow

test.describe('AI Agent Builder E2E', () => {
  test('User can view, select, and build an agent from a template', async ({ page }) => {
    // Go to the agents page
    await page.goto('http://localhost:8082/agents')

    // Wait for the header
    const header = page.getByRole('heading', { name: /AI Agent Builder/i })
    await header.waitFor({ state: 'visible', timeout: 10000 })
    await expect(header).toBeVisible({ timeout: 10000 })

    // Select a template (first visible template card)
    const templateCard = page.locator('[data-testid="template-card"]').first()
    await templateCard.waitFor({ state: 'visible', timeout: 10000 })
    await expect(templateCard).toBeVisible({ timeout: 10000 })
    await templateCard.click()

    // Wait for the template configuration view
    const configHeader = page.getByRole('heading', { name: /Ready to Build Your Agent/i })
    await configHeader.waitFor({ state: 'visible', timeout: 10000 })
    await expect(configHeader).toBeVisible({ timeout: 10000 })

    // Start building the agent
    const startButton = page.getByRole('button', { name: /Start Building Agent/i })
    await startButton.waitFor({ state: 'visible', timeout: 10000 })
    await startButton.click()

    // Wait for AgentBuilder to load
    const saveButton = page.getByRole('button', { name: /Save/i })
    await saveButton.waitFor({ state: 'visible', timeout: 10000 })
    await expect(saveButton).toBeVisible({ timeout: 10000 })

    // Optionally, run the agent (if UI supports it)
    const runButton = page.getByRole('button', { name: /Run Agent/i })
    if (await runButton.isVisible()) {
      await runButton.waitFor({ state: 'visible', timeout: 10000 })
      await runButton.click()
      const resultText = page.getByText(/Execution Result|Result/i)
      await resultText.waitFor({ state: 'visible', timeout: 10000 })
      await expect(resultText).toBeVisible({ timeout: 10000 })
    }

    // Save the agent
    await saveButton.click()
    // Should return to template selection
    const templateSelectButton = page.getByRole('button', { name: 'Template Selection' })
    await templateSelectButton.waitFor({ state: 'visible', timeout: 10000 })
    await expect(templateSelectButton).toBeVisible({ timeout: 10000 })
  })
})
