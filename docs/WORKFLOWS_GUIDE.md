# Workflows Guide

This guide explains how to use the automated workflows available in this repository. Workflows allow you to define a series of steps to guide Cline through repetitive tasks, such as deploying a service or submitting a PR.

## Available Workflows

### 1. Production Deployment (`deploy-production.md`)

**Purpose**: Deploy the portfolio to production on AWS Amplify with validation.

**Triggers**:
- Push to `production` branch
- Manual dispatch

**What it does**:
- Builds the Next.js application
- Deploys to AWS Amplify
- Runs smoke tests
- Creates deployment report

**Usage**:
```bash
# Manual trigger
gh aw run deploy-production
```

### 2. Code Review (`code-review.md`)

**Purpose**: Perform automated code review for pull requests.

**Triggers**:
- Pull request to `production`, `main`, or `develop` branches
- Manual dispatch

**What it does**:
- Runs ESLint
- Performs TypeScript type checking
- Executes security audit
- Scans for exposed secrets
- Creates review report

**Usage**:
```bash
# Manual trigger
gh aw run code-review
```

### 3. Performance Monitoring (`performance-monitor.md`)

**Purpose**: Monitor and report on application performance metrics.

**Triggers**:
- Daily at 6 AM UTC
- Manual dispatch

**What it does**:
- Runs performance tests
- Analyzes bundle size
- Tracks Web Vitals metrics
- Compares with baseline
- Creates performance report

**Usage**:
```bash
# Manual trigger
gh aw run performance-monitor
```

### 4. Dependency Update (`dependency-update.md`)

**Purpose**: Monitor and update project dependencies safely.

**Triggers**:
- Weekly on Sundays at 3 AM UTC
- Manual dispatch

**What it does**:
- Checks for outdated packages
- Updates patch versions
- Runs tests after updates
- Updates minor versions if safe
- Creates dependency report

**Usage**:
```bash
# Manual trigger
gh aw run dependency-update
```

### 5. Backup and Restore (`backup-restore.md`)

**Purpose**: Create automated backups of important project files.

**Triggers**:
- Daily at 2 AM UTC
- Manual dispatch

**What it does**:
- Backs up configuration files
- Backs up deployment configurations
- Backs up documentation
- Creates compressed archive
- Uploads to storage

**Usage**:
```bash
# Manual trigger
gh aw run backup-restore
```

## Existing Workflows

The repository already includes several workflows in the `.github/workflows/` directory:

### Agentic Workflows
- **Daily Repo Status** (`daily-repo-status.md`): Creates daily repo activity reports
- **CI Doctor** (`ci-doctor.md`): Analyzes CI failures and provides diagnostics
- **Daily QA** (`daily-qa.md`): Validates builds, tests, docs, and code quality
- **Accessibility Review** (`daily-accessibility-review.md`): WCAG 2.2 compliance checks
- **Malicious Code Scan** (`daily-malicious-code-scan.md`): Reviews code for suspicious patterns
- **Link Checker** (`link-checker.md`): Finds and fixes broken documentation links
- **Playwright Test Runner** (`playwright-test-runner.md`): Runs full E2E test suite

## Setup Instructions

### Prerequisites

1. **GitHub CLI with Agentic Workflows**:
   ```bash
   # Install GitHub CLI
   brew install gh  # macOS
   # or download from https://cli.github.com/
   
   # Install agentic workflows extension
   gh extension install github/gh-aw
   ```

2. **Required Secrets**: Ensure these secrets are configured in your repository settings:
   - `COPILOT_GITHUB_TOKEN` - Fine-grained PAT with "Copilot Requests" permission
   - `AWS_ACCESS_KEY_ID` - For AWS Amplify deployment
   - `AWS_SECRET_ACCESS_KEY` - For AWS Amplify deployment
   - `NEXT_PUBLIC_SITE_URL` - Production site URL

### Compiling Workflows

After editing workflow files, compile them to YAML:

```bash
# Compile all workflows
gh aw compile

# Compile specific workflow
gh aw compile deploy-production.md
```

### Running Workflows

#### Manual Execution
```bash
# List available workflows
gh aw list

# Run a specific workflow
gh aw run deploy-production

# Run with inputs (if supported)
gh aw run deploy-production --input="environment=staging"
```

#### Scheduled Execution
Most workflows run automatically on their schedules. You can view scheduled runs in:
- GitHub Actions tab
- Repository Insights > Actions

