// playwright-ai-sync.ts
// Utility to ensure all Playwright tests run only if Lambda API is online

import fetch from 'node-fetch'

export async function checkLambdaOnline() {
  const LAMBDA_URL = process.env.PLAYWRIGHT_AUTOFIX_ENDPOINT || process.env.AUTOFIX_LAMBDA_URL
  if (!LAMBDA_URL) return false
  try {
    const res = await fetch(LAMBDA_URL, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

export async function skipIfLambdaOffline(test) {
  if (!(await checkLambdaOnline())) {
    test.skip('Lambda endpoint not online, skipping test')
    return true
  }
  return false
}
