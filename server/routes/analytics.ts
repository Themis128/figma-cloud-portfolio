import type { Request, Response } from 'express'

// HTTP status codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const handleAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[Analytics] Received request body:', JSON.stringify(req.body, null, 2))
    const { event, timestamp, url, userAgent, metrics } = req.body

    // Handle metrics/performance data requests
    if (metrics && Array.isArray(metrics)) {
      console.log('[Analytics] Metrics data received:', metrics.length, 'metrics')
      // For metrics, we don't need to validate event/userAgent fields
      // Just acknowledge receipt
      res.status(HTTP_STATUS.OK).json({ success: true, type: 'metrics' })
      return
    }

    // Handle event tracking requests
    if (event && timestamp && url && userAgent) {
      console.log('[Analytics] Event tracked:', event)
      res.status(HTTP_STATUS.OK).json({ success: true, type: 'event' })
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
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: 'Failed to process analytics' })
  }
}
