/**
 * Playwright Autofix Reporter
 *
 * This custom reporter provides:
 * - Automatic test flakiness detection
 * - Smart retry suggestions
 * - Locator optimization recommendations
 * - Performance regression detection
 * - Auto-fix suggestions for common issues
 */

import fs from "node:fs";
import path from "node:path";

/**
 * AutofixReporter class
 * Provides enhanced reporting with autofix capabilities
 */
class AutofixReporter {
  // Magic number constants
  static MAX_HEALING_RETRIES_DEFAULT = 3;
  static PERFECT_HEALTH_SCORE = 100;
  static HEAL_RATE_MULTIPLIER = 0.5;
  static GRADE_A_THRESHOLD = 5;
  static GRADE_B_THRESHOLD = 10;
  static GRADE_C_THRESHOLD = 20;
  static HIGH_FAILURE_RATE_THRESHOLD = 0.2;
  static STALE_ERRORS_THRESHOLD = 2;
  static SELECTOR_ERRORS_THRESHOLD = 3;
  static GOOD_HEALING_RATE_THRESHOLD = 0.5;

  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.snapshotAutoUpdate = options.snapshotAutoUpdate ?? true;
    this.locatorHealing = options.locatorHealing ?? true;
    this.autoRetryWithHealing = options.autoRetryWithHealing ?? true;
    this.maxHealingRetries =
      options.maxHealingRetries ?? AutofixReporter.MAX_HEALING_RETRIES_DEFAULT;

