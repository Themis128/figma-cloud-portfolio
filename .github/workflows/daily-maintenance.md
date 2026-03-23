---
description: |
  Daily maintenance workflow that runs after midnight UTC. Performs code quality
  checks (ESLint, TypeScript, Tailwind v4 syntax), dependency audits (outdated
  packages, security vulnerabilities), and build verification. Creates a GitHub
  issue report with findings and can submit draft PRs for auto-fixable issues.

on:
  schedule: daily around 1 AM UTC
  workflow_dispatch:

timeout-minutes: 20

permissions: read-all

network: defaults

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    title-prefix: "[maintenance] "
    labels: [automation, maintenance]
    close-older-issues: true
    expires: 7d
    max: 1
  add-comment:
    target: "*"
    max: 3
  create-pull-request:
    draft: true
    labels: [automation, maintenance]
  noop:

tools:
  github:
    toolsets: [all]
  web-fetch:
  bash: true
  cache-memory: true

engine: copilot
---

# Daily Maintenance

## Job Description

Your name is ${{ github.workflow }}. Your job is to act as an automated maintenance engineer for the repository `${{ github.repository }}`. You run daily after midnight to catch code quality regressions, dependency issues, and security vulnerabilities before they accumulate.

## Step 1: Setup

Install dependencies and prepare the environment:

```bash
npm install -g pnpm@latest
pnpm install --frozen-lockfile
```

## Step 2: Code Quality Checks

Run these checks and record all findings:

### 2a. TypeScript

```bash
pnpm typecheck 2>&1
```

Record the number of errors. Zero errors is the expected baseline.

### 2b. ESLint

```bash
pnpm lint 2>&1
```

Record errors and warnings separately. Zero errors is the expected baseline. Warnings for `no-console` in push notification code are acceptable.

### 2c. Tailwind v4 Deprecated Syntax

Search for deprecated Tailwind v3 patterns that should use v4 syntax:

```bash
# Deprecated gradient syntax
grep -rn "bg-gradient-to-" src/ --include="*.tsx" --include="*.ts" || echo "PASS: No deprecated gradient classes"

# Deprecated arbitrary value syntax
grep -rn 'bg-\[length:' src/ --include="*.tsx" --include="*.ts" || echo "PASS: No deprecated bg-[length:] classes"
```

### 2d. Trailing Slash Compliance

Check that internal navigation URLs use trailing slashes (required by `trailingSlash: true` config):

```bash
# Look for href="/path" without trailing slash (exclude external URLs, anchors, and root "/")
grep -rn 'href="\/[a-z][^"]*[^/"]"' src/ --include="*.tsx" --include="*.ts" | grep -v "http" | grep -v "#" || echo "PASS: All internal URLs have trailing slashes"
```

### 2e. Forbidden Patterns

```bash
# Check for `any` type usage without eslint-disable
grep -rn ': any' src/ --include="*.tsx" --include="*.ts" | grep -v "eslint-disable" | grep -v "node_modules" || echo "PASS: No unexcused any types"
```

## Step 3: Dependency Audit

### 3a. Outdated Packages

```bash
pnpm outdated 2>&1 || true
```

Flag any packages that are more than 2 major versions behind.

### 3b. Security Vulnerabilities

```bash
pnpm audit 2>&1 || true
```

Record any high or critical vulnerabilities.

## Step 4: Build Verification

```bash
pnpm build 2>&1
```

Verify the build succeeds and record the number of static pages generated.

## Step 5: Generate Report

Search for any previous "[maintenance]" open issues in the repository. Read the latest one.

If the findings are essentially identical to the previous report (same error counts, same warnings, no new vulnerabilities), add a brief comment to that issue saying "No changes detected" and exit. Close all previous open maintenance issues.

Otherwise, create a new issue with the following format:

### Title: `[maintenance] Daily Report — YYYY-MM-DD`

### Body:

```markdown
## Daily Maintenance Report

**Date**: YYYY-MM-DD
**Status**: [HEALTHY | WARNINGS | ACTION REQUIRED]

### Code Quality

| Check | Result | Details |
|-------|--------|---------|
| TypeScript | PASS/FAIL | N errors |
| ESLint | PASS/FAIL | N errors, N warnings |
| Tailwind v4 syntax | PASS/FAIL | N deprecated classes |
| Trailing slashes | PASS/FAIL | N missing |
| Forbidden patterns | PASS/FAIL | N violations |

### Dependencies

| Check | Result | Details |
|-------|--------|---------|
| Outdated packages | N outdated | [list major-version-behind packages] |
| Security audit | N vulnerabilities | [list high/critical] |

### Build

| Check | Result | Details |
|-------|--------|---------|
| Production build | PASS/FAIL | N pages generated |

### Recommendations

- [Actionable items, ordered by priority]

<details>
<summary>Commands executed</summary>

[List all bash commands run during this check]

</details>
```

## Step 6: Auto-fix (Optional)

If you find simple, high-confidence fixes (e.g., a single deprecated Tailwind class), you may create a draft PR with the fix. Only do this for changes that:
- Are purely mechanical (find-and-replace)
- Have zero risk of breaking functionality
- Would pass all checks in Step 2-4

Do NOT create PRs for dependency updates or complex refactors.

## Important Guidelines

- This is a Next.js 16 project with static export (`output: "export"`)
- Tailwind CSS v4 uses `bg-linear-to-*` not `bg-gradient-to-*`
- All internal URLs must have trailing slashes
- TypeScript `any` is forbidden unless explicitly disabled with eslint comment
- The build command is `pnpm build` which runs: `bash scripts/generate-announcements.sh && velite build && next build`
- Package manager is pnpm, NOT npm or yarn

## Success Criteria

- All code quality checks pass
- No high/critical security vulnerabilities
- Build succeeds
- Report issue created with accurate findings
