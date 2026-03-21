---
description: |
  Monitor and report on application performance metrics. This workflow runs
  performance tests, analyzes bundle size, and tracks Web Vitals metrics.

on:
  schedule: weekly on Saturday around 6 AM UTC
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
      node-version: 20

  - name: Enable corepack
    run: corepack enable

  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    shell: bash

  - name: Install Playwright browsers
    run: npx playwright install chromium --with-deps
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
      echo "Building application for performance analysis..."
      pnpm build
      echo "Build completed"
    shell: bash
    env:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}

  - name: Run performance tests against production
    run: |
      echo "Running performance tests against production..."
      PLAYWRIGHT_BASE_URL=https://www.baltzakisthemis.com \
      npx playwright test --config=playwright.config.fast.ts \
        --reporter=list \
        --grep="performance" \
        2>&1 | tee /tmp/performance-results.txt || true
      echo "Performance tests completed"
    shell: bash

  - name: Analyze bundle size
    run: |
      echo "Analyzing bundle size from build output..."
      if [ -d "out" ]; then
        echo "## Static Export Size" > /tmp/bundle-analysis.txt
        du -sh out/ >> /tmp/bundle-analysis.txt
        echo "" >> /tmp/bundle-analysis.txt
        echo "## Largest Files" >> /tmp/bundle-analysis.txt
        find out/ -type f -name "*.js" -o -name "*.css" | xargs du -sh 2>/dev/null | sort -rh | head -20 >> /tmp/bundle-analysis.txt
      else
        echo "No build output found" > /tmp/bundle-analysis.txt
      fi
      cat /tmp/bundle-analysis.txt
      echo "Bundle analysis completed"
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
    title-prefix: "Performance Report"
    labels: [automation, performance]
    close-older-issues: true
    expires: 7d
    max: 2
  noop:

engine: copilot
---

# Performance Monitoring

Your name is ${{ github.workflow }}. Your job is to monitor and report on application performance metrics.

## Step 1: Analyze Performance Results

Read the performance test results and bundle analysis:

```bash
cat /tmp/performance-results.txt
cat /tmp/bundle-analysis.txt
```

## Step 2: Extract Key Metrics

From the performance tests, identify:
- **Web Vitals**: LCP, FID, CLS, TTFB metrics
- **Performance Scores**: Overall performance ratings
- **Bundle Size**: JavaScript/CSS bundle sizes
- **Load Times**: Page load performance

## Step 3: Compare with Baseline

Load cache memory to compare with previous performance data. The cache should have this structure:

```json
{
  "last_check": "2026-03-07",
  "metrics": {
    "lcp": 1200,
    "fid": 50,
    "cls": 0.1,
    "bundle_size": 1500000
  }
}
```

Compare current metrics with baseline:
- **Improvements**: Metrics that got better
- **Degradations**: Metrics that got worse
- **Trends**: Consistent patterns over time

## Step 4: Generate Performance Report

Create an issue with this structure:

### Title: `Performance Report - [DATE] - [STATUS]`

### Body:

```markdown
## Performance Summary

**Date**: [DATE]
**Status**: [IMPROVED / DEGRADED / STABLE]
**Compared to**: [baseline date]

## Web Vitals Metrics

| Metric | Current | Previous | Target | Status |
|--------|---------|----------|--------|--------|
| LCP | [value]ms | [value]ms | <2.5s | ✅/⚠️/❌ |
| FID | [value]ms | [value]ms | <100ms | ✅/⚠️/❌ |
| CLS | [value] | [value] | <0.1 | ✅/⚠️/❌ |
| TTFB | [value]ms | [value]ms | <600ms | ✅/⚠️/❌ |

## Bundle Analysis

**Total Bundle Size**: [size] MB
**Largest Chunks**:
- [chunk name]: [size] KB
- [chunk name]: [size] KB

## Performance Trends

### ✅ Improvements
- [List metrics that improved]

### ⚠️ Areas of Concern
- [List metrics that degraded]

### 📊 Overall Assessment
[Summary of performance health]

## Recommendations

1. [Specific optimization suggestions]
2. [Bundle size reduction ideas]
3. [Performance monitoring improvements]

<details>
<summary>Full Performance Data</summary>
[Include detailed performance test output]
</details>
```

## Step 5: Create Issues for Performance Problems

If significant performance degradations are found:
- Create issues titled "Performance Issue - [metric name]"
- Include specific metrics, thresholds, and suggested fixes
- Add performance and automated labels

If performance is stable or improved:
- Use `noop` with message "Performance monitoring completed - no issues found"

## Step 6: Update Cache Memory

Save current performance metrics to cache memory:

```json
{
  "last_check": "[TODAY's DATE]",
  "metrics": {
    "lcp": [value],
    "fid": [value],
    "cls": [value],
    "bundle_size": [value]
  }
}