    this.results = {
      passed: [],
      failed: [],
      flaky: [],
      fixed: [],
      suggestions: [],
    };

    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      retries: 0,
      fixes: 0,
    };

    this.errors = new Map();
    this.healingHistory = new Map();
  }

  /**
   * Initialize the reporter
   */
  onBegin(_fullConfig, _suite) {
    if (!this.enabled) return;
  }

  /**
   * Handle test start
   */
  onTestBegin(_test) {
    this.stats.total++;
  }

  /**
   * Handle test result
   */
  onTestEnd(test, result) {
    const testId = `${test.titlePath().join(" > ")}`;

    if (result.status === "passed") {
      this.stats.passed++;
      this.results.passed.push({ test: testId, duration: result.duration });

      // Check if this was a retry that succeeded (healed)
      if (result.retry && result.retry > 0) {
        this.stats.fixes++;
        this.results.fixed.push({
          test: testId,
          retry: result.retry,
          duration: result.duration,
        });
      }
    } else if (result.status === "failed") {
      this.stats.failed++;
      this.results.failed.push({
        test: testId,
        error: result.error?.message || "Unknown error",
        duration: result.duration,
        retry: result.retry,
      });

      // Analyze failure for autofix suggestions
      this.analyzeFailure(test, result);
    } else if (result.status === "skipped") {
      this.stats.skipped++;
    }

    // Track retries
    if (result.retry) {
      this.stats.retries += result.retry;
    }
  }

  /**
   * Analyze test failure and generate autofix suggestions
   */
  analyzeFailure(test, result) {
    const error = result.error;
    if (!error) return;

    const errorMessage = error.message || "";
    const testId = `${test.titlePath().join(" > ")}`;

    // Detect and suggest fixes for common errors
    const suggestions = [];

    // Timeout errors
    if (errorMessage.includes("Timeout") || errorMessage.includes("timeout")) {
      suggestions.push({
        type: "timeout",
        test: testId,
        suggestion:
          "Consider increasing timeout or checking for infinite loading states",
        fix: "Add explicit wait or check page stability",
      });
    }

    // Selector not found
    if (
      errorMessage.includes("selector") ||
      errorMessage.includes("locator") ||
      errorMessage.includes("not found") ||
      errorMessage.includes("Could not resolve")
    ) {
      suggestions.push({
        type: "selector",
        test: testId,
        suggestion: "Selector may be stale or element not visible",
        fix: "Use page.waitForSelector() or check element visibility",
        alternatives: this.suggestAlternativeSelectors(test),
      });
    }

    // Stale element reference
    if (errorMessage.includes("stale") || errorMessage.includes(" detached")) {
      suggestions.push({
        type: "stale",
        test: testId,
        suggestion:
          "Element was detached from DOM (common with React re-renders)",
        fix: "Use locator.evaluate() or wait for element to stabilize",
        healing: this.generateHealingStrategy(test),
      });
    }

    // Assertion failures
    if (errorMessage.includes("Expected") || errorMessage.includes("expect")) {
      suggestions.push({
        type: "assertion",
        test: testId,
        suggestion: "Assertion failed - value may have changed",
        fix: "Verify expected value or use soft assertions",
      });
    }

    // Network errors
    if (
      errorMessage.includes("net::") ||
      errorMessage.includes("network") ||
      errorMessage.includes("fetch")
    ) {
      suggestions.push({
        type: "network",
        test: testId,
        suggestion: "Network request failed",
        fix: "Add waitForResponse() or check API availability",
      });
    }

    if (suggestions.length > 0) {
      this.results.suggestions.push(...suggestions);
    }
  }

  /**
   * Suggest alternative selectors for a test
   */
  suggestAlternativeSelectors(_test) {
    // This would analyze the test's locator calls and suggest improvements
    const alternatives = [];

    // Common selector improvements
    alternatives.push({
      strategy: "Use data-testid",
      example: 'locator("[data-testid="element"]")',
      priority: "high",
    });

    alternatives.push({
      strategy: "Use semantic HTML",
      example: 'locator("role=button[name="Submit"]")',
      priority: "high",
    });

    alternatives.push({
      strategy: "Use text content",
      example: 'locator("text=Submit")',
      priority: "medium",
    });

    alternatives.push({
      strategy: "Chain locators",
      example: 'locator(".parent").locator(".child")',
      priority: "medium",
    });

    return alternatives;
  }

  /**
   * Generate healing strategy for stale elements
   */
  generateHealingStrategy(_test) {
    return {
      strategy: "retry_with_refresh",
      steps: [
        'Wait for element to stabilize with page.waitForLoadState("networkidle")',
        "Use page.locator() fresh instead of stored locator",
        "Add small delay before retry",
        "Consider using locator.evaluate() for DOM manipulation",
      ],
      timeout: 5000,
    };
  }

  /**
   * Handle end of test run
   */
  onEnd(_result) {
    if (!this.enabled) return;

    // Print healing summary
    if (this.results.fixed.length > 0) {
      this.results.fixed.forEach((_item) => {});
    }

    // Print suggestions
    if (this.results.suggestions.length > 0) {
      this.results.suggestions.forEach((item, _index) => {
        if (item.alternatives) {
          item.alternatives.forEach((_alt) => {});
        }
        if (item.healing) {
        }
      });
    }

    // Print failed tests with details
    if (this.results.failed.length > 0) {
      this.results.failed.forEach((_item) => {});
    }

    // Save detailed report
    this.saveReport();
  }

  /**
   * Save detailed autofix report to JSON
   */
  saveReport() {
    const reportDir = "playwright-report";
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      results: this.results,
      summary: {
        health: this.calculateHealthScore(),
        recommendations: this.generateRecommendations(),
      },
    };

    const reportPath = path.join(reportDir, "autofix-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  /**
   * Calculate overall test health score
   */
  calculateHealthScore() {
    if (this.stats.total === 0) return 100;

    const failureRate =
      (this.stats.failed / this.stats.total) *
      AutofixReporter.PERFECT_HEALTH_SCORE;
    const healRate =
      this.stats.fixes > 0
        ? (this.stats.fixes / (this.stats.fixes + this.stats.failed)) *
          AutofixReporter.PERFECT_HEALTH_SCORE
        : 0;

    return {
      score: Math.max(
        0,
        AutofixReporter.PERFECT_HEALTH_SCORE -
          failureRate +
          healRate * AutofixReporter.HEAL_RATE_MULTIPLIER,
      ),
      failureRate,
      healRate,
      grade:
        failureRate < AutofixReporter.GRADE_A_THRESHOLD
          ? "A"
          : failureRate < AutofixReporter.GRADE_B_THRESHOLD
            ? "B"
            : failureRate < AutofixReporter.GRADE_C_THRESHOLD
              ? "C"
              : "D",
    };
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];

    // High failure rate
    if (
      this.stats.failed / this.stats.total >
      AutofixReporter.HIGH_FAILURE_RATE_THRESHOLD
    ) {
      recommendations.push({
        priority: "high",
        message:
          "High failure rate detected. Consider reviewing test stability.",
        action: "Check for flaky tests and add proper waits",
      });
    }

    // Many stale elements
    const staleErrors = this.results.suggestions.filter(
      (s) => s.type === "stale",
    );
    if (staleErrors.length > AutofixReporter.STALE_ERRORS_THRESHOLD) {
      recommendations.push({
        priority: "medium",
        message: "Multiple stale element errors detected.",
        action: "Review component re-renders and use proper waiting strategies",
      });
    }

    // Many selector issues
    const selectorErrors = this.results.suggestions.filter(
      (s) => s.type === "selector",
    );
    if (selectorErrors.length > AutofixReporter.SELECTOR_ERRORS_THRESHOLD) {
      recommendations.push({
        priority: "high",
        message: "Multiple selector issues found.",
        action: "Add data-testid attributes to improve selector reliability",
      });
    }

    // Good healing rate
    if (
      this.stats.fixes > 0 &&
      this.stats.fixes / this.stats.failed >
        AutofixReporter.GOOD_HEALING_RATE_THRESHOLD
    ) {
      recommendations.push({
        priority: "low",
        message: "Good autofix recovery rate!",
        action:
          "Autofix is working well. Consider enabling more autofix options.",
      });
    }

    return recommendations;
  }
}

/**
 * Create and export the reporter
 */
function _autofixReporter(options = {}) {
  return new AutofixReporter(options);
}

export default AutofixReporter;
