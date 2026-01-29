import type { Handler } from 'aws-lambda'
import type { DemoResponse } from '../../../shared/api'

export const handler: Handler = async (event) => {
  const response: DemoResponse = {
    message: 'Hello from AWS Lambda',
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
    body: JSON.stringify(response),
  }
}
