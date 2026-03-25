# CI/CD Pipeline Implementation

This document describes the comprehensive CI/CD pipeline implemented for the Baltzakis Themistoklis Portfolio application using GitHub Actions and AWS Amplify.

## Overview

The CI/CD pipeline provides automated testing, building, and deployment with the following features:

- **Automated Testing**: Comprehensive test suite with linting, type checking, and E2E tests
- **Security Scanning**: Automated vulnerability scanning with Trivy
- **Multi-Environment Deployment**: Separate staging and production environments
- **Rollback Strategies**: Automated and manual rollback capabilities
- **Deployment Status Tracking**: Real-time deployment status and notifications
- **Branch Protection**: Environment-specific deployment triggers

## Architecture

### Workflow Structure

```
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml                         # Standard GitHub Actions deploy workflow
│   │   ├── deploy-production.md               # Agentic deploy workflow (Copilot)
│   │   ├── deploy-production.lock.yml         # Compiled agentic workflow (auto-generated)
│   │   ├── daily-repo-status.md               # AI-powered daily repo status reports
│   │   ├── daily-repo-status.lock.yml         # Compiled workflow (auto-generated)
│   │   ├── ci-doctor.md                       # AI-powered CI failure diagnostics
│   │   ├── ci-doctor.lock.yml                 # Compiled workflow (auto-generated)
│   │   └── ...                                # Additional agentic workflows
│   ├── agents/
│   │   └── agentic-workflows.agent.md         # Dispatcher agent for gh-aw
│   └── aw/
│       └── actions-lock.json                  # Pinned action versions
├── scripts/
│   └── deploy.sh                              # Local deploy script (S3 + CloudFront)
```

### GitHub Agentic Workflows (gh-aw)

