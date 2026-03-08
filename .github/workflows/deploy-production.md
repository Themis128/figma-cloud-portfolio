---
description: |
  Deploy the portfolio to production on AWS Amplify. This workflow builds the Next.js app,
  deploys to Amplify, and validates the deployment with smoke tests.

on:
  push:
    branches: [production]
  workflow_dispatch:

timeout-minutes: 30

permissions: read-all

network: defaults

steps:
  - name: Checkout repository
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
      persist-credentials: false

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: 20

  - name: Install pnpm
    uses: pnpm/action-setup@v4

  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    shell: bash

  - name: Install Playwright browsers
    run: npx playwright install chromium --with-deps
    shell: bash

  - name: Build application
    run: |
      echo "Building Next.js application..."
      pnpm build
      echo "Build completed successfully"
    shell: bash
    env:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
      NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
      NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.NEXT_PUBLIC_SENTRY_DSN }}
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ${{ secrets.NEXT_PUBLIC_RECAPTCHA_SITE_KEY }}

  - name: Deploy to AWS Amplify
    run: |
      echo "Deploying to AWS Amplify..."
      pnpm amplify:deploy
      echo "Amplify deployment completed"
    shell: bash
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_REGION: us-east-1

  - name: Wait for deployment
    run: |
      echo "Waiting for deployment to complete..."
      sleep 60
      echo "Deployment should be complete"
    shell: bash

  - name: Run smoke tests
    run: |
      echo "Running smoke tests against production URL..."
      PLAYWRIGHT_BASE_URL=${{ secrets.NEXT_PUBLIC_SITE_URL }} \
      npx playwright test --config=playwright.config.fast.ts \
        --reporter=list \
        --grep="smoke" \
        2>&1 | tee /tmp/smoke-test-results.txt || true
      echo "Smoke tests completed"
    shell: bash

tools:
  github:
    toolsets: [all]
  bash: true
  cache-memory: true

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-discussion:
    title-prefix: "Deploy Report"
    category: "announcements"
    max: 1
  noop:

engine: copilot
---

# Production Deployment Workflow

Your name is ${{ github.workflow }}. Your job is to deploy the portfolio to production and validate the deployment.

## Step 1: Monitor Deployment Status

Check the deployment status by reading the smoke test results:

```bash
cat /tmp/smoke-test-results.txt
```

## Step 2: Analyze Results

From the test output, determine:
- **Deployment Status**: Did the build and deploy succeed?
- **Smoke Test Results**: Did the smoke tests pass?
- **Issues Found**: Any failures or errors?

## Step 3: Create Deployment Report

Create a discussion with this structure:

### Title: `Production Deployment - [DATE] - [STATUS]`

### Body:

```markdown
## Deployment Summary

**Branch**: Production
**Commit**: [commit hash]
**Time**: [deployment time]
**Status**: [SUCCESS/FAILED]

## Build Results
- ✅ Build completed successfully
- ✅ Amplify deployment completed
- [Add any build warnings or issues]

## Smoke Test Results
[Include pass/fail summary from smoke tests]

## Production URL
${{ secrets.NEXT_PUBLIC_SITE_URL }}

## Next Steps
- Monitor the site for any issues
- Check analytics and error tracking
- Verify all integrations are working

<details>
<summary>Full Test Output</summary>
[Include the smoke test output]
</details>
```

## Step 4: Handle Failures

If deployment or smoke tests failed:
- Create an issue titled "Production Deployment Failed - [DATE]"
- Include error details and steps to investigate
- Tag relevant team members

If deployment succeeded:
- Use `noop` with message "Production deployment successful - no issues found"

## Step 5: Update Cache Memory

Save deployment status to cache memory:

```json
{
  "last_deploy": "[TODAY's DATE]",
  "status": "success"
}