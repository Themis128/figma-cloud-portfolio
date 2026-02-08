/**
 * Playwright Autofix Utilities
 *
 * This module provides helper functions for:
 * - Auto-healing locators
 * - Smart element waiting
 * - Selector optimization
 * - Performance-aware test helpers
 */

import type { Locator, Page } from '@playwright/test'

/**
 * Configuration for autofix utilities
 */
export interface AutofixOptions {
  /** Maximum retries for healing */
  maxRetries?: number
  /** Delay between retries (ms) */
  retryDelay?: number
  /** Enable selector optimization suggestions */
  optimizeSelectors?: boolean
  /** Enable performance monitoring */
  monitorPerformance?: boolean
}

/**
 * Default autofix options
 */
const DEFAULT_OPTIONS: Required<AutofixOptions> = {
  maxRetries: 3,
  retryDelay: 500,
  optimizeSelectors: true,
  monitorPerformance: true,
}

/**
 * Create an auto-healing locator that automatically retries on stale element errors
 */
export function createHealingLocator(
  page: Page,
  selector: string,
  options: AutofixOptions = {},
): HealingLocator {
  return new HealingLocator(page, selector, { ...DEFAULT_OPTIONS, ...options })
}

/**
 * HealingLocator class that automatically handles stale element errors
 */
export class HealingLocator {
  private page: Page
  private selector: string
  private options: Required<AutofixOptions>
  private attempts = 0

  constructor(page: Page, selector: string, options: Required<AutofixOptions>) {
    this.page = page
    this.selector = selector
    this.options = options
  }

  /**
   * Click with automatic healing on stale element
   */
  async click(options?: Parameters<Locator['click']>[0]): Promise<void> {
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        await this.page.locator(this.selector).click(options)
        this.attempts = 0
        return
      } catch (error: unknown) {
        if (this.isStaleError(error) && attempt < this.options.maxRetries) {
          this.attempts = attempt
          await this.heal()
          continue
        }
        throw error
      }
    }
  }

  /**
   * Fill with automatic healing
   */
  async fill(value: string, options?: Parameters<Locator['fill']>[0]): Promise<void> {
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        await this.page.locator(this.selector).fill(value, options)
        this.attempts = 0
        return
      } catch (error: unknown) {
        if (this.isStaleError(error) && attempt < this.options.maxRetries) {
          this.attempts = attempt
          await this.heal()
          continue
        }
        throw error
      }
    }
  }

  /**
   * Check if element is visible with healing
   */
  async isVisible(options?: Parameters<Locator['isVisible']>[0]): Promise<boolean> {
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const result = await this.page.locator(this.selector).isVisible(options)
        this.attempts = 0
        return result
      } catch (error: unknown) {
        if (this.isStaleError(error) && attempt < this.options.maxRetries) {
          this.attempts = attempt
          await this.heal()
          continue
        }
        throw error
      }
    }
    return false
  }

  /**
   * Wait for element with automatic healing
   */
  async waitFor(options?: Parameters<Locator['waitFor']>[0]): Promise<void> {
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        await this.page.locator(this.selector).waitFor(options)
        this.attempts = 0
        return
      } catch (error: unknown) {
        if (this.isStaleError(error) && attempt < this.options.maxRetries) {
          this.attempts = attempt
          await this.heal()
          continue
        }
        throw error
      }
    }
  }

  /**
   * Get text content with healing
   */
  async textContent(): Promise<string | null> {
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const result = await this.page.locator(this.selector).textContent()
        this.attempts = 0
        return result
      } catch (error: unknown) {
        if (this.isStaleError(error) && attempt < this.options.maxRetries) {
          this.attempts = attempt
          await this.heal()
          continue
        }
        throw error
      }
    }
    return null
  }

  /**
   * Check if error is a stale element error
   */
  private isStaleError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error)
    return (
      message.includes('stale') ||
      message.includes('detached') ||
      message.includes('not attached') ||
      message.includes('element is detached')
    )
  }

  /**
   * Heal the locator by waiting for stability
   */
  private async heal(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle')

    // Add small delay for React to complete re-renders
    await this.page.waitForTimeout(this.options.retryDelay)

    // Log healing attempt
    if (this.options.monitorPerformance) {
      console.log(
        `🔧 Healing locator "${this.selector}" (attempt ${this.attempts}/${this.options.maxRetries})`,
      )
    }
  }

  /**
   * Get the original selector
   */
  getSelector(): string {
    return this.selector
  }

  /**
   * Get the number of healing attempts
   */
  getHealAttempts(): number {
    return this.attempts
  }
}

/**
 * Smart waiter that automatically handles common async issues
 */
export class SmartWaiter {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Wait for element to be stable (not animating, visible, attached)
   */
  async waitForStable(
    selector: string,
    options?: {
      timeout?: number
      state?: 'attached' | 'detached' | 'visible' | 'hidden'
    },
  ): Promise<void> {
    const timeout = options?.timeout ?? 10000
    const state = options?.state ?? 'visible'

    // First ensure the element is attached
    await this.page.locator(selector).waitFor({ state: 'attached', timeout })

    // Wait for it to be visible
    await this.page.locator(selector).waitFor({ state, timeout })

    // Small delay to ensure animations complete
    await this.page.waitForTimeout(100)
  }

