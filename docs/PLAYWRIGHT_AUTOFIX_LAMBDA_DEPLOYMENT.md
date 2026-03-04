# Playwright AI Autofix Lambda Deployment

This document provides a comprehensive guide for deploying and using the Playwright AI Autofix Lambda function with real-time configuration.

## Requirements

### For Using the Existing Lambda

| Requirement              | Description                                 |
| ------------------------ | ------------------------------------------- |
| **Runtime**              | Node.js 20.x or higher                      |
| **Package Manager**      | pnpm (recommended) or npm                   |
| **Environment Variable** | `PLAYWRIGHT_AUTOFIX_ENDPOINT` set in `.env` |
| **dotenv**               | ^17.2.3 (already installed)                 |
| **Network**              | HTTPS access to AWS Lambda URL              |

### For Deploying to AWS Lambda

| Requirement         | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| **AWS Account**     | Active AWS account with billing enabled                                |
| **AWS CLI**         | Version 2.x installed and configured (`aws configure`)                 |
| **IAM Permissions** | `lambda:CreateFunction`, `lambda:InvokeFunction`, `lambda:GetFunction` |
| **AWS Amplify CLI** | `@aws-amplify/backend-cli` for Amplify deployments                     |
| **Node.js**         | Version 20.x (matches Lambda runtime)                                  |
| **Region**          | `us-east-1` or your preferred region                                   |

### For CI/CD Integration

| Requirement               | Description                              |
| ------------------------- | ---------------------------------------- |
| **GitHub Repository**     | Repository with Actions enabled          |
| **GitHub Secret**         | `PLAYWRIGHT_AUTOFIX_ENDPOINT` configured |
| **GitHub CLI** (optional) | For setting secrets via command line     |

### For Local Development

| Requirement             | Description                 |
| ----------------------- | --------------------------- |
| **Node.js**             | Version 20.x                |
| **pnpm**                | `pnpm install` dependencies |
| **Playwright Browsers** | `pnpm run setup:playwright` |

### Dependency Versions

```json
{
  "@playwright/test": "^1.58.1",
  "dotenv": "^17.2.3",
  "node-fetch": "^3.3.2"
}
```

## Overview

The AI Autofix system provides intelligent test failure analysis and fix suggestions for Playwright tests. It can be deployed as:

1. **AWS Lambda Function** - Cloud-based analysis with API Gateway
2. **Local Server Route** - Built-in Express endpoint for local development
3. **Offline Mode** - Built-in analysis without external dependencies

## Architecture

### What Does This Lambda Do?

