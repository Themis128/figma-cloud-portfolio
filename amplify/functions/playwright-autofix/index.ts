/**
 * Playwright AI Autofix Lambda Function
 * 
 * Provides real-time AI-powered test failure analysis and fix suggestions
 * for Playwright tests using lightweight ML models.
 */

import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

// Types
interface AutofixRequest {
  testTitle: string;
  error: {
    message: string;
    stack?: string;
  };
  file: string;
  line?: number;
  code?: string;
  selector?: string;
  timeout?: number;
}

interface FixSuggestion {
  type: 'selector' | 'timeout' | 'wait' | 'assertion' | 'action' | 'config';
  confidence: number;
  suggestion: string;
  code?: string;
  documentation?: string;
}

interface AutofixResponse {
  success: boolean;
  suggestions: FixSuggestion[];
  autoFixable: boolean;
  recommendedAction: string;
  metadata: {
    processingTime: number;
    model: string;
    version: string;
  };
}

// Error patterns for common Playwright issues
const ERROR_PATTERNS = {
  selector: [
    { pattern: /locator\.(getBy|findBy|locator).*not found/i, type: 'element-not-found' },
    { pattern: /waiting for locator/i, type: 'element-timeout' },
    { pattern: /strict mode violation/i, type: 'multiple-elements' },
    { pattern: /element is not attached/i, type: 'stale-element' },
    { pattern: /element is not visible/i, type: 'visibility' },
  ],
  timeout: [
    { pattern: /timeout.*exceeded/i, type: 'timeout' },
    { pattern: /waiting for.*timed out/i, type: 'wait-timeout' },
    { pattern: /navigation.*timed out/i, type: 'navigation-timeout' },
  ],
  action: [
    { pattern: /element is not editable/i, type: 'not-editable' },
    { pattern: /element is disabled/i, type: 'disabled' },
    { pattern: /click intercepted/i, type: 'click-intercepted' },
    { pattern: /scroll.*into view/i, type: 'scroll-needed' },
  ],
  assertion: [
    { pattern: /expect\(.*\)\.(toBe|toHave|toContain).*failed/i, type: 'assertion-failed' },
    { pattern: /snapshot.*mismatch/i, type: 'snapshot-mismatch' },
    { pattern: /text content.*mismatch/i, type: 'text-mismatch' },
  ],
};

// Selector improvement suggestions
const SELECTOR_IMPROVEMENTS: Record<string, string> = {
  'xpath=': 'Consider using CSS selectors or data-testid for better reliability',
  'text=': 'Consider using getByText() or getByRole() for better maintainability',
  '.btn': 'Consider using more specific selector like [data-testid="submit-btn"]',
  '#root': 'Root selector is too generic, consider more specific targeting',
  'div >': 'Deep nested selectors are brittle, consider data-testid',
  '[class=': 'Class selectors can change, prefer data-testid or role',
};

// Fix generators
function generateSelectorFix(error: string, selector?: string): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];
  
  // Check for selector improvement
  if (selector) {
    for (const [pattern, improvement] of Object.entries(SELECTOR_IMPROVEMENTS)) {
      if (selector.toLowerCase().includes(pattern.toLowerCase())) {
        suggestions.push({
          type: 'selector',
          confidence: 0.85,
          suggestion: improvement,
          code: `// Before:\nawait page.locator('${selector}')\n\n// After:\nawait page.getByTestId('your-test-id')\n// or\nawait page.getByRole('button', { name: 'Submit' })`,
          documentation: 'https://playwright.dev/docs/locators',
        });
      }
    }
  }

  // Element not found fix
  if (/not found|not visible|not attached/i.test(error)) {
    suggestions.push({
      type: 'wait',
      confidence: 0.9,
      suggestion: 'Add explicit wait for element before interaction',
      code: `// Add wait before interaction:\nawait page.locator('selector').waitFor({ state: 'visible' });\nawait page.locator('selector').click();`,
      documentation: 'https://playwright.dev/docs/api/class-locator#locator-wait-for',
    });
  }

  // Stale element fix
  if (/stale|not attached/i.test(error)) {
    suggestions.push({
      type: 'selector',
      confidence: 0.95,
      suggestion: 'Element became stale. Re-locate the element or add retry logic',
      code: `// Option 1: Re-locate before each action\nconst locator = page.getByTestId('element');\nawait locator.waitFor();\nawait locator.click();\n\n// Option 2: Use auto-waiting with retry\nawait page.locator('selector').click({ timeout: 10000 });`,
    });
  }

  return suggestions;
}

