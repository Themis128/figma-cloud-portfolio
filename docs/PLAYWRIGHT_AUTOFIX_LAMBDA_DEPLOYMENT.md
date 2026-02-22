# Playwright AI Autofix Lambda Deployment

This document provides a comprehensive guide for deploying and using the Playwright AI Autofix Lambda function with real-time configuration.

## Overview

The AI Autofix system provides intelligent test failure analysis and fix suggestions for Playwright tests. It can be deployed as:

1. **AWS Lambda Function** - Cloud-based analysis with API Gateway
2. **Local Server Route** - Built-in Express endpoint for local development
3. **Offline Mode** - Built-in analysis without external dependencies

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Playwright Test Runner                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               AI Autofix Reporter                        │  │
│  │                                                           │  │
│  │   ┌─────────────────┐    ┌────────────────────────────┐  │  │
│  │   │ Test Failure    │───►│ Get Fix Suggestions        │  │  │
│  │   └─────────────────┘    └────────────┬───────────────┘  │  │
│  │                                       │                   │  │
│  │            ┌──────────────────────────┼───────────────┐  │  │
│  │            ▼                          ▼               ▼  │  │
│  │   ┌─────────────────┐    ┌────────────────┐  ┌──────────┐ │  │
│  │   │ Lambda Endpoint │    │ Local Server   │  │ Offline  │ │  │
│  │   │ (Cloud)         │    │ Route          │  │ Analysis │ │  │
│  │   └─────────────────┘    └────────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

| File | Purpose |
|------|---------|
| `amplify/functions/playwright-autofix/index.ts` | Lambda function handler |
| `amplify/functions/playwright-autofix/function.json` | Lambda configuration |
| `amplify/functions/playwright-autofix/package.json` | Dependencies |
| `server/routes/playwright-autofix.ts` | Express route for local development |
| `playwright-ai-autofix-reporter.ts` | Playwright reporter with AI suggestions |
| `deploy-playwright-autofix.sh` | Deployment script for AWS |

## Deployment

### Option 1: Deploy to AWS Lambda

1. **Prerequisites**
   - AWS CLI installed and configured
   - Appropriate IAM permissions for Lambda and API Gateway

2. **Run the deployment script**
   ```bash
   chmod +x deploy-playwright-autofix.sh
   ./deploy-playwright-autofix.sh
   ```

3. **Set environment variable**
   The script will output the API endpoint. Set it as an environment variable:
   ```bash
   export PLAYWRIGHT_AUTOFIX_ENDPOINT="https://XXXXXX.execute-api.us-east-1.amazonaws.com/prod/autofix"
   ```

### Option 2: Use Amplify Backend (Recommended)

The function is already integrated into the Amplify backend configuration:

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

Deploy with Amplify:
```bash
npx ampx deploy
```

### Option 3: Local Development Server

The autofix endpoint is available on the local development server:

```bash
# Start the development server
pnpm dev

# The endpoint is available at:
# http://localhost:3002/api/playwright-autofix/analyze
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

| Variable | Description | Default |
|----------|-------------|---------|
| `PLAYWRIGHT_AUTOFIX_ENDPOINT` | Lambda/Server endpoint URL | None (offline mode) |
| `AUTOFIX_LAMBDA_URL` | Alternative endpoint URL | None |

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