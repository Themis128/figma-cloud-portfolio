/**
 * Playwright AI Autofix Reporter
 *
 * Real-time integration with Lambda-based AI autofix service.
 * Provides intelligent test failure analysis and fix suggestions.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import type { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter'

// Configuration
interface AutofixReporterConfig {
  endpoint?: string
  enabled?: boolean
  outputPath?: string
  realTimeConfig?: boolean
  autoApplyFixes?: boolean
  maxSuggestions?: number
}

// Types
interface FixSuggestion {
  type: 'selector' | 'timeout' | 'wait' | 'assertion' | 'action' | 'config'
  confidence: number
  suggestion: string
  code?: string
  documentation?: string
}

interface AutofixResponse {
  success: boolean
  suggestions: FixSuggestion[]
  autoFixable: boolean
  recommendedAction: string
  metadata: {
    processingTime: number
    model: string
    version: string
  }
}

interface TestFailure {
  testTitle: string
  file: string
  line?: number
  error: {
    message: string
    stack?: string
  }
  selector?: string
  timeout?: number
  suggestions: FixSuggestion[]
  autoFixable: boolean
  timestamp: string
}

interface RealTimeConfig {
  environment: string
  timeouts: Record<string, number>
  retries: number
  workers: number
  autofixEnabled: boolean
  lastUpdated: string
}

class AIAutofixReporter implements Reporter {
  private config: AutofixReporterConfig
  private endpoint: string
  private failures: TestFailure[] = []
  private testCount = 0
  private passedCount = 0
  private failedCount = 0
  private healedCount = 0
  private startTime = 0
  private realTimeConfig: RealTimeConfig | null = null

  constructor(options: AutofixReporterConfig = {}) {
    this.config = {
      endpoint: process.env.PLAYWRIGHT_AUTOFIX_ENDPOINT || process.env.AUTOFIX_LAMBDA_URL || '',
      enabled: true,
      outputPath: 'playwright-report/autofix-report.json',
      realTimeConfig: true,
      autoApplyFixes: false,
      maxSuggestions: 5,
      ...options,
    }
    this.endpoint = this.config.endpoint || ''
    this.startTime = Date.now()
  }

  async onBegin(_config: FullConfig) {
    this.testCount = 0

    // Fetch real-time configuration if enabled
    if (this.config.realTimeConfig) {
      await this.fetchRealTimeConfig()
    }
    if (this.endpoint) {
    } else {
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    this.testCount++

    if (result.status === 'passed') {
      this.passedCount++
      return
    }

    if (result.status === 'failed') {
      this.failedCount++

      // Extract failure details
      const failure: TestFailure = {
        testTitle: test.title,
        file: test.location.file,
        line: test.location.line,
        error: {
          message: result.error?.message || 'Unknown error',
          stack: result.error?.stack,
        },
        selector: this.extractSelector(result.error?.message || ''),
        timeout: this.extractTimeout(result.error?.message || ''),
        suggestions: [],
        autoFixable: false,
        timestamp: new Date().toISOString(),
      }

      // Get suggestions from Lambda or local analysis
      try {
        const suggestions = await this.getAutofixSuggestions(failure)
        failure.suggestions = suggestions.slice(0, this.config.maxSuggestions || 5)
        failure.autoFixable = suggestions.some((s) => s.confidence >= 0.9)

        if (failure.autoFixable) {
          this.healedCount++
        }
      } catch (_error) {
        // Use local fallback
        failure.suggestions = this.getLocalSuggestions(failure)
      }

      this.failures.push(failure)

      // Print real-time feedback
      this.printFailureReport(failure)
    }
  }

  async onEnd() {
    const duration = Date.now() - this.startTime

    // Generate summary report
    await this.generateReport(duration)

    // Print summary
    this.printSummary(duration)
  }

  private async fetchRealTimeConfig(): Promise<void> {
    if (!this.endpoint) return

    try {
      const response = await fetch(`${this.endpoint.replace('/autofix', '/config')}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        this.realTimeConfig = (await response.json()) as RealTimeConfig
      }
    } catch {
      // Silently fail - use local config
    }
  }

  private async getAutofixSuggestions(failure: TestFailure): Promise<FixSuggestion[]> {
    // Try Lambda endpoint first
    if (this.endpoint) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testTitle: failure.testTitle,
            error: failure.error,
            file: failure.file,
            line: failure.line,
            selector: failure.selector,
            timeout: failure.timeout,
          }),
        })

        if (response.ok) {
          const data = (await response.json()) as AutofixResponse
          return data.suggestions
        }
      } catch (_error) {}
    }

    // Fallback to local analysis
    return this.getLocalSuggestions(failure)
  }

  private getLocalSuggestions(failure: TestFailure): FixSuggestion[] {
    const suggestions: FixSuggestion[] = []
    const errorMsg = failure.error.message.toLowerCase()

    // Selector issues
    if (/not found|not visible|not attached/i.test(errorMsg)) {
      suggestions.push({
        type: 'selector',
        confidence: 0.9,
        suggestion: 'Element not found or not visible. Add explicit wait.',
        code: `await page.locator('selector').waitFor({ state: 'visible' });`,
        documentation: 'https://playwright.dev/docs/api/class-locator#locator-wait-for',
      })
    }

    // Timeout issues
    if (/timeout|timed out/i.test(errorMsg)) {
      suggestions.push({
        type: 'timeout',
        confidence: 0.85,
        suggestion: 'Operation timed out. Consider increasing timeout or adding wait.',
        code: `await expect(locator).toBeVisible({ timeout: 30000 });`,
      })
    }

    // Click intercepted
    if (/click intercepted/i.test(errorMsg)) {
      suggestions.push({
        type: 'action',
        confidence: 0.95,
        suggestion: 'Click intercepted. Use force click or wait for overlay.',
        code: `await locator.click({ force: true });`,
      })
    }

    // Snapshot mismatch
    if (/snapshot|mismatch/i.test(errorMsg)) {
      suggestions.push({
        type: 'assertion',
        confidence: 0.8,
        suggestion: 'Visual snapshot mismatch. Review or update baseline.',
        code: `npx playwright test --update-snapshots`,
      })
    }

    return suggestions
  }

  private extractSelector(errorMsg: string): string | undefined {
    const patterns = [
      /locator\(['"]([^'"]+)['"]\)/i,
      /getBy\w+\(['"]([^'"]+)['"]\)/i,
      /selector:\s*['"]([^'"]+)['"]/i,
    ]

    for (const pattern of patterns) {
      const match = errorMsg.match(pattern)
      if (match) return match[1]
    }

    return undefined
  }

  private extractTimeout(errorMsg: string): number | undefined {
    const match = errorMsg.match(/timeout[:\s]+(\d+)/i)
    if (match) return parseInt(match[1], 10)

    const msMatch = errorMsg.match(/(\d+)\s*ms/i)
    if (msMatch) return parseInt(msMatch[1], 10)

    return undefined
  }

  private printFailureReport(failure: TestFailure) {
    if (failure.suggestions.length > 0) {
      failure.suggestions.forEach((suggestion, _index) => {
        if (suggestion.code) {
        }
      })

      if (failure.autoFixable) {
      }
    }
  }

  private printSummary(_duration: number) {
    const _healthScore = this.calculateHealthScore()

    if (this.realTimeConfig) {
    }

    if (this.failures.length > 0) {
      const prioritized = this.failures
        .flatMap((f) => f.suggestions.map((s) => ({ ...s, test: f.testTitle })))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)

      prioritized.forEach((_item, _index) => {})
    }
  }

  private calculateHealthScore(): number {
    if (this.testCount === 0) return 100
    const passRate = (this.passedCount / this.testCount) * 100
    const healBonus = this.healedCount * 2 // Bonus for auto-fixable tests
    return Math.min(100, Math.round(passRate + healBonus))
  }

  private async generateReport(duration: number): Promise<void> {
    const report = {
      summary: {
        total: this.testCount,
        passed: this.passedCount,
        failed: this.failedCount,
        healed: this.healedCount,
        duration,
        healthScore: this.calculateHealthScore(),
        timestamp: new Date().toISOString(),
      },
      realTimeConfig: this.realTimeConfig,
      failures: this.failures,
      recommendations: this.generateRecommendations(),
    }

    // Ensure output directory exists
    const outputDir = path.dirname(
      this.config.outputPath || 'playwright-report/autofix-report.json',
    )
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write report
    const outputPath = this.config.outputPath || 'playwright-report/autofix-report.json'
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    // Analyze failure patterns
    const selectorFailures = this.failures.filter((f) =>
      f.suggestions.some((s) => s.type === 'selector'),
    ).length

    if (selectorFailures > 2) {
      recommendations.push('Consider using data-testid attributes for more reliable selectors')
    }

    const timeoutFailures = this.failures.filter((f) =>
      f.suggestions.some((s) => s.type === 'timeout'),
    ).length

    if (timeoutFailures > 2) {
      recommendations.push(
        'Multiple timeout failures - consider increasing global timeout in config',
      )
    }

    const lowConfidenceFailures = this.failures.filter((f) => !f.autoFixable).length

    if (lowConfidenceFailures > this.failures.length / 2) {
      recommendations.push('Many failures need manual review - check test stability')
    }

    return recommendations
  }
}

export default AIAutofixReporter
