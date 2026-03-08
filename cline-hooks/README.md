# Cline Hooks System

This directory contains custom scripts that can be executed at specific points in Cline's execution lifecycle for automation and integration with external tools.

## Overview

Cline hooks allow you to:

- Run custom scripts before/after code generation
- Execute tests automatically after changes
- Trigger deployments on specific events
- Integrate with external APIs and services
- Enforce code quality standards

## Hook Types

### Pre-Execution Hooks

- `pre-task-start.ts` - Runs before any task begins
- `pre-code-generation.ts` - Runs before code is generated
- `pre-commit.ts` - Runs before code is committed

### Post-Execution Hooks

- `post-task-complete.ts` - Runs after a task completes
- `post-code-generation.ts` - Runs after code is generated
- `post-test-run.ts` - Runs after tests complete

### Event-Based Hooks

- `on-error.ts` - Runs when an error occurs
- `on-deployment.ts` - Runs during deployment events
- `on-api-call.ts` - Runs on API integration events

### Specialized Hooks

#### Deployment Hooks
- `deploy/post-deployment.ts` - Post-deployment validation and health checks

#### Testing Hooks
- `test/integration-tests.ts` - Integration tests for API endpoints and external services

#### Code Quality Hooks
- `lint/code-quality.ts` - Comprehensive code quality analysis

#### API Integration Hooks
- `api/claude-integration.ts` - Anthropic Claude API integration validation

#### Task-Specific Hooks
- `tasks/feature-branch-setup.ts` - Feature branch setup with proper structure
- `tasks/pr-merge-preparation.ts` - PR merge preparation and final checks

## Usage

1. Create hook scripts in this directory
2. Make them executable: `chmod +x <hook-name>.ts`
3. Configure hooks in `.clinerules` or VSCode settings

## Configuration

Hooks can be configured via:

- `.clinerules` file (root level)
- `.vscode/settings.json`
- Environment variables

## Available Scripts

### Core Hooks
- `pre-task-start.ts` - Task initialization and environment checks
- `pre-code-generation.ts` - Code generation validation and path checking
- `post-task-complete.ts` - Task completion logging and auto-testing
- `post-code-generation.ts` - Code formatting and validation
- `pre-commit.ts` - Pre-commit quality checks (linting, type checking, tests)
- `post-test-run.ts` - Test result analysis and reporting
- `on-error.ts` - Error analysis and recovery suggestions
- `on-deployment.ts` - Deployment validation and reporting
- `on-api-call.ts` - API call validation and logging

### Specialized Hooks

#### Deployment
- `deploy/post-deployment.ts` - Post-deployment health checks and smoke tests

#### Testing
- `test/integration-tests.ts` - API endpoint and external service testing

#### Code Quality
- `lint/code-quality.ts` - ESLint, TypeScript, security audit, complexity analysis

#### API Integration
- `api/claude-integration.ts` - Claude API validation and usage tracking

#### Task Management
- `tasks/feature-branch-setup.ts` - Feature branch creation with templates
- `tasks/pr-merge-preparation.ts` - PR merge readiness checks

## Hook Execution

Hooks are executed automatically by Cline at the appropriate lifecycle points:

1. **Pre-execution**: Before task/code generation starts
2. **Post-execution**: After task/code generation completes
3. **Event-based**: When specific events occur (errors, deployments, API calls)

## Reports and Logging

Hooks generate detailed reports and logs:

- **Reports**: Saved to `.cline/reports/` directory
- **Logs**: Saved to `.cline/logs/` directory
- **Metrics**: Performance and usage data

## Examples

### Running a Hook Manually
```bash
npx tsx cline-hooks/pre-commit.ts
npx tsx cline-hooks/post-deployment.ts production v1.0.0
```

### Creating a New Hook
```typescript
#!/usr/bin/env tsx
/**
 * Custom Hook Description
 * 
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/<path>
 */

import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Custom hook execution");
  // Your hook logic here
}

main().catch(console.error);
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Logging**: Use console.log for user-visible messages
3. **Performance**: Keep hooks fast and efficient
4. **Configuration**: Use environment variables for configuration
5. **Testing**: Test hooks manually before relying on automation
6. **Documentation**: Document hook purpose and usage

## Integration with Workflows

Hooks work seamlessly with GitHub Agentic Workflows:

- Pre-commit hooks run before workflow execution
- Post-execution hooks run after workflow completion
- Error hooks provide debugging information
- Deployment hooks validate workflow results

## Troubleshooting

### Hook Not Executing
- Check if hook file is executable: `chmod +x <hook>.ts`
- Verify hook is in the correct directory
- Check `.clinerules` configuration

### Hook Failing
- Run hook manually to see error details
- Check logs in `.cline/logs/`
- Verify dependencies are installed

### Performance Issues
- Optimize hook execution time
- Use caching for expensive operations
- Consider async operations where appropriate

## Security Considerations

- Hooks have access to your project files
- Be careful with external API calls
- Validate all inputs and outputs
- Use secure credential storage