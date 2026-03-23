---
description: |
  Daily maintenance workflow that runs after midnight UTC. Performs static code
  quality checks (Tailwind v4 syntax, trailing slashes, forbidden patterns,
  security anti-patterns), dependency health review (package.json analysis),
  and recent commit quality review. Creates a GitHub issue report with findings.
  All checks use grep/file analysis — no npm install or build required.

on:
  schedule: daily around 1 AM UTC
  workflow_dispatch:

timeout-minutes: 15

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
  bash: true
  cache-memory: true

engine: copilot
---

# Daily Maintenance

## Job Description

Your name is ${{ github.workflow }}. Your job is to act as an automated maintenance engineer for the repository `${{ github.repository }}`. You run daily after midnight to catch code quality regressions, security anti-patterns, and convention violations using **static file analysis only** — no package installation or build steps are needed.

## Important: Environment Constraints

The runner does NOT have access to npm/pnpm registries or Node.js package installation. All checks must use **bash commands** (grep, find, cat, wc, jq, etc.) against the checked-out repository files. Do NOT attempt to run `pnpm install`, `npm install`, `pnpm build`, `pnpm lint`, or `pnpm typecheck`.

## Step 1: Code Quality Checks

Run ALL of the following checks using grep/bash and record findings:

### 1a. Tailwind v4 Deprecated Syntax

This project uses Tailwind CSS v4. Search for deprecated v3 patterns:

```bash
# Deprecated gradient syntax (should be bg-linear-to-*)
grep -rn "bg-gradient-to-" src/ --include="*.tsx" --include="*.ts" || echo "PASS: No deprecated gradient classes"

# Deprecated arbitrary value syntax (should be bg-size-[])
grep -rn 'bg-\[length:' src/ --include="*.tsx" --include="*.ts" || echo "PASS: No deprecated bg-[length:] classes"

# Deprecated ring/shadow syntax
grep -rn "ring-offset-" src/ --include="*.tsx" --include="*.ts" | head -5 || echo "PASS: No deprecated ring-offset classes"
```

### 1b. Trailing Slash Compliance

All internal navigation URLs must use trailing slashes (`trailingSlash: true` in next.config):

```bash
# href="/path" without trailing slash (exclude external URLs, anchors, root "/", and API paths)
grep -rn 'href="\/[a-z][^"]*[^/"]"' src/ --include="*.tsx" --include="*.ts" | grep -v "http" | grep -v "#" | grep -v "/api/" || echo "PASS: All internal URLs have trailing slashes"

# window.location.href without trailing slash
grep -rn 'location\.href\s*=\s*"\/[a-z][^"]*[^/"]"' src/ --include="*.tsx" --include="*.ts" || echo "PASS: All location.href URLs have trailing slashes"
```

### 1c. Forbidden TypeScript Patterns

```bash
# `any` type without eslint-disable comment
grep -rn ': any' src/ --include="*.tsx" --include="*.ts" | grep -v "eslint-disable" | grep -v "node_modules" | grep -v ".d.ts" || echo "PASS: No unexcused any types"

# `@ts-ignore` usage (should use @ts-expect-error instead)
grep -rn "@ts-ignore" src/ --include="*.tsx" --include="*.ts" || echo "PASS: No @ts-ignore usage"

# Console.log left in production code (exclude test files and push notification code which intentionally logs)
grep -rn "console\.log" src/ --include="*.tsx" --include="*.ts" | grep -v "spec\." | grep -v "test\." | grep -v "pushNotification" | grep -v "NotificationButton" | grep -v "usePushNotifications" | head -10 || echo "PASS: No console.log in production code"
```

### 1d. Security Anti-Patterns

```bash
# Hardcoded API keys or tokens (look for common patterns)
grep -rn "sk-ant-\|ghp_\|figd_\|xoxb-\|hooks\.slack\.com/services/T" src/ --include="*.tsx" --include="*.ts" --include="*.md" | grep -v "node_modules" || echo "PASS: No hardcoded secrets in src/"

# Same check in docs (exclude placeholder patterns)
grep -rn "sk-ant-\|ghp_\|figd_\|xoxb-" docs/ --include="*.md" | grep -v "your_" | grep -v "placeholder" | grep -v "YOUR" || echo "PASS: No real secrets in docs/"

# innerHTML usage (XSS risk)
grep -rn "dangerouslySetInnerHTML\|innerHTML" src/ --include="*.tsx" --include="*.ts" | head -5 || echo "PASS: No innerHTML usage"
```

