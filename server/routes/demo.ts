import type { DemoResponse } from '@shared/api'
import type { RequestHandler } from 'express'

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
} as const

export const handleDemo: RequestHandler = (_req, res) => {
  const response: DemoResponse = {
    message: 'Hello from Express server',
  }
  res.status(HTTP_STATUS.OK).json(response)
}