The project uses [GitHub Agentic Workflows](https://github.github.com/gh-aw/) with the **Copilot engine** for AI-powered automation. Workflows are authored as Markdown files and compiled to GitHub Actions YAML.

| Workflow | Trigger | Description |
|---|---|---|
| Deploy to Production | Push to `production` / manual | S3 sync + targeted CloudFront invalidation + Lighthouse CI audit (standard Actions) |
| Production Deployment (Agentic) | Push to `production` / manual | S3 deploy + Playwright smoke tests (`production-smoke.spec.ts`) + deployment report (Copilot) |
| Daily Repo Status | Scheduled / manual | Creates daily activity reports as GitHub issues |
| CI Doctor | On monitored workflow failure | Analyzes CI failures, identifies root causes, suggests fixes |
| Daily QA | Scheduled / manual | Validates builds, tests, docs, code quality |
| Daily Accessibility Review | Scheduled / manual | WCAG 2.2 compliance checks |
| Daily Malicious Code Scan | Scheduled / manual | Reviews recent code for suspicious patterns |
| Link Checker | Scheduled / manual | Finds/fixes broken documentation links |
| Playwright Test Runner | Scheduled / manual | Full E2E suite with regression detection |
| Snyk Security Scan | Weekly / PR / push to production | Dependency, SAST, and IaC vulnerability scanning |

**Required secret**: `COPILOT_GITHUB_TOKEN`, fine-grained PAT with "Copilot Requests" Account permission (Read).

```bash
# Compile workflows after editing markdown
gh aw compile

# Trigger a workflow manually
gh aw run daily-repo-status

# Debug a failed run
gh aw audit <run-id>

# Check workflow health
gh aw health
```

### Deployment

- **Frontend**: S3 sync + targeted CloudFront invalidation + Lighthouse CI audit (via GitHub Actions or `scripts/deploy.sh`)
- **Amplify Gen 2 Backend**: Cognito (TOTP MFA enabled) + AppSync + DynamoDB (deployed via `ampx pipeline-deploy` in Amplify backend phase)
- **Lambda Backend**: AWS Lambda `figma-portfolio-api` (1024MB, 30s timeout, CloudWatch alarms for errors/throttles/duration)

> **Note**: Amplify Hosting auto-build is bypassed for the frontend (Next.js 16 OOMs on the build instance). The deploy workflows sync directly to S3.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers**: Push/PR to `main` or `develop` branches

**Jobs**:

- **Test**: Linting, type checking, unit tests, E2E tests
- **Build**: Velite content compilation (`velite build`) + Next.js application build
- **Security**: Vulnerability scanning with Trivy

**Features**:

- Matrix testing across Node.js versions
- Test artifact uploads for debugging
- Security scan results uploaded to GitHub Security tab

### 2. Staging Deployment (`deploy-staging.yml`)

**Triggers**: Push to `develop` branch or manual dispatch

**Features**:

- Automatic deployment on `develop` branch pushes
- Concurrency control to prevent multiple simultaneous deployments
- Deployment notifications via GitHub issues
- Health check validation

### 3. Production Deployment (`deploy-production.yml`)

**Triggers**: Push to `main` branch or manual dispatch

**Features**:

- Protected environment with required approvals
- Automatic rollback on deployment failure
- Comprehensive deployment notifications
- Production environment isolation

### 4. Rollback Workflow (`rollback.yml`)

**Triggers**: Manual dispatch with environment selection

**Features**:

- Environment-specific rollback (staging/production)
- Optional target commit specification
- Automated rollback notifications
- Rollback tracking and reporting

### 5. Deployment Status (`deployment-status.yml`)

**Triggers**: Completion of deployment/rollback workflows

**Features**:

- Dynamic status badge generation
- Deployment status JSON files for external monitoring
- Automated deployment summary issues
- Real-time deployment tracking

## Configuration

### Required GitHub Secrets

```bash
# GitHub Agentic Workflows
COPILOT_GITHUB_TOKEN=github_pat_...  # Fine-grained PAT with "Copilot Requests" Account permission

# AWS Credentials (for S3 + CloudFront deployment)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Amplify Gen 2 Backend
AMPLIFY_PRODUCTION_APP_ID=d1zjif7pi1h3om

# Snyk Security Scanning
SNYK_TOKEN=your_snyk_api_token       # From https://app.snyk.io/account
SNYK_ORG=your_snyk_org_slug          # Snyk organization slug
```

### Environment Variables

```bash
# Build environment (set in Amplify Console)
NODE_ENV=staging|production
```

### Branch Protection Rules

**Main Branch**:

- Require PR reviews
- Require status checks (CI, security)
- Require branches to be up to date
- Restrict pushes to maintainers

**Develop Branch**:

- Require status checks (CI)
- Allow direct pushes for hotfixes

## Usage

### Automatic Deployments

1. **Staging**: Push to `develop` branch → automatic staging deployment
2. **Production**: Merge PR to `main` → automatic production deployment

### Manual Deployments

```bash
# Trigger production deployment (standard)
gh workflow run "Deploy to Production"

# Trigger production deployment (agentic, with smoke tests + report)
gh workflow run "Production Deployment Workflow (S3 + CloudFront)"

# Local deploy (requires AWS CLI configured)
./scripts/deploy.sh
```

### Rollback Procedures

```bash
# Rollback staging
gh workflow run rollback.yml -f environment=staging

# Rollback production to specific commit
gh workflow run rollback.yml -f environment=production -f target_commit=abc123
```

## Deployment Status Badges

Add these badges to your README:

```markdown
![Staging](https://img.shields.io/endpoint?url=https://yourdomain.com/deployment-status-staging.json)
![Production](https://img.shields.io/endpoint?url=https://yourdomain.com/deployment-status-production.json)
```

## Monitoring & Notifications

### GitHub Issues

- **Deployment Success**: Automatic issue creation with deployment details
- **Deployment Failure**: Automatic rollback initiation with alerts
- **Rollback Completion**: Rollback confirmation with monitoring instructions

### Status Files

Deployment status is tracked in JSON files:

- `public/deployment-status-staging.json`
- `public/deployment-status-production.json`

### External Monitoring

Status files can be consumed by:

- Status dashboards
- Monitoring systems
- External notification services

## Security Features

### Authentication & Authorization

- AWS IAM roles with minimal required permissions
- GitHub environment protection for production
- Secret management via GitHub Secrets

### Security Scanning

- **Snyk**: Dependency, SAST (code), and IaC vulnerability scanning (`.github/workflows/snyk-security.yml`)
  - **Dependency Scan**: Checks `pnpm-lock.yaml` for known vulnerabilities (high/critical threshold)
  - **Code Scan (SAST)**: Static analysis of source code (excludes test files via `--exclude` and `.snyk` policy)
  - **IaC Scan**: Checks `amplify.yml` and other infrastructure files for misconfigurations
  - **Pre-deploy gate**: `deploy.yml` runs `snyk test --severity-threshold=critical` before deployment
  - **Dashboard monitoring**: `snyk monitor` uploads project state on pushes to `production`
- **Dependabot**: Automated dependency updates

### Access Control

- Branch protection rules
- Required PR reviews for production
- Environment-specific secrets

## Rollback Strategies

### Automatic Rollback

- Production deployments automatically rollback on failure
- Staging deployments can be manually rolled back
- Rollback to previous successful deployment

### Manual Rollback

- Target specific commits for precise rollback
- Environment-specific rollback workflows
- Rollback notifications and tracking

## Troubleshooting

### Common Issues

**Deployment Failures**:

- Check AWS credentials and permissions
- Verify Amplify app configuration
- Review build logs for errors

**Test Failures**:

- Check test environment setup
- Verify Playwright browser installation
- Review test artifacts

**Security Scan Failures**:

- Update vulnerable dependencies
- Review security advisories
- Implement security patches

### Debugging

**Workflow Logs**:

```bash
gh run list --workflow=ci.yml
gh run view <run-id> --log
```

**Deployment Status**:

```bash
curl https://yourdomain.com/deployment-status-production.json
```

## Best Practices

### Deployment Hygiene

- Always deploy through CI/CD pipeline
- Use feature flags for gradual rollouts
- Monitor application health post-deployment
- Keep deployment windows short

### Testing Strategy

- Comprehensive test coverage before deployment
- E2E tests for critical user journeys
- Performance testing in staging
- Security testing in all environments

### Monitoring

- Set up application monitoring (errors, performance)
- Configure deployment notifications
- Monitor rollback frequency as quality indicator
- Track deployment success rates

## Future Enhancements

- **Blue-Green Deployments**: Zero-downtime deployments
- **Canary Releases**: Gradual traffic shifting
- **Feature Flags**: Runtime feature toggles
- **Automated Testing**: Integration with test environments
- **Multi-Region**: Global deployment strategies

## Dependencies

- **GitHub Actions**:
  - `actions/checkout@v6`
  - `actions/setup-node@v6`
  - `corepack enable` (pnpm via `packageManager` field)
  - `aws-actions/configure-aws-credentials@v6`
  - `aws-actions/amplify-cli-wrapper@1.2.0`

- **External Tools**:
  - Snyk CLI (security scanning: dependency, SAST, IaC)
  - pnpm (package management)
  - Node.js 22.x

## Contributing

When modifying CI/CD workflows:

1. Test changes in a feature branch
2. Update this documentation
3. Ensure backward compatibility
4. Add appropriate error handling
5. Test rollback scenarios

---

_Last Updated: March 17, 2026_
