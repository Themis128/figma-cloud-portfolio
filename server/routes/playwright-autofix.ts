/**
 * Playwright AI Autofix Real-Time Configuration Route
 * 
 * Provides configuration endpoints for the AI autofix system
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Real-time configuration that can be updated without redeployment
interface PlaywrightRealTimeConfig {
  environment: 'development' | 'ci' | 'fast' | 'autofix';
  timeouts: {
    action: number;
    navigation: number;
    expect: number;
    test: number;
  };
  retries: number;
  workers: number;
  autofixEnabled: boolean;
  features: {
    selectorHealing: boolean;
    autoRetry: boolean;
    smartWait: boolean;
    performanceMonitoring: boolean;
  };
  suggestions: {
    maxPerTest: number;
    minConfidence: number;
    autoApplyThreshold: number;
  };
  lastUpdated: string;
  version: string;
}

// Default configuration
let currentConfig: PlaywrightRealTimeConfig = {
  environment: 'development',
  timeouts: {
    action: 10000,
    navigation: 30000,
    expect: 20000,
    test: 90000,
  },
  retries: 2,
  workers: 4,
  autofixEnabled: true,
  features: {
    selectorHealing: true,
    autoRetry: true,
    smartWait: true,
    performanceMonitoring: true,
  },
  suggestions: {
    maxPerTest: 5,
    minConfidence: 0.7,
    autoApplyThreshold: 0.9, // 90% confidence required for auto-fixable
  },
  lastUpdated: new Date().toISOString(),
  version: '1.0.0',
};

// GET /api/playwright-autofix/config - Get current configuration
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: currentConfig,
  });
});

// POST /api/playwright-autofix/config - Update configuration
router.post('/config', (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // Merge updates with current config
    currentConfig = {
      ...currentConfig,
      ...updates,
      timeouts: {
        ...currentConfig.timeouts,
        ...(updates.timeouts || {}),
      },
      features: {
        ...currentConfig.features,
        ...(updates.features || {}),
      },
      suggestions: {
        ...currentConfig.suggestions,
        ...(updates.suggestions || {}),
      },
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      config: currentConfig,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid configuration update',
    });
  }
});

// POST /api/playwright-autofix/analyze - Analyze test failure and get suggestions
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { testTitle, error, file, line, selector, timeout } = req.body;

    if (!error || !error.message) {
      res.status(400).json({
        success: false,
        error: 'Missing error information',
      });
      return;
    }

    const suggestions = generateSuggestions(error.message, selector, timeout);

    res.json({
      success: true,
      testTitle,
      file,
      line,
      suggestions,
      autoFixable: suggestions.some((s: { confidence: number }) => s.confidence >= currentConfig.suggestions.autoApplyThreshold),
      config: {
        environment: currentConfig.environment,
        autofixEnabled: currentConfig.autofixEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
    });
  }
});

// GET /api/playwright-autofix/health - Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'playwright-autofix',
    version: currentConfig.version,
    autofixEnabled: currentConfig.autofixEnabled,
  });
});

// GET /api/playwright-autofix/patterns - Get common error patterns
router.get('/patterns', (_req: Request, res: Response) => {
  res.json({
    success: true,
    patterns: {
      selector: [
        { pattern: 'element not found', type: 'missing-element' },
        { pattern: 'element not visible', type: 'visibility' },
        { pattern: 'element not attached', type: 'stale-element' },
        { pattern: 'strict mode violation', type: 'multiple-matches' },
      ],
      timeout: [
        { pattern: 'timeout exceeded', type: 'general-timeout' },
        { pattern: 'navigation timeout', type: 'navigation' },
        { pattern: 'waiting for selector', type: 'selector-wait' },
      ],
      action: [
        { pattern: 'click intercepted', type: 'overlay' },
        { pattern: 'element is disabled', type: 'disabled' },
        { pattern: 'not editable', type: 'readonly' },
      ],
      assertion: [
        { pattern: 'snapshot mismatch', type: 'visual' },
        { pattern: 'text content mismatch', type: 'text' },
        { pattern: 'toBeVisible failed', type: 'visibility' },
      ],
    },
  });
});

// Helper function to generate suggestions
function generateSuggestions(errorMessage: string, selector?: string, timeout?: number) {
  const suggestions: Array<{
    type: string;
    confidence: number;
    suggestion: string;
    code?: string;
    documentation?: string;
  }> = [];
  const errorMsg = errorMessage.toLowerCase();

  // Selector-based suggestions
  if (selector) {
    if (selector.includes('xpath=') || selector.includes('//')) {
      suggestions.push({
        type: 'selector',
        confidence: 0.85,
        suggestion: 'XPath selectors are brittle. Consider using data-testid or role-based selectors.',
        code: `// Replace:\nawait page.locator('${selector}')\n// With:\nawait page.getByTestId('your-test-id')`,
        documentation: 'https://playwright.dev/docs/locators',
      });
    }

    if (selector.startsWith('#') && selector.includes(' ')) {
      suggestions.push({
        type: 'selector',
        confidence: 0.8,
        suggestion: 'ID-based nested selectors can be simplified.',
        code: `// Simplify selector\nawait page.locator('${selector.split(' ')[0]}')`,
      });
    }
  }

  // Element not found
  if (/not found|does not exist/i.test(errorMsg)) {
    suggestions.push({
      type: 'selector',
      confidence: 0.9,
      suggestion: 'Element not found. Verify the selector or add wait for element to appear.',
      code: `// Wait for element\nawait page.locator('selector').waitFor({ state: 'attached' });`,
      documentation: 'https://playwright.dev/docs/api/class-locator#locator-wait-for',
    });
  }

  // Visibility issues
  if (/not visible|hidden|not displayed/i.test(errorMsg)) {
    suggestions.push({
      type: 'wait',
      confidence: 0.9,
      suggestion: 'Element is not visible. Wait for visibility before interaction.',
      code: `// Wait for visibility\nawait page.locator('selector').waitFor({ state: 'visible' });`,
    });
  }

  // Stale element
  if (/not attached|stale|detached/i.test(errorMsg)) {
    suggestions.push({
      type: 'selector',
      confidence: 0.95,
      suggestion: 'Element became stale. Re-query the element or use auto-retry.',
      code: `// Re-query element\nconst element = page.getByTestId('element');\nawait element.waitFor();\nawait element.click();`,
    });
  }

  // Timeout issues
  if (/timeout|timed out/i.test(errorMsg)) {
    const currentTimeout = timeout || 30000;
    suggestions.push({
      type: 'timeout',
      confidence: 0.85,
      suggestion: `Operation timed out (current: ${currentTimeout}ms). Consider increasing timeout or optimizing the operation.`,
      code: `// Increase timeout\nawait page.locator('selector').click({ timeout: 60000 });\n\n// Or wait for specific condition\nawait expect(page.locator('selector')).toBeVisible({ timeout: 60000 });`,
    });
  }

  // Navigation timeout
  if (/navigation.*timeout|goto.*timeout/i.test(errorMsg)) {
    suggestions.push({
      type: 'timeout',
      confidence: 0.9,
      suggestion: 'Page navigation timed out. The page may be slow or stuck loading.',
      code: `// Increase navigation timeout\nawait page.goto('/url', { timeout: 60000, waitUntil: 'domcontentloaded' });`,
    });
  }

  // Click intercepted
  if (/click intercepted|blocked/i.test(errorMsg)) {
    suggestions.push({
      type: 'action',
      confidence: 0.95,
      suggestion: 'Click was intercepted by another element (likely an overlay or modal).',
      code: `// Option 1: Force click\nawait locator.click({ force: true });\n\n// Option 2: Wait for overlay to disappear\nawait page.locator('.overlay').waitFor({ state: 'hidden' });\nawait locator.click();`,
    });
  }

  // Element disabled
  if (/disabled|not enabled|not editable/i.test(errorMsg)) {
    suggestions.push({
      type: 'action',
      confidence: 0.9,
      suggestion: 'Element is disabled. Wait for it to become enabled or check application state.',
      code: `// Wait for element to be enabled\nawait expect(locator).toBeEnabled();\nawait locator.click();`,
    });
  }

  // Snapshot mismatch
  if (/snapshot.*mismatch|screenshot.*different/i.test(errorMsg)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.8,
      suggestion: 'Visual snapshot does not match baseline. Review changes or update snapshot.',
      code: `// Update snapshot if intentional\n// Run: npx playwright test --update-snapshots\n\n// Or adjust threshold\nawait expect(page).toHaveScreenshot('name.png', {\n  maxDiffPixels: 100,\n  threshold: 0.2\n});`,
      documentation: 'https://playwright.dev/docs/test-snapshots',
    });
  }

  // Text mismatch
  if (/text.*mismatch|content.*different/i.test(errorMsg)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.85,
      suggestion: 'Text content does not match expected value.',
      code: `// Use flexible text matching\nawait expect(locator).toContainText('partial text');\nawait expect(locator).toHaveText(/regex pattern/);`,
    });
  }

  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);

  // Return top suggestions based on config
  return suggestions.slice(0, currentConfig.suggestions.maxPerTest);
}

export default router;