# Playwright Autofix Configuration

This document describes the AI-powered Playwright autofix configuration with intelligent test failure analysis.

## Overview

The autofix system provides intelligent test failure analysis and fix suggestions:

- **AI-powered suggestions** - Lambda-based analysis with confidence scores
- **Auto-healing locators** - Automatically retry on stale element errors
- **Smart waiters** - Handle common async issues automatically
- **Selector optimization** - Suggestions for better selectors
- **Performance monitoring** - Track test performance metrics
- **Enhanced reporting** - Detailed failure analysis and recommendations
- **Offline fallback** - Built-in local analysis when Lambda unavailable

## Current Deployment

| Property      | Value                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| Function Name | `playwright-autofix`                                                    |
| Region        | `us-east-1`                                                             |
| Runtime       | `nodejs20.x`                                                            |
| State         | Active                                                                  |
| Endpoint      | `https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/` |

## Files

| File                                            | Description                              |
| ----------------------------------------------- | ---------------------------------------- |
| `playwright.config.ts`                          | Main configuration with autofix reporter |
| `playwright-ai-autofix-reporter.ts`             | AI reporter with Lambda integration      |
| `playwright-ai-sync.ts`                         | Lambda availability checker              |
| `amplify/functions/playwright-autofix/index.ts` | Lambda function handler                  |

## Usage

### Basic Autofix Run

```bash
pnpm test:e2e:autofix
```

### With UI Mode

```bash
pnpm test:e2e:autofix:ui
```

### Update Snapshots

```bash
pnpm test:e2e:autofix:update-snapshots
```

### Custom Reporter Only

```bash
pnpm test:e2e:autofix:report
```

## Environment Variables

| Variable                  | Default | Description                           |
| ------------------------- | ------- | ------------------------------------- |
| `PW_AUTOFIX_SNAPSHOTS`    | `true`  | Enable automatic snapshot updates     |
| `PW_AUTOFIX_LOCATORS`     | `true`  | Enable locator healing                |
| `PW_AUTOFIX_RETRY`        | `true`  | Enable automatic retries with healing |
| `PW_AUTOFIX_MAX_RETRIES`  | `3`     | Maximum healing retries               |
| `PW_AUTOFIX_DETECT_STALE` | `true`  | Detect stale element errors           |
| `PW_AUTOFIX_PERFORMANCE`  | `true`  | Enable performance monitoring         |
| `PW_AUTOFIX_A11Y`         | `false` | Enable accessibility auto-fixes       |

## Helper Functions

### HealingLocator

Auto-healing locator that automatically retries on stale element errors:

```typescript
import { createHealingLocator } from "playwright-tests/autofix-helpers";

const healingLocator = createHealingLocator(page, "#submit-button");

// All operations automatically heal on stale errors
await healingLocator.click();
await healingLocator.fill("value");
const isVisible = await healingLocator.isVisible();
```

### SmartWaiter

Smart waiting utilities:

```typescript
import { SmartWaiter } from "playwright-tests/autofix-helpers";

const waiter = new SmartWaiter(page);

// Wait for stable element
await waiter.waitForStable("#element");

// Wait for network idle
await waiter.waitForNetworkIdle();

// Wait for API response
await waiter.waitForApi("/api/data");

// Wait for specific text
await waiter.waitForText("#element", "Expected Text");
```

### SelectorOptimizer

Selector optimization suggestions:

```typescript
import { SelectorOptimizer } from "playwright-tests/autofix-helpers";

// Get suggestions for a selector
const suggestions = SelectorOptimizer.suggest(".button-submit");
// Returns: ['[data-testid="buttonSubmit"]', '[role="button"]', ...]

// Find best selector from options
const best = SelectorOptimizer.findBest([
  ".btn",
  '[data-testid="btn"]',
  "#submit",
]);
// Returns: '[data-testid="btn"]'
```

### PerformanceMonitor

Track performance metrics:

```typescript
import { PerformanceMonitor } from "playwright-tests/autofix-helpers";

const perf = new PerformanceMonitor(page);

// Mark and measure
await perf.mark("action-start");
// ... perform action
const duration = await perf.measure("action", "action-start");

// Get metrics
const metrics = await perf.getMetrics();
// { fcp, lcp, ttfb, domSize }

// Log summary
await perf.logSummary();
```

## Autofix Reporter

The custom reporter provides:

- **Test Statistics** - Total, passed, failed, healed counts
- **Healing Summary** - Tests that recovered after retry
- **Fix Suggestions** - Detailed recommendations for failures
- **Health Score** - Overall test health grade (A/B/C/D)
- **Recommendations** - Priority-based improvement suggestions

### Report Output

```
🔧 AUTOFIX REPORT SUMMARY

📊 Test Statistics:
   Total: 50
   Passed: 45
   Failed: 5
   Healed: 3

✅ Tests Healed (recovered after retry):
   - Login Page > Should login user (recovered on retry 2)

💡 Autofix Suggestions:
   1. [SELECTOR] Login Page > Should login user
      Suggestion: Selector may be stale
      Fix: Use page.waitForSelector() or check visibility

   2. [TIMEOUT] Dashboard > Should load data
      Suggestion: Timeout exceeded
      Fix: Add explicit wait or check page stability

📄 Detailed report saved to: playwright-report/autofix-report.json
```

## Best Practices

1. **Use data-testid** - Most reliable selectors for autofix
2. **Enable autofix in CI** - Helps with flaky tests
3. **Review healing reports** - Identify patterns in failures
4. **Use SmartWaiter** - For complex async scenarios
5. **Monitor performance** - Catch regressions early

## Troubleshooting

### Tests Still Failing After Autofix

1. Check if element is actually present
2. Verify API endpoints are working
3. Review browser console for errors
4. Increase timeout in config

### Too Many Healing Attempts

- Consider using more specific selectors
- Add proper waits before interactions
- Check for React re-render issues

### Performance Degraded

- Disable `PW_AUTOFIX_PERFORMANCE` in CI
- Use `test:e2e:fast` for quick runs
- Reduce `PW_AUTOFIX_MAX_RETRIES`
