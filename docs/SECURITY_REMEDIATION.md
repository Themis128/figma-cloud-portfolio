# Security Remediation Guide

**Date**: 2026-02-01
**Repository**: figma-cloud-portfolio (PRIVATE)
**Issue**: Exposed API tokens in git history and mcp.json

## ⚠️ Repository Status
- **Visibility**: PRIVATE ✅
- **Risk Level**: MEDIUM (Limited to collaborators with repo access)
- **Action Required**: Rotate all exposed tokens as precaution

## 🔑 Exposed Tokens Found

### 1. GitHub Tokens
**Locations**:
- `mcp.json` (Line 251, 262) - VS Code user settings
- `.env` (committed on Jan 24, 2026) - Variable: `GITHUB_PORTFOLIO_TOKEN`

**Action**:
- [ ] Revoke at: https://github.com/settings/tokens
- [ ] Generate new token with minimal required scopes
- [ ] Update `.env` with new token
- [ ] Update `mcp.json` to use `${GITHUB_TOKEN}` reference

### 2. Sentry Access Token
**Location**: `.env` (committed on Jan 24, 2026)

**Action**:
- [ ] Revoke at: https://sentry.io/settings/account/api/auth-tokens/
- [ ] Generate new token
- [ ] Update `.env` with `SENTRY_ACCESS_TOKEN=new_token`

### 3. reCAPTCHA Keys
**Location**: `.env` (committed on Jan 24, 2026)
**Variables**: `VITE_RECAPTCHA_SITE_KEY`, `VITE_RECAPTCHA_SECRET_KEY`

**Action**:
- [ ] Regenerate at: https://www.google.com/recaptcha/admin
- [ ] Update both site and secret keys in `.env`

### 4. Figma API Credentials
**Location**: `.env` (committed on Jan 24, 2026)
**Variables**: `FIGMA_API_KEY`, `FIGMA_CLIENT_SECRET`

**Action**:
- [ ] Revoke at: https://www.figma.com/developers/api#authentication
- [ ] Generate new credentials
- [ ] Update `.env`

### 5. Codacy API Tokens
**Location**: `.env` (committed on Jan 24, 2026)
**Variables**: `CODACY_API_TOKEN`, `CODACY_PROJECT_TOKEN`

**Action**:
- [ ] Revoke at: https://app.codacy.com/account/apiTokens
- [ ] Generate new tokens
- [ ] Update `.env`

## 🛠️ Remediation Steps

### Step 1: Revoke All Exposed Tokens
Work through the checklist above to revoke all exposed tokens.

### Step 2: Generate New Tokens
Generate new tokens for all services with minimal required permissions.

### Step 3: Update .env File
```bash
# Update your .env file with new tokens
# Never commit this file to git!
```

### Step 4: Secure MCP Configuration
Update your VS Code MCP configuration to use environment variables:
```json
{
  "Authorization": "Bearer ${GITHUB_TOKEN}",
  "GITHUB_TOKEN": "${GITHUB_TOKEN}"
}
```

### Step 5: Clean Git History (Optional)
Since the repository is PRIVATE, this is optional but recommended:

```bash
# Using BFG Repo Cleaner
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Step 6: Verify Security
- [ ] All tokens revoked
- [ ] New tokens generated
- [ ] `.env` file updated
- [ ] `.env` in `.gitignore` (already confirmed ✅)
- [ ] `mcp.json` updated to use env variables
- [ ] No secrets in git history (optional)

## 📋 Prevention Checklist

- [x] `.env` in `.gitignore`
- [ ] `mcp.json` uses environment variable references
- [ ] Pre-commit hooks to scan for secrets
- [ ] Team training on secret management
- [ ] Regular security audits

## 📞 Emergency Contacts
- GitHub Support: https://support.github.com/
- Immediately revoke compromised tokens if repository becomes public

## 🔐 Best Practices Going Forward

1. **Never hardcode secrets** in configuration files
2. **Always use environment variables** for sensitive data
3. **Use secret scanning tools** like git-secrets or gitleaks
4. **Rotate tokens regularly** even without exposure
5. **Use minimal permission scopes** for all tokens
6. **Enable 2FA** on all service accounts

---
**Status**: 🟡 In Progress
**Last Updated**: 2026-02-01
