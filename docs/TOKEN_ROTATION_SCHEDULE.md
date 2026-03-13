# Token Rotation & Security Maintenance Schedule

This document outlines the security token rotation schedule and procedures to maintain the integrity of your production infrastructure.

---

## Token Rotation Matrix

| Token/Secret          | Type                  | Rotation Interval | Last Rotated | Next Due | Owner  |
| --------------------- | --------------------- | ----------------- | ------------ | -------- | ------ |
| CODACY_ACCOUNT_TOKEN  | API Token             | 90 days           | [DATE]       | [DATE]   | DevOps |
| GITHUB_TOKEN          | Personal Access Token | 180 days          | [DATE]       | [DATE]   | DevOps |
| FIGMA_API_KEY         | API Key               | 180 days          | [DATE]       | [DATE]   | Design |
| FIGMA_CLIENT_SECRET   | OAuth Secret          | 180 days          | [DATE]       | [DATE]   | Design |
| AWS_ACCESS_KEY_ID     | AWS Credential        | 90 days           | [DATE]       | [DATE]   | DevOps |
| AWS_SECRET_ACCESS_KEY | AWS Credential        | 90 days           | [DATE]       | [DATE]   | DevOps |

---

## Rotation Procedures

### Each Month: Security Audit

**First Friday of each month**

```bash
# Check for exposed secrets in git history
bash scripts/cleanup-git-history.sh --check

# Validate no hardcoded secrets in codebase
pnpm run quality

# Review GitHub Secrets expiration warnings
# Action: Check GitHub Settings → Secrets and variables
```

### Every 3 Months: Codacy Token Rotation

**Even months (Feb, Apr, Jun, Aug, Oct, Dec)**

#### Step 1: Generate New Token