The Lambda function analyzes Playwright test failures and provides intelligent fix suggestions. It uses pattern matching to identify common error types and generates actionable recommendations.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLAYWRIGHT TEST RUNNER                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Test fails
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI AUTOFIX REPORTER                                  │
│  (playwright-ai-autofix-reporter.ts)                                        │
│                                                                              │
│  Extracts:                                                                   │
│  • testTitle    • error.message    • file                                   │
│  • line         • selector         • timeout                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ POST request
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     AWS LAMBDA FUNCTION                                      │
│                   (playwright-autofix)                                       │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        ERROR ANALYSIS                                 │  │
│  │                                                                        │  │
│  │   Input: Error message + context                                      │  │
│  │                      │                                                 │  │
│  │                      ▼                                                 │  │
│  │   ┌─────────────────────────────────────────────┐                    │  │
│  │   │         PATTERN MATCHING ENGINE              │                    │  │
│  │   │                                               │                    │  │
│  │   │  ┌─────────────┐ ┌─────────────┐ ┌────────┐ │                    │  │
│  │   │  │  SELECTOR   │ │  TIMEOUT    │ │ ACTION │ │                    │  │
│  │   │  │  PATTERNS   │ │  PATTERNS   │ │PATTERNS│ │                    │  │
│  │   │  └──────┬──────┘ └──────┬──────┘ └───┬────┘ │                    │  │
│  │   │         │               │            │      │                    │  │
│  │   │         └───────────────┼────────────┘      │                    │  │
│  │   │                         │                   │                    │  │
│  │   │                         ▼                   │                    │  │
│  │   │  ┌─────────────┐ ┌─────────────┐           │                    │  │
│  │   │  │  ASSERTION  │ │   CONFIG    │           │                    │  │
│  │   │  │  PATTERNS   │ │  FALLBACK   │           │                    │  │
│  │   │  └──────┬──────┘ └──────┬──────┘           │                    │  │
│  │   │         └───────────────┼──────────────────┘                    │  │
│  │   └─────────────────────────┼───────────────────────────────────────┘  │
│  │                             │                                            │
│  │                             ▼                                            │
│  │   ┌───────────────────────────────────────────────────────────────┐    │  │
│  │   │                    FIX GENERATOR                               │    │  │
│  │   │                                                                │    │  │
│  │   │  For each matched pattern:                                     │    │  │
│  │   │  • Generate suggestion text                                    │    │  │
│  │   │  • Provide code example                                        │    │  │
│  │   │  • Add documentation link                                      │    │  │
│  │   │  • Calculate confidence score (0.5 - 0.95)                     │    │  │
│  │   │  • Mark as auto-fixable if confidence >= 0.9                   │    │  │
│  │   └───────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Output: FixSuggestion[] sorted by confidence                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ JSON Response
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESPONSE EXAMPLE                                    │
│                                                                              │
│  {                                                                           │
│    "success": true,                                                          │
│    "suggestions": [                                                          │
│      {                                                                       │
│        "type": "wait",                                                       │
│        "confidence": 0.9,                                                    │
│        "suggestion": "Add explicit wait...",                                 │
│        "code": "await locator.waitFor({ state: 'visible' });"               │
│      }                                                                       │
│    ],                                                                        │
│    "autoFixable": true,                                                      │
│    "recommendedAction": "Add explicit wait for element"                     │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Error Patterns Detected

| Category      | Patterns                                           | Confidence |
| ------------- | -------------------------------------------------- | ---------- |
| **Selector**  | Element not found, not visible, stale, strict mode | 0.85-0.95  |
| **Timeout**   | Navigation timeout, element wait timeout           | 0.85-0.90  |
| **Action**    | Click intercepted, element disabled, not editable  | 0.90-0.95  |
| **Assertion** | Snapshot mismatch, text mismatch, visibility       | 0.80-0.85  |
| **Config**    | Generic fallback                                   | 0.50       |

## Lambda Backend Implementation

### Technical Stack

| Component | Technology                 |
| --------- | -------------------------- |
| Runtime   | Node.js 20.x               |
| Memory    | 128 MB                     |
| Timeout   | 3 seconds                  |
| Handler   | `index.handler`            |
| Trigger   | Lambda Function URL (HTTP) |

### Core Components

#### 1. Type Definitions

```typescript
// Request structure from Playwright reporter
interface AutofixRequest {
  testTitle: string; // Name of the failed test
  error: {
    message: string; // Error message from Playwright
    stack?: string; // Optional stack trace
  };
  file: string; // Test file path
  line?: number; // Line number of failure
  code?: string; // Optional test code
  selector?: string; // Element selector that failed
  timeout?: number; // Timeout value used
}

// Response structure to Playwright reporter
interface AutofixResponse {
  success: boolean;
  suggestions: FixSuggestion[];
  autoFixable: boolean; // true if confidence >= 0.9
  recommendedAction: string;
  metadata: {
    processingTime: number;
    model: string;
    version: string;
  };
}

// Individual fix suggestion
interface FixSuggestion {
  type: "selector" | "timeout" | "wait" | "assertion" | "action" | "config";
  confidence: number; // 0.5 - 0.95
  suggestion: string; // Human-readable suggestion
  code?: string; // Code example to fix
  documentation?: string; // Link to Playwright docs
}
```

#### 2. Pattern Matching Engine

The Lambda uses regex-based pattern matching to categorize errors:

```typescript
const ERROR_PATTERNS = {
  selector: [
    {
      pattern: /locator\.(getBy|findBy|locator).*not found/i,
      type: "element-not-found",
    },
    { pattern: /waiting for locator/i, type: "element-timeout" },
    { pattern: /strict mode violation/i, type: "multiple-elements" },
    { pattern: /element is not attached/i, type: "stale-element" },
    { pattern: /element is not visible/i, type: "visibility" },
  ],
  timeout: [
    { pattern: /timeout.*exceeded/i, type: "timeout" },
    { pattern: /waiting for.*timed out/i, type: "wait-timeout" },
    { pattern: /navigation.*timed out/i, type: "navigation-timeout" },
  ],
  action: [
    { pattern: /element is not editable/i, type: "not-editable" },
    { pattern: /element is disabled/i, type: "disabled" },
    { pattern: /click intercepted/i, type: "click-intercepted" },
    { pattern: /scroll.*into view/i, type: "scroll-needed" },
  ],
  assertion: [
    {
      pattern: /expect\(.*\)\.(toBe|toHave|toContain).*failed/i,
      type: "assertion-failed",
    },
    { pattern: /snapshot.*mismatch/i, type: "snapshot-mismatch" },
    { pattern: /text content.*mismatch/i, type: "text-mismatch" },
  ],
};
```

#### 3. Fix Generator Functions

Each error type has a dedicated fix generator:

| Function                 | Purpose                                      | Output                                  |
| ------------------------ | -------------------------------------------- | --------------------------------------- |
| `generateSelectorFix()`  | Handles element not found, stale, visibility | Wait suggestions, selector improvements |
| `generateTimeoutFix()`   | Handles timeout errors                       | Increase timeout, add waits             |
| `generateActionFix()`    | Handles click intercepted, disabled          | Force click, wait for enabled           |
| `generateAssertionFix()` | Handles snapshot, text mismatches            | Update snapshots, flexible matching     |

#### 4. Handler Flow

```
1. Receive HTTP POST event
2. Parse JSON body → AutofixRequest
3. Log request for debugging
4. Call analyzeError(request)
   ├─ generateSelectorFix()
   ├─ generateTimeoutFix()
   ├─ generateActionFix()
   └─ generateAssertionFix()
5. Sort suggestions by confidence (descending)
6. Determine autoFixable (any confidence >= 0.9)
7. Return JSON response with CORS headers
```

### Selector Improvements Database

The Lambda includes hardcoded recommendations for improving selectors:

| Bad Pattern | Recommendation                         |
| ----------- | -------------------------------------- |
| `xpath=`    | Use CSS selectors or data-testid       |
| `text=`     | Use getByText() or getByRole()         |
| `.btn`      | Use [data-testid="submit-btn"]         |
| `#root`     | Too generic, use more specific         |
| `div >`     | Deep nesting is brittle                |
| `[class=`   | Classes can change, prefer data-testid |

### Confidence Scoring Logic

| Error Type         | Confidence | Reasoning                      |
| ------------------ | ---------- | ------------------------------ |
| Stale element      | 0.95       | Very common, clear fix         |
| Click intercepted  | 0.95       | Clear fix (force click)        |
| Element not found  | 0.90       | Common, usually needs wait     |
| Disabled element   | 0.90       | Clear wait strategy            |
| Navigation timeout | 0.90       | Clear timeout fix              |
| Element timeout    | 0.85       | May need investigation         |
| Snapshot mismatch  | 0.80       | May be intentional             |
| Text mismatch      | 0.85       | May need flexible matching     |
| Generic fallback   | 0.50       | Uncertain, needs manual review |

### Error Handling

```typescript
// Graceful error handling with fallback response
catch (error) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      success: false,
      suggestions: [],
      autoFixable: false,
      recommendedAction: 'Internal server error - please try again',
      error: errorMessage
    })
  };
}
```

### CORS Configuration

```typescript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

## Files Created

| File                                                 | Purpose                                 |
| ---------------------------------------------------- | --------------------------------------- |
| `amplify/functions/playwright-autofix/index.ts`      | Lambda function handler                 |
| `amplify/functions/playwright-autofix/function.json` | Lambda configuration                    |
| `amplify/functions/playwright-autofix/package.json`  | Dependencies                            |
| `server/routes/playwright-autofix.ts`                | Express route for local development     |
| `playwright-ai-autofix-reporter.ts`                  | Playwright reporter with AI suggestions |
| `deploy-playwright-autofix.sh`                       | Deployment script for AWS               |

## Deployment

### Current Deployment Status

The Lambda function is deployed and operational:

| Property      | Value                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| Function Name | `playwright-autofix`                                                    |
| Region        | `us-east-1`                                                             |
| Runtime       | `nodejs20.x`                                                            |
| State         | Active                                                                  |
| Endpoint      | `https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/` |

### Environment Configuration

The endpoint is configured in `.env`:

```bash
PLAYWRIGHT_AUTOFIX_ENDPOINT=https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/
AUTOFIX_LAMBDA_URL=https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/
```

The `playwright.config.ts` loads environment variables via dotenv:

```typescript
import * as dotenv from "dotenv";
dotenv.config();
```

### Option 1: Use Existing Lambda (Current Setup)

The function is already deployed via AWS Amplify. The configuration in `amplify/backend.ts`:

```typescript
// amplify/backend.ts
const playwrightAutofixFunction = defineFunction({
  name: "playwright-autofix",
  entry: "./functions/playwright-autofix/index.ts",
  runtime: 20,
  timeoutSeconds: 30,
  memoryMB: 512,
});
```

### Option 2: Redeploy to AWS Lambda

1. **Prerequisites**
   - AWS CLI installed and configured
   - Appropriate IAM permissions for Lambda

2. **Deploy with Amplify**

   ```bash
   npx ampx deploy
   ```

3. **Create function URL** (if not exists)

   ```bash
   aws lambda create-function-url-config \
     --function-name playwright-autofix \
     --auth-type NONE \
     --region us-east-1

   aws lambda add-permission \
     --function-name playwright-autofix \
     --statement-id url-function \
     --action lambda:InvokeFunctionUrl \
     --principal "*" \
     --function-url-auth-type NONE \
     --region us-east-1
   ```

### Option 3: Local Development (Offline Mode)

If no endpoint is configured, the reporter automatically uses built-in local analysis:

```bash
# Run without endpoint - uses offline mode
pnpm test:e2e
```

## Usage

### Running Tests with Autofix

```bash
# Standard test run with autofix reporter
pnpm test:e2e

# Autofix mode (updates snapshots)
pnpm test:e2e:autofix

# With custom endpoint
PLAYWRIGHT_AUTOFIX_ENDPOINT=https://your-endpoint.com/autofix pnpm test:e2e
```

### Configuration

The reporter can be configured in `playwright.config.ts`:

```typescript
reporter: [
  ['line'],
  ['./playwright-ai-autofix-reporter', {
    endpoint: process.env.PLAYWRIGHT_AUTOFIX_ENDPOINT,
    realTimeConfig: true,
    outputPath: 'playwright-report/autofix-report.json',
    maxSuggestions: 5,
  }],
],
```

### Environment Variables

| Variable                      | Description                | Default             |
| ----------------------------- | -------------------------- | ------------------- |
| `PLAYWRIGHT_AUTOFIX_ENDPOINT` | Lambda/Server endpoint URL | None (offline mode) |
| `AUTOFIX_LAMBDA_URL`          | Alternative endpoint URL   | None                |

## API Endpoints

### POST /autofix

Analyze a test failure and get fix suggestions.

**Request:**

```json
{
  "testTitle": "Login should work",
  "error": {
    "message": "Element not found: button[type='submit']",
    "stack": "..."
  },
  "file": "tests/login.spec.ts",
  "line": 42,
  "selector": "button[type='submit']",
  "timeout": 30000
}
```

**Response:**

```json
{
  "success": true,
  "suggestions": [
    {
      "type": "selector",
      "confidence": 0.9,
      "suggestion": "Element not found. Verify the selector or add wait.",
      "code": "await page.locator('selector').waitFor({ state: 'attached' });",
      "documentation": "https://playwright.dev/docs/api/class-locator#locator-wait-for"
    }
  ],
  "autoFixable": true,
  "recommendedAction": "Add explicit wait for element",
  "metadata": {
    "processingTime": 5,
    "model": "playwright-autofix-v1",
    "version": "1.0.0"
  }
}
```

### GET /config

Get the current real-time configuration.

**Response:**

```json
{
  "success": true,
  "config": {
    "environment": "development",
    "timeouts": {
      "action": 10000,
      "navigation": 30000,
      "expect": 20000,
      "test": 90000
    },
    "retries": 2,
    "workers": 4,
    "autofixEnabled": true,
    "features": {
      "selectorHealing": true,
      "autoRetry": true,
      "smartWait": true,
      "performanceMonitoring": true
    }
  }
}
```

### POST /config

Update the real-time configuration.

### GET /patterns

Get common error patterns for reference.

### GET /health

Health check endpoint.

## Error Pattern Detection

The autofix system uses a 90% confidence threshold to determine if a fix is "auto-fixable". Suggestions with confidence >= 0.9 are marked as auto-fixable.

The system detects and provides suggestions for:

### Selector Issues

- Element not found
- Element not visible
- Element not attached (stale)
- Strict mode violations (multiple matches)

### Timeout Issues

- General timeouts
- Navigation timeouts
- Element wait timeouts

### Action Issues

- Click intercepted
- Element disabled
- Element not editable

### Assertion Issues

- Snapshot mismatches
- Text content mismatches
- Visibility assertions

## Output

### Console Output

```
🔧 AI Autofix Reporter initialized
   Endpoint: https://xxxx.execute-api.us-east-1.amazonaws.com/prod/autofix

❌ Test Failed: Login should work
   File: tests/login.spec.ts:42
   Error: Element not found: button[type='submit']

   💡 AI Suggestions:
   1. [SELECTOR] (90% confidence)
      Element not found. Verify the selector or add wait.
      Code: await page.locator('selector').waitFor({ state: 'attached' });

   ✅ Auto-fixable! High confidence fix available.

============================================================
🔧 AI AUTOFIX REPORT SUMMARY
============================================================

📊 Test Statistics:
   Total: 50
   Passed: 45
   Failed: 5
   Healed (auto-fixable): 3
   Duration: 45.23s

📈 Health Score: A (96%)

💡 Top Priority Fixes:
   1. [SELECTOR] Login should work
      Suggestion: Element not found. Add explicit wait.

📄 Detailed report saved to: playwright-report/autofix-report.json
============================================================
```

### JSON Report

A detailed JSON report is saved to `playwright-report/autofix-report.json` containing:

- Test statistics summary
- Real-time configuration
- All failures with suggestions
- Recommendations for improvement

## Integration with CI/CD

### GitHub Actions

Add to your workflow:

```yaml
- name: Run Playwright tests with Autofix
  env:
    PLAYWRIGHT_AUTOFIX_ENDPOINT: ${{ secrets.PLAYWRIGHT_AUTOFIX_ENDPOINT }}
  run: pnpm test:e2e:ci

- name: Upload Autofix Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: autofix-report
    path: playwright-report/autofix-report.json
```

### Required GitHub Secret

Add the Lambda endpoint as a repository secret:

**Via GitHub UI:**

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `PLAYWRIGHT_AUTOFIX_ENDPOINT`
4. Value: `https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/`
5. Click "Add secret"

**Via GitHub CLI:**

```bash
gh secret set PLAYWRIGHT_AUTOFIX_ENDPOINT --body "https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/"
```

### AWS Amplify

The function is automatically deployed with Amplify. The endpoint will be available through your Amplify API.

## Troubleshooting

### Reporter not loading

- Ensure the reporter file is in the project root
- Check the path in `playwright.config.ts`

### Lambda timeout

- Increase timeout in function.json or deployment script
- Default is 30 seconds

### No suggestions generated

- Check the error message format
- Verify the Lambda endpoint is accessible
- Check CloudWatch logs for Lambda errors

## Best Practices

1. **Use data-testid** - Most reliable for autofix suggestions
2. **Review autofix report** - Identify patterns in failures
3. **Set appropriate timeouts** - Based on your application
4. **Use offline mode for development** - Faster feedback loop
5. **Deploy Lambda for CI** - Centralized analysis

## Cost Considerations

- Lambda: ~$0.20 per 1M requests
- API Gateway: ~$1.00 per 1M requests
- Free tier covers most development use cases

## Security

- CORS enabled for cross-origin requests
- No authentication required for internal use
- Consider adding API key authentication for production

## Future Enhancements

- [ ] Machine learning model for better suggestions
- [ ] Auto-apply fixes for high confidence suggestions
- [ ] Integration with GitHub PR comments
- [ ] Slack/Teams notifications for failures