  /**
   * Wait for network to be idle with custom timeout
   */
  async waitForNetworkIdle(timeout = 30000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout })
    } catch {
      // If network idle timeout, try waiting for domcontentloaded instead
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 })
    }
  }

  /**
   * Wait for API response with automatic polling
   */
  async waitForApi(
    urlPattern: string | RegExp,
    options?: {
      timeout?: number
      method?: string
    },
  ): Promise<void> {
    const timeout = options?.timeout ?? 10000
    const method = options?.method ?? 'GET'

    try {
      // First try to wait for the response
      await this.page.waitForResponse(
        (response) => {
          const matchesUrl =
            typeof urlPattern === 'string'
              ? response.url().includes(urlPattern)
              : urlPattern.test(response.url())
          return matchesUrl && response.request().method() === method
        },
        { timeout },
      )
    } catch {
      // If no response, wait for network idle as fallback
      await this.waitForNetworkIdle(timeout)
    }
  }

  /**
   * Wait for element to have specific text
   */
  async waitForText(
    selector: string,
    expectedText: string | RegExp,
    timeout = 10000,
  ): Promise<void> {
    await this.page.waitForFunction(
      (args) => {
        const sel = args.selector
        const text = args.text
        const element = document.querySelector(sel)
        if (!element) return false
        const elementText = element.textContent || ''
        if (typeof text === 'object' && text instanceof RegExp) {
          return text.test(elementText)
        }
        return elementText.includes(text)
      },
      { timeout },
      { selector, text: expectedText },
    )
  }

  /**
   * Wait for element count to reach expected value
   */
  async waitForCount(selector: string, expectedCount: number, timeout = 10000): Promise<void> {
    await this.page.waitForFunction(
      (sel, count) => {
        return document.querySelectorAll(sel).length === count
      },
      { timeout },
      selector,
      expectedCount,
    )
  }
}

/**
 * Suggest better selectors for an element
 */
export function suggestSelectors(selector: string): string[] {
  const suggestions: string[] = []

  // Suggest data-testid if not present
  if (!selector.includes('data-testid')) {
    suggestions.push(`[data-testid="${selector.replace(/[^a-zA-Z0-9-_]/g, '')}"]`)
  }

  // Suggest semantic alternatives
  if (selector.startsWith('#') || selector.startsWith('.')) {
    // It's an ID or class selector
    const tagMatch = selector.match(/^[a-zA-Z]+/)
    if (tagMatch) {
      const tag = tagMatch[0]
      // Suggest role-based selector
      suggestions.push(`[role="${tag}"]`)
    }
  }

  // Suggest text-based selector
  const textMatch = selector.match(/text=\[([^\]]+)\]/)
  if (textMatch) {
    const text = textMatch[1]
    suggestions.push(`text="${text}"`)
  }

  // Suggest more specific selector
  if (selector.includes('nth=')) {
    const baseSelector = selector.replace(/,nth=\d+/, '')
    suggestions.push(baseSelector)
  }

  return suggestions
}

/**
 * Get the best selector type priority
 */
export function getSelectorPriority(selector: string): number {
  // Priority: data-testid > role > text > id > class > tag
  if (selector.includes('data-testid')) return 1
  if (selector.includes('role=')) return 2
  if (selector.includes('text=')) return 3
  if (selector.startsWith('#')) return 4
  if (selector.startsWith('.')) return 5
  if (/^[a-zA-Z]/.test(selector)) return 6
  return 10
}

/**
 * Find the best selector from multiple options
 */
export function findBestSelector(selectors: string[]): string {
  return selectors.sort((a, b) => getSelectorPriority(a) - getSelectorPriority(b))[0]
}

/**
 * Performance monitor for tests
 */
export class PerformanceMonitor {
  private page: Page
  private metrics: Map<string, number> = new Map()
  private marks: Map<string, number> = new Map()

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Start a performance mark
   */
  async mark(name: string): Promise<void> {
    await this.page.evaluate((markName) => {
      performance.mark(markName)
    }, name)
    this.marks.set(name, Date.now())
  }

  /**
   * End a performance mark and record duration
   */
  async measure(name: string, startMark: string, endMark?: string): Promise<number> {
    const duration = await this.page.evaluate(
      (args) => {
        performance.measure(args.name, args.startMark, args.endMark)
        const measure = performance.getEntriesByName(args.name)[0]
        return measure.duration
      },
      { name, startMark, endMark },
    )

    this.metrics.set(name, duration)
    return duration
  }

  /**
   * Get current page performance metrics
   */
  async getMetrics(): Promise<{
    fcp: number
    lcp: number
    ttfb: number
    domSize: number
  }> {
    const metrics = await this.page.evaluate(() => {
      const fcp = performance
        .getEntriesByType('paint')
        .find((e) => e.name === 'first-contentful-paint')
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming
      const lcp = performance
        .getEntriesByType('paint')
        .find((e) => e.name === 'largest-contentful-paint')

      return {
        fcp: fcp?.startTime || 0,
        lcp: (lcp as PerformanceEntry)?.startTime || 0,
        ttfb: navigation?.responseStart || 0,
        domSize: document.querySelectorAll('*').length,
      }
    })

    return metrics
  }

  /**
   * Log performance summary
   */
  async logSummary(): Promise<void> {
    const metrics = await this.getMetrics()
    console.log('\n📊 Performance Metrics:')
    console.log(`   FCP: ${metrics.fcp.toFixed(2)}ms`)
    console.log(`   LCP: ${metrics.lcp.toFixed(2)}ms`)
    console.log(`   TTFB: ${metrics.ttfb.toFixed(2)}ms`)
    console.log(`   DOM Size: ${metrics.domSize} elements`)
  }
}

/**
 * SelectorOptimizer class for optimizing and suggesting better selectors
 */
export class SelectorOptimizer {
  /**
   * Suggest better selectors for an element
   */
  static suggest(selector: string): string[] {
    return suggestSelectors(selector)
  }

  /**
   * Find the best selector from multiple options
   */
  static findBest(selectors: string[]): string {
    return findBestSelector(selectors)
  }
}
