// playwright-openllm-reporter.ts
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter'
import fetch from 'node-fetch'

const OPENLLM_ENDPOINT = process.env.OPENLLM_ENDPOINT || 'http://localhost:3000'
const OPENLLM_MODEL = process.env.OPENLLM_MODEL || 'llama2'

class OpenLLMReporter implements Reporter {
  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      const errorInfo = {
        title: test.title,
        error: result.error?.message,
        stack: result.error?.stack,
        file: test.location.file,
        line: test.location.line,
      }
      // OpenLLM API call
      const response = await fetch(`${OPENLLM_ENDPOINT}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Suggest a fix for this Playwright test failure:\n${JSON.stringify(errorInfo, null, 2)}`,
          model: OPENLLM_MODEL,
          max_new_tokens: 200,
        }),
      })
      const _suggestion = await response.json()
      // Optionally, save or apply the suggestion automatically
    }
  }
}

export default OpenLLMReporter
