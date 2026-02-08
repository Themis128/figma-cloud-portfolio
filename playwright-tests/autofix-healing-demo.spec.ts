import { expect, test } from '@playwright/test'
import { createHealingLocator, PerformanceMonitor, SelectorOptimizer } from './autofix-helpers'

test.describe('Autofix Healing Demonstration', () => {
  test('should demonstrate successful locator healing', async ({ page }) => {
    await page.goto(
      'data:text/html,<html><body><button id="dynamic-btn">Initial</button></body></html>',
    )

    const healingBtn = createHealingLocator(page, '#dynamic-btn', {
      maxRetries: 2,
      retryDelay: 100,
    })

    await healingBtn.click()

    await page.evaluate(() => {
      document.getElementById('dynamic-btn')?.remove()
      const newBtn = document.createElement('button')
      newBtn.id = 'dynamic-btn'
      newBtn.textContent = 'Healed'
      document.body.appendChild(newBtn)
    })

    await healingBtn.click()
    await expect(page.locator('#dynamic-btn')).toHaveText('Healed')
  })

  test('should demonstrate network recovery', async ({ page }) => {
    await page.route('https://mock-api.example.com/health', (route) =>
      route.fulfill({ status: 200, json: { success: true, healed: true } }),
    )

    await page.goto('data:text/html,<html><body><div id="result"></div></body></html>')

    await page.addScriptTag({
      content: `
        window.testApiWithRetry = async function(url) {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const response = await fetch(url)
              if (!response.ok) throw new Error('HTTP ' + response.status)
              const data = await response.json()
              document.getElementById('result').textContent = JSON.stringify(data)
              return data
            } catch (error) {
              if (attempt === 3) throw error
              await new Promise(r => setTimeout(r, 100))
            }
          }
        }
      `,
    })

    await page.evaluate(() => window.testApiWithRetry('https://mock-api.example.com/health'))
    await expect(page.locator('#result')).toContainText('success', { timeout: 10000 })
  })

  test('should demonstrate timing issue recovery', async ({ page }) => {
    await page.goto('data:text/html,<html><body><div id="content"></div></body></html>')

    await page.evaluate(() => {
      document.getElementById('content').textContent = 'Loaded successfully'
    })

    await expect(page.locator('#content')).toHaveText('Loaded successfully')
  })

  test('should demonstrate selector optimization in action', async ({ page }) => {
    await page.goto(
      'data:text/html,<html><body><button class="btn btn-primary" data-testid="submit-btn">Submit</button></body></html>',
    )

    const selectors = ['.btn.btn-primary', '[data-testid="submit-btn"]', 'button', 'text=Submit']

    const bestSelector = SelectorOptimizer.findBest(selectors)
    expect(bestSelector).toBe('[data-testid="submit-btn"]')
    await page.locator(bestSelector).click()
  })

  test('should demonstrate performance regression detection', async ({ page }) => {
    await page.goto('data:text/html,<html><body><h1>Performance Test</h1></body></html>')

    const monitor = new PerformanceMonitor(page)

    await monitor.mark('navigation-start')
    await page.waitForTimeout(500)
    await monitor.mark('work-complete')

    const duration = await monitor.measure('total-work', 'navigation-start', 'work-complete')
    const metrics = await monitor.getMetrics()

    expect(duration).toBeGreaterThan(400)
    expect(duration).toBeLessThan(700)
    expect(typeof metrics.ttfb).toBe('number')
  })
})