1. Visit [Codacy Dashboard](https://app.codacy.com/organizations)
2. Click **Settings** → **Integrations** → **API Tokens**
3. Click **Generate Token**
4. Copy new token (keep in secure location temporarily)

#### Step 2: Update AWS Secrets Manager

```bash
#!/bin/bash
# save as: rotate-codacy-token.sh

NEW_TOKEN="$1"  # Pass token as argument
REGION="eu-central-1"

echo "🔄 Rotating Codacy token..."

# Update secret
aws secretsmanager update-secret \
  --secret-id portfolio/env \
  --secret-string "{\"CODACY_ACCOUNT_TOKEN\":\"$NEW_TOKEN\"}" \
  --region "$REGION"

# Verify update
VERSION=$(aws secretsmanager describe-secret \
  --secret-id portfolio/env \
  --region "$REGION" \
  --query 'VersionIdsToStages' \
  --output json)

echo "✅ Secret updated. New version: $VERSION"

# Backup old secret version
aws secretsmanager list-secret-version-ids \
  --secret-id portfolio/env \
  --region "$REGION" \
  >> token-rotation-backup-$(date +%Y%m%d).json

echo "📦 Backup saved to token-rotation-backup-$(date +%Y%m%d).json"
```

Usage:

```bash
chmod +x rotate-codacy-token.sh
./rotate-codacy-token.sh "your-new-token-here"
```

#### Step 3: Update GitHub Secrets

```bash
#!/bin/bash
# Interactive GitHub Secret update
# Prerequisites: gh CLI installed (https://cli.github.com)

SECRET_NAME="CODACY_ACCOUNT_TOKEN"
NEW_TOKEN="$1"
REPO="Themis128/new-portfolio"

echo "🔐 Updating GitHub Secret: $SECRET_NAME"

gh secret set "$SECRET_NAME" \
  --repo "$REPO" \
  --body "$NEW_TOKEN"

echo "✅ GitHub Secret updated"

# Verify update
gh secret view "$SECRET_NAME" --repo "$REPO" || echo "⚠️ Verification pending"
```

#### Step 4: Test in CI/CD

```bash
git checkout -b test/token-rotation
git add .
git commit -m "test: verify Codacy token rotation"
git push origin test/token-rotation
```

Then:

1. Open Pull Request
2. Monitor GitHub Actions workflow execution
3. Verify build passes and uses new token

#### Step 5: Revoke Old Token

1. Return to [Codacy → Settings → API Tokens](https://app.codacy.com/organizations)
2. Find old token in list
3. Click **Revoke**
4. Confirm revocation

#### Step 6: Document Rotation

```bash
# Update rotation matrix at top of this file with:
# Last Rotated: [TODAY'S DATE]
# Next Due: [TODAY'S DATE + 90 DAYS]
```

---

### Every 6 Months: GitHub Token Rotation

**June 15 & December 15**

#### Step 1: Generate New Token

1. Visit [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token** (classic or fine-grained)
3. Select scopes: `repo`, `workflow`, `write:org`
4. Expiration: 1 year
5. Generate and copy token

#### Step 2: Update Secrets

```bash
# Update AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id portfolio/github \
  --secret-string "{\"GITHUB_TOKEN\":\"ghp_YourNewTokenHere\"}" \
  --region eu-central-1

# Update GitHub Secrets (use gh CLI)
gh secret set GITHUB_TOKEN --body "ghp_YourNewTokenHere" --repo Themis128/new-portfolio
```

#### Step 3: Test

```bash
# Test GitHub API access
curl -H "Authorization: token ghp_YourNewTokenHere" \
  https://api.github.com/user
```

Expected response: Your GitHub user info (200 status)

#### Step 4: Revoke Old Token

1. Go to [Personal Access Tokens](https://github.com/settings/tokens)
2. Find old token
3. Click **Delete**

---

### Every 6 Months: AWS Credentials Rotation

**March 15 & September 15**

#### Step 1: Create New IAM User Credentials

```bash
# Via AWS Console (recommended):
# 1. Go to IAM → Users → Your User
# 2. Click "Security Credentials" tab
# 3. Click "Create access key"
# 4. Choose "Application running on AWS resources"
# 5. Copy new Access Key ID and Secret Access Key

# OR via AWS CLI:
aws iam create-access-key --user-name portfolio-deploy
```

#### Step 2: Update Secrets

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name portfolio/aws-credentials-$(date +%Y%m%d) \
  --secret-string '{"AWS_ACCESS_KEY_ID":"AKIA...","AWS_SECRET_ACCESS_KEY":"..."}' \
  --region eu-central-1

# Update current secret
aws secretsmanager update-secret \
  --secret-id portfolio/aws \
  --secret-string '{"AWS_ACCESS_KEY_ID":"AKIA...new...","AWS_SECRET_ACCESS_KEY":"...new..."}'
```

#### Step 3: Update GitHub Secrets

```bash
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..." --repo Themis128/new-portfolio
gh secret set AWS_SECRET_ACCESS_KEY --body "..." --repo Themis128/new-portfolio
```

#### Step 4: Test Deployment

```bash
# Push test build
git push origin main
# Monitor: GitHub Actions → Deploy workflow
```

#### Step 5: Deactivate Old Credentials

```bash
# Via AWS Console:
# 1. Go to IAM → Users → Your User
# 2. Click "Security Credentials" tab
# 3. Find old access key
# 4. Click "Deactivate" (wait 24 hours before deleting)
# 5. After 24 hours, click "Delete"

# OR via CLI:
aws iam delete-access-key --user-name portfolio-deploy --access-key-id AKIA...
```

---

### Every 6 Months: Figma API Key Rotation

**April 15 & October 15**

#### Step 1: Generate New Key

1. Visit [Figma Developer Settings](https://www.figma.com/developers/api#access-tokens)
2. Click **Generate new token**
3. Choose scopes: `files:read`, `file_exports:read`
4. Copy token

#### Step 2: Update Secrets

```bash
# AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id portfolio/figma \
  --secret-string "{\"FIGMA_API_KEY\":\"your-new-key-here\"}" \
  --region eu-central-1

# GitHub Secrets
gh secret set FIGMA_API_KEY --body "your-new-key-here" --repo Themis128/new-portfolio
```

#### Step 3: Test

```bash
# Test Figma API
curl -H "X-FIGMA-TOKEN: your-new-key-here" \
  https://api.figma.com/v1/me

# Expected: 200 response with user info
```

#### Step 4: Revoke Old Key

1. Return to [Figma Developer Settings](https://www.figma.com/developers/api#access-tokens)
2. Find old token in list
3. Click **Revoke**

---

## Emergency Token Revocation

**If a secret is accidentally exposed:**

### Immediate Actions (within 1 minute)

```bash
# 1. Revoke the exposed token immediately
# Example: Codacy
# Go to: https://app.codacy.com/organizations → Settings → API Tokens → Revoke

# 2. Verify secret is not in git history
git log --oneline | grep -i "secret\|token\|credential"

# 3. If found in git history:
bash scripts/cleanup-git-history.sh --remove-token "exposed-token-value"

# 4. Force push to remove from history
git push --force-with-lease
```

### Follow-up Actions (within 1 hour)

```bash
# 1. Generate replacement token
# (Follow Step 1-3 of relevant rotation procedure)

# 2. Update AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id portfolio/env \
  --secret-string '{"CODACY_ACCOUNT_TOKEN":"new-replacement-token"}' \
  --region eu-central-1

# 3. Update GitHub Secrets
gh secret set CODACY_ACCOUNT_TOKEN --body "new-replacement-token"

# 4. Monitor deployment
# Push test commit and verify CI/CD passes
```

### Post-Incident (within 24 hours)

- [ ] Document incident in SECURITY_LOG.md
- [ ] Review git history for other exposed secrets
- [ ] Run security audit: `pnpm quality`
- [ ] Verify no other tokens need rotation
- [ ] Update rotation schedule if needed
- [ ] Notify team of incident and response taken

---

## Automated Rotation with GitHub Actions

Create `.github/workflows/token-rotation-reminder.yml`:

```yaml
name: Token Rotation Reminders

on:
  schedule:
    # Every 1st of month at 9 AM UTC
    - cron: "0 9 1 * *"

jobs:
  check-rotation-dates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Check Codacy token (due Feb, Apr, Jun, Aug, Oct, Dec)
        if: |
          contains('02,04,06,08,10,12', format('{0:00}', github.run_number % 12))
        run: |
          echo "🔔 REMINDER: Codacy token rotation due this month"
          echo "See: TOKEN_ROTATION_SCHEDULE.md for procedures"

      - name: Check GitHub token (due June, December)
        if: contains('06,12', format('{0:00}', github.run_number % 12))
        run: |
          echo "🔔 REMINDER: GitHub token rotation due this month"

      - name: Create issue for rotation
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🔐 Monthly Security: Token Rotation Due',
              body: 'See TOKEN_ROTATION_SCHEDULE.md for rotation procedures'
            })
```

---

## Compliance & Audit Trail

### Rotation Log Template

Create `SECURITY_AUDIT_LOG.md`:

```markdown
# Security Audit Log

## Rotation History

### 2026-02-01: Codacy Token Rotation

- **Status**: ✅ Completed
- **Time**: 14:30 UTC
- **Old Token Revoked**: Yes
- **Tests Passed**: Yes (GitHub Actions #123)
- **Verified By**: DevOps Team

### 2026-03-15: AWS Credentials Rotation

- **Status**: ✅ Completed
- **Time**: 10:15 UTC
- **Old Credentials Deactivated**: Yes
- **Tests Passed**: Yes (Amplify Deploy Successful)
- **Verified By**: DevOps Team

## Incidents

### 2026-02-01: Token Exposure in PR

- **Severity**: High
- **Token**: CODACY_ACCOUNT_TOKEN
- **Discovered**: In PR comments
- **Response Time**: 5 minutes
- **Actions Taken**: Token revoked, rotated, git history cleaned
- **Resolution**: Verified in production
```

---

## Best Practices

1. **Never store tokens in code** - Always use environment variables
2. **Rotate before expiration** - Don't wait until last minute
3. **Test after rotation** - Verify new token works before revoking old
4. **Keep backups** - Store previous token versions (encrypted) for emergency rollback
5. **Audit access logs** - Monitor who accessed secrets when
6. **Use strong passwords** - For GitHub, AWS, Codacy accounts
7. **Enable 2FA** - On all accounts that manage secrets
8. **Document everything** - Keep rotation log up to date

---

## Quick Reference Commands

```bash
# View all secrets in AWS Secrets Manager
aws secretsmanager list-secrets --region eu-central-1

# View specific secret details
aws secretsmanager describe-secret --secret-id portfolio/env

# View secret value
aws secretsmanager get-secret-value --secret-id portfolio/env

# List GitHub Secrets
gh secret list --repo Themis128/new-portfolio

# View GitHub Secret (will show masked value)
gh secret view SECRET_NAME --repo Themis128/new-portfolio
```

---

## Support & Questions

- **Documentation**: See [SECRETS_MANAGEMENT.md](./SECRETS_MANAGEMENT.md)
- **Deployment Guide**: See [GITHUB_DEPLOYMENT_GUIDE.md](./GITHUB_DEPLOYMENT_GUIDE.md)
- **Incident Response**: Contact DevOps lead
- **Questions**: Create issue in GitHub repository