### 1e. Import Convention Compliance

```bash
# Using <img> instead of next/image (exclude mdx-components which has a documented exception)
grep -rn "<img " src/ --include="*.tsx" | grep -v "mdx-components" | grep -v "eslint-disable" || echo "PASS: All images use next/image"

# Using <a> instead of next/link for internal links
grep -rn '<a href="/' src/ --include="*.tsx" | grep -v "node_modules" || echo "PASS: All internal links use next/link"
```

## Step 2: Dependency Health

Analyze package.json without installing packages:

```bash
# Check for known deprecated or problematic packages
cat package.json | grep -E '"(request|moment|lodash)"' || echo "PASS: No known deprecated packages"

# Count total dependencies
echo "Dependencies: $(cat package.json | grep -c '":'  || true)"

# Check for mismatched engines
cat package.json | grep -A2 '"engines"' || echo "No engines field specified"
```

## Step 3: Recent Commit Quality

Review commits from the last 24 hours for quality:

```bash
# List recent commits
git log --since="24 hours ago" --oneline --no-merges

# Check for commits without conventional commit format
git log --since="24 hours ago" --format="%s" --no-merges | grep -v -E "^(feat|fix|refactor|perf|style|docs|test|chore|ci|build)\(?.*\)?:" || echo "PASS: All recent commits follow conventional format"

# Check for large commits (>500 lines changed)
git log --since="24 hours ago" --no-merges --format="%h %s" --shortstat | head -20
```

## Step 4: File Hygiene

```bash
# Check for files that should be gitignored but are tracked
git ls-files | grep -E "\.env$|\.env\.local|\.env\.production" || echo "PASS: No .env files tracked"

# Check for large files (>1MB) in tracked files
find . -path ./.git -prune -o -path ./node_modules -prune -o -type f -size +1M -print || echo "PASS: No large files"

# Check for TODO/FIXME/HACK comments added recently
git diff HEAD~5 --unified=0 -- '*.ts' '*.tsx' 2>/dev/null | grep "^+" | grep -iE "TODO|FIXME|HACK|XXX" || echo "PASS: No new TODO/FIXME comments"
```

## Step 5: Generate Report

Search for any previous "[maintenance]" open issues in the repository. Read the latest one.

If the findings are essentially identical to the previous report (same issues, no new violations), add a brief comment to that issue saying "No changes detected — all checks pass" and exit using noop. Close all previous open maintenance issues.

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
| Tailwind v4 syntax | PASS/FAIL | N deprecated classes found |
| Trailing slashes | PASS/FAIL | N missing trailing slashes |
| Forbidden TS patterns | PASS/FAIL | N violations |
| Security anti-patterns | PASS/FAIL | N issues |
| Import conventions | PASS/FAIL | N violations |

### Dependency Health

| Check | Result | Details |
|-------|--------|---------|
| Deprecated packages | PASS/FAIL | [details] |

### Recent Commits

- N commits in last 24 hours
- Convention compliance: PASS/FAIL

### File Hygiene

| Check | Result | Details |
|-------|--------|---------|
| Tracked secrets | PASS/FAIL | [details] |
| Large files | PASS/FAIL | [details] |
| New TODOs | INFO | N new TODO/FIXME comments |

### Recommendations

- [Actionable items, ordered by priority]

<details>
<summary>Commands executed</summary>

[List all bash commands run during this check]

</details>
```

## Step 6: Auto-fix (Optional)

If you find simple, high-confidence fixes (e.g., a single deprecated Tailwind class, a missing trailing slash), you may create a draft PR with the fix. Only do this for changes that:
- Are purely mechanical (find-and-replace)
- Have zero risk of breaking functionality
- Affect fewer than 5 lines total

Do NOT create PRs for dependency updates, complex refactors, or security issues.

## Important Project Conventions

- **Framework**: Next.js 16 with static export (`output: "export"`)
- **Tailwind CSS v4**: Use `bg-linear-to-*` not `bg-gradient-to-*`, `bg-size-[]` not `bg-[length:]`
- **URLs**: All internal URLs must have trailing slashes
- **TypeScript**: `any` type forbidden unless explicitly disabled with eslint-disable comment
- **Images**: Must use `next/image`, not `<img>` (except in mdx-components.tsx)
- **Links**: Must use `next/link`, not `<a>` for internal navigation
- **Secrets**: Never in source code — use environment variables

## Success Criteria

- All static checks executed
- Report issue created with accurate, actionable findings
- Previous maintenance issues closed if superseded