#### Pull Request Triggers
Code review workflow automatically triggers on PR creation. You can also manually trigger:

```bash
gh aw run code-review --ref="refs/pull/123/head"
```

## Workflow Outputs

### Discussion Reports
Most workflows create GitHub discussions with detailed reports:
- **Deployment Reports**: Success/failure status, test results, next steps
- **Code Review Reports**: Lint results, security issues, recommendations
- **Performance Reports**: Web Vitals metrics, trends, optimization suggestions
- **Dependency Reports**: Update status, compatibility issues, recommendations
- **Backup Reports**: Files backed up, archive details, restore instructions

### Issues for Problems
Workflows create issues for:
- Security vulnerabilities
- Performance degradations
- Dependency update failures
- Backup failures
- Test failures

### Cache Memory
Workflows use cache memory to:
- Track historical data (performance metrics, dependency status)
- Compare current results with baselines
- Maintain state between runs

## Troubleshooting

### Common Issues

1. **Workflow Not Found**
   ```bash
   # Ensure workflow is compiled
   gh aw compile
   
   # Check if workflow exists
   gh aw list
   ```

2. **Permission Denied**
   - Verify `COPILOT_GITHUB_TOKEN` has "Copilot Requests" permission
   - Check repository access for the token

3. **Secrets Missing**
   - Add required secrets to repository settings
   - Verify secret names match workflow requirements

4. **Workflow Fails**
   ```bash
   # Check workflow run details
   gh api repos/foo/bar/actions/runs
   
   # Debug specific run
   gh aw audit <run-id>
   ```

### Debug Commands

```bash
# List all workflow runs
gh aw list --runs

# Get details of specific run
gh aw audit <run-id>

# View workflow logs
gh api repos/foo/bar/actions/runs/<run-id>/logs

# Check workflow status
gh api repos/foo/bar/actions/workflows
```

## Best Practices

### Creating New Workflows

1. **Use Descriptive Names**: Clear, action-oriented names
2. **Document Purpose**: Include clear description in YAML header
3. **Set Appropriate Triggers**: Use schedules, events, or manual dispatch
4. **Add Error Handling**: Include fallback actions for failures
5. **Test Thoroughly**: Run manually before relying on automation

### Workflow Maintenance

1. **Regular Review**: Check workflow effectiveness monthly
2. **Update Dependencies**: Keep workflow tools updated
3. **Monitor Performance**: Ensure workflows complete within timeouts
4. **Review Reports**: Act on issues identified by workflows
5. **Clean Up**: Remove unused workflows and old reports

### Security Considerations

1. **Limit Secrets**: Only use necessary secrets in workflows
2. **Use Fine-grained Tokens**: Restrict permissions to minimum required
3. **Review Dependencies**: Check for vulnerabilities in workflow tools
4. **Monitor Access**: Regularly audit who can modify workflows

## Integration with Development Workflow

### Pull Request Process
1. Create PR → Code review workflow runs automatically
2. Review report → Address any issues found
3. Merge to main → Deployment workflow triggers (if configured)

### Continuous Monitoring
1. Daily performance monitoring → Track site health
2. Weekly dependency updates → Keep packages current
3. Daily backups → Ensure data protection

### Incident Response
1. CI failure → CI Doctor workflow analyzes issues
2. Performance degradation → Performance workflow alerts
3. Security issue → Code review workflow flags problems

## Examples

### Custom Workflow for Feature Deployment

Create `.github/workflows/feature-deploy.md`:

```yaml
---
description: |
  Deploy feature branches to staging environment for testing.

on:
  push:
    branches: ['feature/*']

steps:
  - name: Deploy to staging
    run: |
      echo "Deploying feature branch to staging..."
      # Deployment logic here
```

### Custom Workflow for Security Scan

Create `.github/workflows/security-scan.md`:

```yaml
---
description: |
  Run comprehensive security scan on code changes.

on:
  pull_request:
    branches: ['main', 'production']

steps:
  - name: Run security scan
    run: |
      echo "Running security scan..."
      # Security scanning logic here
```

## Support

For issues with workflows:

1. Check the troubleshooting section above
2. Review workflow run logs in GitHub Actions
3. Use `gh aw audit <run-id>` for detailed analysis
4. Create an issue with the `workflow` label

For questions about creating new workflows:

1. Review existing workflow examples
2. Check GitHub Agentic Workflows documentation
3. Ask in repository discussions