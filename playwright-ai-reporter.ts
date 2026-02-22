// playwright-ai-reporter.ts
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter'
import fetch from 'node-fetch'

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || ''
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || ''
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4'

class AIReporter implements Reporter {
  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      const errorInfo = {
        title: test.title,
        error: result.error?.message,
        stack: result.error?.stack,
        file: test.location.file,
        line: test.location.line,
      }
      // Azure OpenAI API call
      const response = await fetch(
        `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/completions?api-version=2023-05-15`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_OPENAI_API_KEY,
          },
          body: JSON.stringify({
            prompt: `Suggest a fix for this Playwright test failure:\n${JSON.stringify(errorInfo, null, 2)}`,
            max_tokens: 200,
            temperature: 0.2,
          }),
        },
      )
      const _suggestion = await response.json()
      // Optionally, save or apply the suggestion automatically
    }
  }
}

export default AIReporter
