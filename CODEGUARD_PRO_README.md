# CodeGuard Pro Extension Setup

This document outlines the setup and configuration of the CodeGuard Pro VS Code extension for the portfolio-nextjs project.

## Overview

CodeGuard Pro is a comprehensive code analysis and security extension that provides real-time code quality checks, security vulnerability detection, and performance optimization suggestions for your Next.js/TypeScript project.

## Installation Status

✅ **Extension Installed**: `halbonlabs.codeguard-pro`
✅ **Configuration Complete**: Dashboard and analysis rules configured
✅ **VS Code Integration**: Added to workspace recommendations

## Features Enabled

### 1. Dashboard Integration

- **Activity Bar Icon**: Shield icon with real-time metrics
- **Metrics Display**: Code quality scores, security issues, performance metrics
- **Trend Analysis**: Historical data on code improvements
- **Issue Tracking**: Real-time issue count and severity levels

### 2. Code Analysis Rules

#### TypeScript Analysis

- `no-unused-vars`: Detect unused variables
- `no-console`: Warn about console statements in production code
- `prefer-const`: Suggest const over let when possible
- `no-var`: Enforce use of let/const over var
- `strict-null-checks`: TypeScript null safety checks
- `no-implicit-any`: Prevent implicit any types
- `prefer-arrow-callback`: Suggest arrow functions

#### Next.js Specific Rules

- `nextjs/no-html-link-for-pages`: Prevent direct HTML links to pages
- `nextjs/no-img-element`: Enforce use of Next.js Image component
- `nextjs/no-page-custom-font`: Warn about custom font usage
- `nextjs/no-sync-scripts`: Prevent synchronous script loading
- `nextjs/no-title-in-document-head`: Enforce proper title management

#### Security Analysis

- `detect-hardcoded-secrets`: Find hardcoded API keys and secrets
- `detect-insecure-api-usage`: Identify insecure API calls
- `detect-xss-vulnerabilities`: Cross-site scripting detection
- `detect-sql-injection`: SQL injection vulnerability detection

#### Performance Analysis

- `detect-inefficient-loops`: Identify performance bottlenecks
- `detect-memory-leaks`: Memory leak detection
- `detect-unnecessary-re-renders`: React performance optimization

### 3. Auto-Fix Capabilities

The following rules can be automatically fixed:

- `prefer-const`
- `no-var`
- `prefer-arrow-callback`
- `no-unused-vars`

### 4. Configuration Files

#### `.vscode/codeguard-pro.json`

Main configuration file with all analysis rules and settings.

#### `.vscode/settings.json`

VS Code workspace settings with CodeGuard Pro specific configurations.

#### `.vscode/extensions.json`

VS Code extension recommendations including CodeGuard Pro.

## Usage Instructions

### Dashboard Access

1. Click the **shield icon** in the VS Code activity bar
2. View real-time code metrics and issues
3. Access detailed reports and trends

### Real-time Analysis

- Code analysis runs automatically as you type
- Issues appear as squiggly underlines in the editor
- Hover over issues for detailed explanations
- Use Quick Fix (Ctrl+. or Cmd+.) for auto-fixable issues

### Manual Analysis

- Right-click in editor and select "CodeGuard Pro: Analyze File"
- Use Command Palette (Ctrl+Shift+P or Cmd+Shift+P) and search "CodeGuard Pro"

### Configuration

- Modify `.vscode/codeguard-pro.json` to customize rules
- Adjust severity levels and ignore patterns
- Enable/disable specific analysis types

## Ignored Files and Directories

The following are excluded from analysis:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- Test files (`*.test.ts`, `*.spec.ts`)
- Test directories (`**/__tests__/**`, `**/playwright-tests/**`)

## Severity Levels

- **Error**: Critical issues (security vulnerabilities, critical bugs)
- **Warning**: Performance and best practice issues
- **Info**: Style suggestions and minor improvements

## Troubleshooting

### Extension Not Loading

1. Ensure VS Code is restarted after installation
2. Check `.vscode/extensions.json` includes the extension
3. Verify extension is installed: `code --list-extensions | grep codeguard`

### Dashboard Not Appearing

1. Check `codeguard-pro.dashboard.enabled` is set to `true`
2. Verify `codeguard-pro.dashboard.position` is set to `"activity-bar"`
3. Restart VS Code

### Analysis Not Running

1. Ensure `codeguard-pro.enabled` is `true`
2. Check file is not in ignore list
3. Verify file type is supported (TypeScript, JavaScript, JSX, TSX)

## Integration with Existing Tools

CodeGuard Pro works alongside your existing development tools:

- **ESLint**: Complements existing linting rules
- **Prettier**: Formatting rules work independently
- **TypeScript**: Enhances TypeScript compiler checks
- **Next.js**: Provides Next.js-specific optimizations

## Performance Impact

CodeGuard Pro is optimized for minimal performance impact:

- Analysis runs in background threads
- Only analyzes open files and recent changes
- Respects VS Code's performance settings
- Can be disabled for large files if needed

## Support

For issues or questions about CodeGuard Pro:

1. Check the extension's official documentation
2. Review the configuration files in `.vscode/`
3. Use the dashboard for detailed error information
4. Report issues through the VS Code extension marketplace