function generateTimeoutFix(error: string, timeout?: number): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];
  const currentValue = timeout || 30000;

  if (/navigation.*timeout/i.test(error)) {
    suggestions.push({
      type: 'timeout',
      confidence: 0.9,
      suggestion: 'Navigation timeout - page may be loading slowly or stuck',
      code: `// Increase navigation timeout:\nawait page.goto('/url', { waitUntil: 'networkidle', timeout: 60000 });\n\n// Or wait for specific element:\nawait page.goto('/url');\nawait page.waitForSelector('#loaded-element', { timeout: 60000 });`,
    });
  }

  if (/element.*timeout|waiting for.*timeout/i.test(error)) {
    suggestions.push({
      type: 'wait',
      confidence: 0.85,
      suggestion: `Current timeout (${currentValue}ms) may be too short for this operation`,
      code: `// Increase timeout:\nawait page.locator('selector').click({ timeout: 60000 });\n\n// Or use custom wait with retry:\nawait expect(page.locator('selector')).toBeVisible({ timeout: 60000 });`,
    });
  }

  return suggestions;
}

function generateActionFix(error: string, code?: string): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];

  if (/click intercepted/i.test(error)) {
    suggestions.push({
      type: 'action',
      confidence: 0.95,
      suggestion: 'Click is being intercepted by another element. Try force click or dismiss overlays',
      code: `// Option 1: Force click (bypass checks)\nawait locator.click({ force: true });\n\n// Option 2: Wait for overlay to disappear\nawait page.locator('.modal-backdrop').waitFor({ state: 'hidden' });\nawait locator.click();\n\n// Option 3: Use keyboard for buttons\nawait locator.focus();\nawait page.keyboard.press('Enter');`,
    });
  }

  if (/not editable|disabled/i.test(error)) {
    suggestions.push({
      type: 'action',
      confidence: 0.9,
      suggestion: 'Element is not interactive. Wait for it to become enabled',
      code: `// Wait for element to be enabled:\nawait expect(locator).toBeEnabled();\nawait locator.click();\n\n// Or check state:\nconst isEnabled = await locator.isEnabled();\nif (isEnabled) {\n  await locator.click();\n}`,
    });
  }

  if (/scroll/i.test(error)) {
    suggestions.push({
      type: 'action',
      confidence: 0.9,
      suggestion: 'Element needs to be scrolled into view',
      code: `// Scroll element into view:\nawait locator.scrollIntoViewIfNeeded();\nawait locator.click();`,
    });
  }

  return suggestions;
}

