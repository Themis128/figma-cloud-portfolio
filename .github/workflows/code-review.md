---
description: |
  Perform automated code review for pull requests. This workflow runs linting,
  type checking, and basic security scans on PR changes.

on:
  pull_request:
    branches: [production, main, develop]
  workflow_dispatch:

timeout-minutes: 15

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

  - name: Run ESLint
    run: |
      echo "Running ESLint..."
      pnpm lint 2>&1 | tee /tmp/eslint-results.txt || true
      echo "ESLint completed"
    shell: bash

  - name: Run TypeScript type checking
    run: |
      echo "Running TypeScript type checking..."
      pnpm typecheck 2>&1 | tee /tmp/typescript-results.txt || true
      echo "TypeScript checking completed"
    shell: bash

  - name: Run security audit
    run: |
      echo "Running security audit..."
      pnpm audit 2>&1 | tee /tmp/security-results.txt || true
      echo "Security audit completed"
    shell: bash

  - name: Check for secrets
    run: |
      echo "Scanning for secrets..."
      # Basic secret detection - check for common patterns
      grep -r "password.*=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . || true
      grep -r "secret.*=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . || true
      grep -r "key.*=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . || true
      echo "Secret scan completed"
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
    title-prefix: "Code Review"
    category: "q-a"
    max: 1
  create-issue:
    labels: [security, automated, code-review]
    max: 3
  noop:

engine: copilot
---

# Automated Code Review

Your name is ${{ github.workflow }}. Your job is to perform automated code review for pull requests.

## Step 1: Analyze Code Quality

Read the results from the various checks:

```bash
cat /tmp/eslint-results.txt
cat /tmp/typescript-results.txt
cat /tmp/security-results.txt
```

## Step 2: Check for Security Issues

Look for:
- ESLint errors or warnings
- TypeScript type errors
- Security vulnerabilities from audit
- Potential secrets or sensitive data in code

## Step 3: Review PR Changes

Get the list of changed files in the PR:

```bash
git diff --name-only ${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }}
```

## Step 4: Generate Review Report

Create a discussion with this structure:

### Title: `Code Review - PR #${{ github.event.pull_request.number }} - [DATE]`

### Body:

```markdown
## Code Quality Summary

**PR**: #${{ github.event.pull_request.number }}
**Author**: [Author Name]
**Files Changed**: [number of files]

## Linting Results
[Include ESLint results summary]

## Type Checking Results
[Include TypeScript results summary]

## Security Scan Results
[Include security audit results]

## Recommendations

### ✅ Good Practices Found
- [List positive findings]

### ⚠️ Issues to Address
- [List specific issues with file references]

### 🔒 Security Concerns
- [List any security issues found]

## Next Steps
1. Address any ESLint errors
2. Fix TypeScript type issues
3. Review security vulnerabilities
4. Remove any exposed secrets

<details>
<summary>Full Check Results</summary>
[Include detailed output from all checks]
</details>
```

## Step 5: Create Issues for Security Problems

If security vulnerabilities or exposed secrets are found:
- Create issues titled "Security Issue - [description]"
- Include specific file locations and remediation steps
- Add security and automated labels

If no issues found:
- Use `noop` with message "Code review completed - no security issues found"

## Step 6: Update Cache Memory

Save review results to cache memory:

```json
{
  "pr_number": ${{ github.event.pull_request.number }},
  "review_date": "[TODAY's DATE]",
  "issues_found": [number],
  "security_issues": [number]
}