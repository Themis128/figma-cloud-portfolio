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
    const { event, timestamp, url, userAgent } = req.body

    // Basic validation
    if (!(event && timestamp && url && userAgent)) {
      console.log('[Analytics] Validation failed:', { event, timestamp, url, userAgent })
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: 'Missing required fields' })
      return
    }

    console.log('[Analytics] Event tracked:', event)
    // Respond with success
    res.status(HTTP_STATUS.OK).json({ success: true })
  } catch (error) {
    console.error('[Analytics] Error:', error)
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: 'Failed to process analytics' })
  }
}