function generateAssertionFix(error: string): FixSuggestion[] {
  const suggestions: FixSuggestion[] = [];

  if (/snapshot.*mismatch/i.test(error)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.8,
      suggestion: 'Visual snapshot mismatch detected. Review changes or update baseline',
      code: `// Update snapshots if intentional:\n// Run: npx playwright test --update-snapshots\n\n// Or adjust threshold:\nawait expect(page).toHaveScreenshot('name.png', {\n  maxDiffPixels: 100,\n  threshold: 0.2\n});`,
      documentation: 'https://playwright.dev/docs/test-snapshots',
    });
  }

  if (/text.*mismatch/i.test(error)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.85,
      suggestion: 'Text content does not match expected value',
      code: `// Check actual text content:\nconst text = await locator.textContent();\nconsole.log('Actual text:', text);\n\n// Use flexible matching:\nawait expect(locator).toContainText('partial text');\nawait expect(locator).toHaveText(/regex pattern/);`,
    });
  }

  if (/toBeVisible|toBeHidden/i.test(error)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.85,
      suggestion: 'Element visibility assertion failed',
      code: `// Debug visibility:\nconsole.log('Is visible:', await locator.isVisible());\nconsole.log('Is hidden:', await locator.isHidden());\n\n// Use proper wait:\nawait expect(locator).toBeVisible({ timeout: 10000 });`,
    });
  }

  return suggestions;
}

function analyzeError(request: AutofixRequest): FixSuggestion[] {
  const { error, selector, timeout, code } = request;
  const errorMessage = error.message || '';
  const allSuggestions: FixSuggestion[] = [];

  // Generate fixes based on error type
  allSuggestions.push(...generateSelectorFix(errorMessage, selector));
  allSuggestions.push(...generateTimeoutFix(errorMessage, timeout));
  allSuggestions.push(...generateActionFix(errorMessage, code));
  allSuggestions.push(...generateAssertionFix(errorMessage));

  // Add generic fallback if no specific fix found
  if (allSuggestions.length === 0) {
    allSuggestions.push({
      type: 'config',
      confidence: 0.5,
      suggestion: 'Consider increasing timeouts or adding explicit waits',
      code: `// General best practices:\n// 1. Use auto-waiting locators\nawait page.getByTestId('element').click();\n\n// 2. Add explicit waits for critical elements\nawait page.locator('selector').waitFor({ state: 'visible' });\n\n// 3. Use expect for assertions with auto-retry\nawait expect(page.locator('selector')).toBeVisible();`,
    });
  }

  // Sort by confidence
  return allSuggestions.sort((a, b) => b.confidence - a.confidence);
}

// Main handler
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<AutofixResponse>> => {
  const startTime = Date.now();

  // Immediate log for guaranteed output
  console.log('[Lambda] Handler invoked - event:', JSON.stringify(event));
  // Log incoming event for debugging
  console.log('Received event:', JSON.stringify(event));

  try {
    // Parse request body
    let body: any = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
        console.log('Parsed body:', body);
      } catch (parseErr) {
        console.error('Body parse error:', parseErr);
        throw new Error('Invalid JSON body');
      }
    } else {
      console.warn('No body provided in event');
    }

    const request: AutofixRequest = {
      testTitle: body.testTitle || 'Unknown Test',
      error: body.error || { message: 'Unknown error' },
      file: body.file || 'unknown',
      line: body.line,
      code: body.code,
      selector: body.selector,
      timeout: body.timeout,
    };

    // Log parsed request
    console.log('AutofixRequest:', request);

    // Analyze error and generate suggestions
    const suggestions = analyzeError(request);

    // Determine if auto-fixable (high confidence fixes)
    const autoFixable = suggestions.some(s => s.confidence >= 0.9);

    // Get recommended action (highest confidence)
    const recommendedAction = suggestions[0]?.suggestion || 'Review the error manually';

    const response: AutofixResponse = {
      success: true,
      suggestions,
      autoFixable,
      recommendedAction,
      metadata: {
        processingTime: Date.now() - startTime,
        model: 'playwright-autofix-v1',
        version: '1.0.0',
      },
    };

    // Log response
    console.log('AutofixResponse:', response);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Handler error:', errorMessage);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        suggestions: [],
        autoFixable: false,
        recommendedAction: 'Internal server error - please try again',
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'playwright-autofix-v1',
          version: '1.0.0',
        },
        error: errorMessage,
      }),
    };
  }
};

// Export for local testing
export { analyzeError, generateSelectorFix, generateTimeoutFix, generateActionFix, generateAssertionFix };