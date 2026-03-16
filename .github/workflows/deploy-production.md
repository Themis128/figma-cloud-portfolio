---
description: |
  Deploy the portfolio to production via S3 + CloudFront.
  Generates Amplify backend outputs, builds Next.js static export,
  syncs to S3, invalidates CloudFront, and validates with smoke tests.

on:
  push:
    branches: [production]
  workflow_dispatch:

timeout-minutes: 20

permissions: read-all

network: defaults

steps:
  - name: Checkout repository
    uses: actions/checkout@v6
    with:
      fetch-depth: 0
      persist-credentials: false

  - name: Setup Node.js
    uses: actions/setup-node@v6
    with:
      node-version: 22

  - name: Install pnpm
    uses: pnpm/action-setup@v4

  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    shell: bash

  - name: Configure AWS credentials
    uses: aws-actions/configure-aws-credentials@v6
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: us-east-1

  - name: Generate Amplify outputs
    run: npx ampx generate outputs --branch production --app-id ${{ secrets.AMPLIFY_PRODUCTION_APP_ID }}
    shell: bash

  - name: Build application
    run: |
      echo "Building Next.js static export..."
      pnpm build
      echo "Build completed successfully"
    shell: bash
    env:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: https://www.baltzakisthemis.com
      NEXT_PUBLIC_API_BASE_URL: /api
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: ${{ secrets.NEXT_PUBLIC_RECAPTCHA_SITE_KEY }}
      NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
      NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
      NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}

  - name: Deploy to S3
    run: |
      echo "Syncing to s3://figma-portfolio-static..."
      aws s3 sync out/ s3://figma-portfolio-static --delete --region us-east-1
      echo "S3 sync completed"
    shell: bash

  - name: Invalidate CloudFront
    run: |
      INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id E134SCTR0QGQKJ \
        --paths "/*" \
        --query 'Invalidation.Id' --output text)
      echo "CloudFront invalidation: ${INVALIDATION_ID}"
      aws cloudfront wait invalidation-completed \
        --distribution-id E134SCTR0QGQKJ \
        --id "${INVALIDATION_ID}"
      echo "Invalidation completed"
      echo "${INVALIDATION_ID}" > /tmp/invalidation-id.txt
    shell: bash

  - name: Install Playwright browsers
    run: npx playwright install chromium --with-deps
    shell: bash

  - name: Run smoke tests
    run: |
      echo "Running smoke tests against production..."
      PLAYWRIGHT_BASE_URL=https://www.baltzakisthemis.com \
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
  create-issue:
    title-prefix: "Deploy Report"
    labels: [automation, deployment]
    close-older-issues: true
    expires: 7d
    max: 1
  noop:

engine: copilot
---

# Production Deployment Workflow (S3 + CloudFront)

Your name is ${{ github.workflow }}. Your job is to deploy the portfolio to production via S3 + CloudFront and validate the deployment.

## Deployment Strategy

This workflow deploys the Next.js static export directly to S3, bypassing Amplify Hosting's build system (which cannot handle the Next.js 16 build within its memory limits). The Amplify Gen 2 backend (Cognito + AppSync + DynamoDB) is deployed separately via `ampx pipeline-deploy` in the `amplify.yml` backend phase.

## Step 1: Gather Deployment Info

Collect key deployment details:

```bash
echo "=== Deployment Info ==="
echo "Commit: $(git rev-parse --short HEAD)"
echo "Branch: $(git branch --show-current)"
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""
echo "=== S3 Sync Status ==="
aws s3 ls s3://figma-portfolio-static/ --summarize --human-readable | tail -2
echo ""
echo "=== CloudFront Invalidation ==="
cat /tmp/invalidation-id.txt 2>/dev/null || echo "No invalidation ID found"
```

## Step 2: Analyze Smoke Test Results

Read and analyze the smoke test output:

```bash
cat /tmp/smoke-test-results.txt
```

From the test output, determine:
- **Build Status**: Did the Next.js build and S3 sync succeed?
- **CloudFront Status**: Did the invalidation complete?
- **Smoke Test Results**: Did the smoke tests pass?
- **Issues Found**: Any failures or errors?

## Step 3: Verify Production Site

Check that the production site is responding correctly:

```bash
echo "=== HTTP Status Check ==="
curl -s -o /dev/null -w "https://www.baltzakisthemis.com → %{http_code} (%{time_total}s)\n" https://www.baltzakisthemis.com
curl -s -o /dev/null -w "https://baltzakisthemis.com → %{http_code} (%{time_total}s)\n" https://baltzakisthemis.com

echo ""
echo "=== Response Headers ==="
curl -sI https://www.baltzakisthemis.com | head -15
```

## Step 4: Create Deployment Report

Create an issue with this structure:

### Title: `Production Deployment - [DATE] - [STATUS]`

### Body:

```markdown
## Deployment Summary

**Branch**: production
**Commit**: [commit hash]
**Time**: [deployment time UTC]
**Status**: [SUCCESS/FAILED]
**Method**: S3 sync + CloudFront invalidation

## Infrastructure
- **S3 Bucket**: figma-portfolio-static (us-east-1)
- **CloudFront**: E134SCTR0QGQKJ
- **Invalidation ID**: [from /tmp/invalidation-id.txt]

## Build Results
- [✅/❌] Next.js static export built
- [✅/❌] Amplify outputs generated (backend config)
- [✅/❌] S3 sync completed
- [✅/❌] CloudFront invalidation completed
- [Add any build warnings or issues]

## Smoke Test Results
[Include pass/fail summary from smoke tests]

## Production URLs
- https://www.baltzakisthemis.com
- https://baltzakisthemis.com

## Next Steps
- Monitor the site for any issues
- Check analytics and error tracking
- Verify Amplify backend (auth + data) is operational

<details>
<summary>Full Test Output</summary>

[Include the smoke test output]
</details>
```

## Step 5: Handle Failures

If deployment or smoke tests failed:
- Create an issue titled "Production Deployment Failed - [DATE]"
- Include error details and steps to investigate
- Tag relevant team members

If deployment succeeded:
- Use `noop` with message "Production deployment successful - no issues found"

## Step 6: Update Cache Memory

Save deployment status to cache memory:

```json
{
  "last_deploy": "[TODAY's DATE]",
  "status": "success",
  "method": "s3-cloudfront",
  "commit": "[COMMIT_HASH]"
}
```
