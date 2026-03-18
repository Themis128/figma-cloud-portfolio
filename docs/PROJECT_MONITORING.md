# 🚀 Project Monitoring System

**Last Updated**: 2026-03-08
**Project**: Baltzakis Portfolio
**Status**: ✅ Implementation in Progress

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [GitHub Projects v2 Board](#github-projects-v2-board)
3. [Safe-Outputs Configuration](#safe-outputs-configuration)
4. [Monitoring Workflows](#monitoring-workflows)
5. [Implementation Status](#implementation-status)
6. [Setup Instructions](#setup-instructions)
7. [Usage Guide](#usage-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project monitoring system provides comprehensive oversight of the portfolio website development using GitHub Agentic Workflows (gh-aw) with safe-outputs configuration. The system includes:

- **GitHub Projects v2 Board**: Centralized project management and tracking
- **Safe-Outputs Configuration**: Secure automation with controlled GitHub interactions
- **Monitoring Workflows**: Automated quality assurance and status reporting
- **Real-time Alerts**: Proactive issue detection and resolution

---

## 📊 GitHub Projects v2 Board

### Board Structure

**Board Name**: `Portfolio Project Monitoring`

**Columns**:
- **Backlog**: Unplanned features and improvements
- **To Do**: Planned tasks for current sprint
- **In Progress**: Active development work
- **Review**: Code review and testing phase
- **Done**: Completed and deployed features

**Issue Types**:
- **Feature**: New functionality and enhancements
- **Bug**: Defects and issues requiring fixes
- **Task**: Maintenance and infrastructure work
- **Improvement**: Code quality and performance enhancements

### Board Configuration

```yaml
# GitHub Projects v2 Configuration
board_name: "Portfolio Project Monitoring"
columns:
  - "Backlog"
  - "To Do" 
  - "In Progress"
  - "Review"
  - "Done"

issue_types:
  - "Feature"
  - "Bug"
  - "Task"
  - "Improvement"

labels:
  - "priority:high"
  - "priority:medium"
  - "priority:low"
  - "type:frontend"
  - "type:backend"
  - "type:devops"
  - "status:ready"
  - "status:blocked"
```

### Required Permissions

To create and manage the GitHub Projects v2 board, the GitHub token needs:

```yaml
required_scopes:
  - "read:project"    # View projects
  - "project"         # Create and manage projects
  - "repo"           # Access repository
  - "workflow"       # Manage workflows
```

**Token Setup**:
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate new token with the required scopes
3. Update your `.env` file or GitHub Actions secrets

---

## 🔒 Safe-Outputs Configuration

### Purpose

Safe-outputs configuration ensures secure and controlled automation by:

- **Limiting GitHub interactions** to specific operations
- **Preventing unauthorized changes** to repository state
- **Enabling safe automation** with proper permissions
- **Providing audit trails** for all automated actions

### Configuration Structure

```yaml
# .github/workflows/monitoring-workflows.yml
safe-outputs:
  mentions: false                    # Disable @mentions in automated messages
  allowed-github-references: []      # Restrict cross-repository references
  
  # Controlled GitHub operations
  create-issue:
    title-prefix: "[monitoring] "    # Standardized issue titles
    labels: [automation, monitoring] # Required labels
    draft: false                     # No draft issues
    max: 5                          # Limit issues per run
  
  create-discussion:
    title-prefix: "[status] "        # Standardized discussion titles
    category: "monitoring"          # Target discussion category
    max: 3                          # Limit discussions per run
  
  add-comment:
    target: "*"                     # Allow comments on all issues/PRs
    max: 10                         # Limit comments per run
  
  create-pull-request:
    draft: true                     # Always create draft PRs
    labels: [automation, monitoring] # Required labels
    if-no-changes: "warn"           # Warn if no changes detected
  
  noop:
    # Required for clean completion reporting
```

### Security Features

- **Mention Control**: Prevents spam and unauthorized notifications
- **Reference Restrictions**: Limits cross-repository interactions
- **Operation Limits**: Prevents runaway automation
- **Draft PRs**: Ensures human review before merging
- **Audit Logging**: Tracks all automated actions

---

## 🤖 Monitoring Workflows

### 1. Daily QA Workflow

**File**: `.github/workflows/daily-qa.md`

**Purpose**: Automated quality assurance checks

**Triggers**:
- Daily on weekdays at 9:00 AM UTC
- Manual dispatch with optional operation parameter

**Checks Performed**:
- Code builds and runs successfully
- Tests pass without failures
- Documentation is clear and up-to-date
- Code structure and organization
- Security vulnerability scanning

**Safe-Outputs**:
```yaml
safe-outputs:
  update-project:
    project: https://github.com/orgs/themis128/projects/123
    max: 10
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-discussion:
    title-prefix: "${{ github.workflow }}"
    category: "q-a"
  add-comment:
    target: "*" # all issues and PRs
    max: 5
  create-pull-request:
    draft: true
    labels: [automation, qa]
  create-issue:
    title-prefix: "[failed] "
    labels: [automation, failed]
  group-reports: true
  noop:
    report-as-issue: false
```

### 2. Daily Repo Status Workflow

**File**: `.github/workflows/daily-repo-status.md`

**Purpose**: Daily project status reporting

**Triggers**:
- Daily at 6:00 AM UTC
- Manual dispatch

**Reports Generated**:
- Recent repository activity summary
- Progress tracking and goal reminders
- Project status and recommendations
- Actionable next steps for maintainers

**Safe-Outputs**:
```yaml
safe-outputs:
  update-project:
    project: https://github.com/orgs/themis128/projects/123
    max: 10
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-project-status-update:
    project: https://github.com/orgs/themis128/projects/123
    max: 1
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-issue:
    title-prefix: "[repo-status] "
    labels: [report, daily-status]
    close-older-issues: true
  create-issue:
    title-prefix: "[failed] "
    labels: [automation, failed]
  group-reports: true
  noop:
    report-as-issue: false
```

### 3. Daily Accessibility Review

**File**: `.github/workflows/daily-accessibility-review.md`

**Purpose**: WCAG 2.2 compliance monitoring

**Triggers**:
- Daily on weekdays at 10:00 AM UTC
- Manual dispatch

**Checks Performed**:
- Website accessibility using Playwright
- WCAG 2.2 guideline compliance
- Source code accessibility review
- Automated issue creation for violations

**Safe-Outputs**:
```yaml
safe-outputs:
  update-project:
    project: https://github.com/orgs/themis128/projects/123
    max: 10
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-discussion:
    title-prefix: "${{ github.workflow }}"
    category: "q-a"
    max: 5
  add-comment:
    max: 5
  create-issue:
    title-prefix: "[failed] "
    labels: [automation, failed]
  group-reports: true
  noop:
    report-as-issue: false
```

### 4. Daily Malicious Code Scan

**File**: `.github/workflows/daily-malicious-code-scan.md`

**Purpose**: Security threat detection

**Triggers**:
- Daily at 2:00 AM UTC
- Manual dispatch

**Scans Performed**:
- Secret exfiltration patterns
- Out-of-context code detection
- Suspicious system operations
- Supply chain compromise indicators

**Safe-Outputs**:
```yaml
safe-outputs:
  update-project:
    project: https://github.com/orgs/themis128/projects/123
    max: 10
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-code-scanning-alert:
    driver: "Malicious Code Scanner"
  threat-detection: false
  create-issue:
    title-prefix: "[failed] "
    labels: [automation, failed]
  group-reports: true
  noop:
    report-as-issue: false
```

### 5. Link Checker Workflow

**File**: `.github/workflows/link-checker.md`

**Purpose**: Documentation link validation

**Triggers**:
- Daily on weekdays at 8:00 AM UTC
- Manual dispatch

**Checks Performed**:
- All markdown links in documentation
- HTTP status verification
- Broken link detection and fixing
- Link replacement with alternatives

**Safe-Outputs**:
```yaml
safe-outputs:
  update-project:
    project: https://github.com/orgs/themis128/projects/123
    max: 10
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-pull-request:
    title-prefix: "[link-checker] "
    labels: [documentation, automated]
    draft: false
    if-no-changes: "warn"
  create-issue:
    title-prefix: "[failed] "
    labels: [automation, failed]
  group-reports: true
  noop:
    report-as-issue: false
```

### 6. Playwright Test Runner

**File**: `.github/workflows/playwright-test-runner.md`

**Purpose**: E2E test automation and reporting

**Triggers**:
- Daily on weekdays at 11:00 AM UTC
- Manual dispatch

**Tests Executed**:
- Full Playwright E2E test suite
- Cross-browser compatibility
- Performance regression detection
- Test failure analysis and reporting

**Safe-Outputs**:
```yaml
safe-outputs:
  update-project:
    project: https://github.com/orgs/themis128/projects/123
    max: 10
    github-token: ${{ secrets.GH_AW_PROJECT_GITHUB_TOKEN }}
  create-discussion:
    title-prefix: "${{ github.workflow }}"
    category: "q-a"
    max: 3
  create-issue:
    labels: [bug, automated, test-failure]
    max: 5
  create-issue:
    title-prefix: "[failed] "
    labels: [automation, failed]
  group-reports: true
  noop:
    report-as-issue: false
```

---

## 📈 Implementation Status

### ✅ Completed

- [x] **Workflow Analysis**: All existing gh-aw workflows identified
- [x] **Safe-Outputs Review**: Current configurations documented
- [x] **Project Structure**: GitHub Projects v2 board structure designed
- [x] **Documentation**: Comprehensive setup guide created

### 🔄 In Progress

- [ ] **GitHub Projects v2 Board**: Create board (requires additional permissions)
- [ ] **Safe-Outputs Updates**: Update existing workflows with enhanced configuration
- [ ] **New Monitoring Workflows**: Create additional monitoring workflows
- [ ] **Permission Setup**: Configure required GitHub token scopes

### 📋 Pending

- [ ] **Board Population**: Add existing issues and tasks to the board
- [ ] **Workflow Testing**: Validate all monitoring workflows
- [ ] **Integration Testing**: Test complete monitoring system
- [ ] **Documentation Updates**: Final documentation review and updates

---

## ⚙️ Setup Instructions

### 1. GitHub Token Configuration

**Required Scopes**:
```yaml
scopes:
  - "read:project"    # View GitHub Projects
  - "project"         # Create and manage projects
  - "repo"           # Full repository access
  - "workflow"       # Manage GitHub Actions
  - "gist"           # Access gists (existing)
```

**Steps**:
1. Generate new token at [GitHub Settings](https://github.com/settings/tokens)
2. Select required scopes
3. Save token securely
4. Update GitHub Actions secrets or local `.env` file

### 2. GitHub Projects v2 Board Creation

**Manual Creation**:
1. Go to repository → Projects
2. Click "New project"
3. Select "Project (beta)"
4. Name: "Portfolio Project Monitoring"
5. Configure columns and issue types as specified

**API Creation** (requires proper permissions):
```bash
gh api graphql -f query='
mutation {
  createProjectV2(input: {
    ownerId: "ORGANIZATION:themis128",
    title: "Portfolio Project Monitoring"
  }) {
    projectV2 {
      id
      title
      url
      number
    }
  }
}'
```

### 3. Safe-Outputs Configuration Updates

**Update Existing Workflows**:
1. Review each workflow file in `.github/workflows/`
2. Add or update safe-outputs configuration
3. Test workflow compilation with `gh aw compile`

**Example Update**:
```yaml
# Add to existing workflow
safe-outputs:
  mentions: false
  allowed-github-references: []
  create-issue:
    title-prefix: "[monitoring] "
    labels: [automation, monitoring]
    max: 5
  noop:
```

### 4. Workflow Compilation

**Compile All Workflows**:
```bash
# Install gh-aw CLI
npm install -g @github/gh-aw

# Compile workflows
gh aw compile --validate --verbose

# Check for errors
gh aw validate
```

### 5. Board Configuration

**Column Setup**:
1. Backlog → To Do → In Progress → Review → Done
2. Configure automation rules for column transitions
3. Set up issue type templates

**Label Configuration**:
1. Priority labels: high, medium, low
2. Type labels: frontend, backend, devops
3. Status labels: ready, blocked

---

## 📖 Usage Guide

### Daily Monitoring

**Morning Routine** (9:00 AM UTC):
1. Check Daily QA report in Discussions
2. Review any new issues from automated scans
3. Update project board with new tasks

**Afternoon Review** (2:00 PM UTC):
1. Check Playwright test results
2. Review accessibility scan findings
3. Update task status on project board

**End of Day** (6:00 PM UTC):
1. Review daily status report
2. Plan next day's priorities
3. Update project board accordingly

### Issue Management

**Automated Issue Handling**:
- QA issues: Review and assign to team members
- Security issues: Immediate triage and response
- Test failures: Investigate and fix
- Accessibility issues: Prioritize based on impact

**Manual Issue Creation**:
- Use project board for task tracking
- Follow standard issue templates
- Assign appropriate labels and milestones

### Project Board Management

**Column Transitions**:
- Backlog → To Do: During sprint planning
- To Do → In Progress: When starting work
- In Progress → Review: When code is ready for review
- Review → Done: After successful review and deployment

**Issue Type Usage**:
- Feature: New functionality requests
- Bug: Defects and issues
- Task: Maintenance and infrastructure
- Improvement: Code quality enhancements

---

## 🔧 Troubleshooting

### GitHub Token Issues

**Error**: "INSUFFICIENT_SCOPES"
```bash
# Check current token scopes
gh auth status

# Generate new token with required scopes
gh auth refresh -s read:project,project,repo,workflow
```

**Solution**: Update GitHub token with required scopes

### Workflow Compilation Errors

**Error**: "gh aw compile" fails
```bash
# Check workflow syntax
gh aw validate

# Check for missing dependencies
gh aw check

# Reinstall gh-aw CLI
npm install -g @github/gh-aw@latest
```

**Solution**: Fix syntax errors and update dependencies

### Project Board Access Issues

**Error**: Cannot create or access projects
```bash
# Check organization permissions
gh api orgs/themis128/memberships/$(gh api user --jq .login)

# Verify project permissions
gh api graphql -f query='
query {
  viewer {
    organizations(first: 1) {
      nodes {
        projectsV2(first: 1) {
          totalCount
        }
      }
    }
  }
}'
```

**Solution**: Request appropriate permissions from organization admin

### Safe-Outputs Configuration Issues

**Error**: Workflows fail with safe-outputs errors
```yaml
# Check safe-outputs syntax
safe-outputs:
  create-issue:
    title-prefix: "[test] "  # Must end with space
    labels: [test]          # Must be array
    max: 5                  # Must be number
```

**Solution**: Validate safe-outputs configuration syntax

### Monitoring Workflow Failures

**Common Issues**:
1. **Timeout**: Increase timeout-minutes in workflow
2. **Permissions**: Check workflow permissions
3. **Dependencies**: Ensure all required tools are available
4. **Network**: Check network access for external services

**Debug Steps**:
1. Check workflow run logs
2. Verify token permissions
3. Test individual steps manually
4. Review safe-outputs configuration

---

## 📞 Support

### Documentation
- [GitHub Agentic Workflows Documentation](https://github.com/github/gh-aw)
- [GitHub Projects v2 API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project)
- [Safe-Outputs Configuration Guide](https://github.com/github/gh-aw/blob/main/docs/safe-outputs.md)

### Troubleshooting
- Check workflow logs in GitHub Actions
- Verify GitHub token permissions
- Test individual workflow steps
- Review project board permissions

### Getting Help
- Create issue in repository with "support" label
- Check existing documentation
- Review workflow examples in `.github/workflows/`

---

## 🔄 Maintenance

### Weekly Tasks
- Review and update project board
- Analyze monitoring workflow effectiveness
- Update issue priorities and assignments
- Review and clean up old discussions

### Monthly Tasks
- Audit GitHub token permissions
- Review and update workflow configurations
- Analyze project progress and metrics
- Update documentation as needed

### Quarterly Tasks
- Review and update project board structure
- Evaluate monitoring workflow effectiveness
- Update security configurations
- Comprehensive system review

---

**Last Updated**: 2026-03-08
**Version**: 1.0.0
**Maintainer**: Themistoklis Baltzakis