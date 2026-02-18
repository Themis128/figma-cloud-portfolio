import type { Request, Response } from 'express'
import fetch from 'node-fetch'

// HTTP status codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Read optional server-side GA4 configuration from environment
const GA_MEASUREMENT_ID =
  process.env['GOOGLE_ANALYTICS_MEASUREMENT_ID'] || process.env['VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID'] || ''
const GA_API_SECRET = process.env['GOOGLE_ANALYTICS_API_SECRET'] || process.env['GA4_API_SECRET'] || ''

export const handleAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[Analytics] Received request body:', JSON.stringify(req.body, null, 2))
    const { event, timestamp, url, userAgent, metrics, clientId, eventId, data } = req.body

    // Handle metrics/performance data requests (do not forward these to GA MP)
    if (metrics && Array.isArray(metrics)) {
      console.log('[Analytics] Metrics data received:', metrics.length, 'metrics')
      res.status(HTTP_STATUS.OK).json({ success: true, type: 'metrics' })
      return
    }

    // Validate required event payload fields for event tracking requests
    if (event && timestamp && url && userAgent) {
      console.log('[Analytics] Event tracked:', event)

      // Optional: forward to GA4 Measurement Protocol when configured
      if (GA_MEASUREMENT_ID && GA_API_SECRET) {
        const mpUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`
        const mpDebugUrl = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`

        const mpPayload = {
          client_id: clientId || `server-${Math.floor(Date.now() / 1000)}`,
          events: [
            {
              name: event,
              params: {
                ...(data || {}),
                page_location: url,
                event_id: eventId || `${Date.now()}`,
                timestamp,
              },
            },
          ],
        }

        try {
          const target = process.env['NODE_ENV'] === 'development' ? mpDebugUrl : mpUrl
          const response = await fetch(target, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': userAgent,
            },
            body: JSON.stringify(mpPayload),
          })

          if (!response.ok) {
            const text = await response.text()
            console.error('[Analytics] Measurement Protocol forward failed:', response.status, text)
          } else if (process.env['NODE_ENV'] === 'development') {
            const json = await response.json()
            console.log('[Analytics] MP debug response:', JSON.stringify(json))
          }
        } catch (err) {
          console.error('[Analytics] Measurement Protocol request error:', err)
        }
      }

      res.status(HTTP_STATUS.OK).json({ success: true, type: 'event', forwarded: !!(GA_MEASUREMENT_ID && GA_API_SECRET) })
      return
    }

    // If neither metrics nor complete event data, validation fails
    console.log('[Analytics] Validation failed:', {
      hasEvent: !!event,
      hasTimestamp: !!timestamp,
      hasUrl: !!url,
      hasUserAgent: !!userAgent,
      hasMetrics: !!metrics,
    })
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Invalid request format' })
    return
  } catch (error) {
    console.error('[Analytics] Error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to process analytics' })
  }
}
