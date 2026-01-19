import { expect, test } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('should respond to /api/ping with pong', async ({ request }) => {
    const response = await request.get('/api/ping')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toBe('ping pong')
  })

  test('should respond to /api/demo with demo data', async ({ request }) => {
    const response = await request.get('/api/demo')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toBe('Hello from Express server')
  })

  test('should handle push notifications VAPID key endpoint', async ({ request }) => {
    const response = await request.get('/api/push-notifications?action=vapid-public-key')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('publicKey')
    expect(typeof data.publicKey).toBe('string')
    expect(data.publicKey.length).toBeGreaterThan(0)
  })

  test('should handle 404 for non-existent API endpoints', async ({ request }) => {
    const response = await request.get('/api/non-existent')
    expect(response.status()).toBe(404)
  })
})
