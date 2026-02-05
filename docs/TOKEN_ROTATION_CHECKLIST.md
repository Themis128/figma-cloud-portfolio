# 🔐 Security Token Rotation Checklist

**Date Started**: 2026-02-01
**Repository**: figma-cloud-portfolio (PRIVATE)
**Risk Level**: MEDIUM

---

## 📋 Pre-Rotation Checklist

- [x] Repository visibility confirmed (PRIVATE ✅)
- [x] .env backup created
- [x] All exposed tokens documented
- [x] .env in .gitignore
- [x] mcp.json in .gitignore
- [x] Secure configuration templates created

---

## 🔄 Token Rotation Steps

### 1. GitHub Personal Access Token (HIGHEST PRIORITY)

**Locations Found**:

- `mcp.json` (Lines 251, 262)
- `.env` - Variable: `GITHUB_PORTFOLIO_TOKEN`
- Git history (commit: 331a86e3...)

**Action Items**:

- [ ] Go to https://github.com/settings/tokens
- [ ] Find existing token(s) - look for:
  - Tokens created before Jan 24, 2026
  - Tokens with name containing "portfolio", "mcp", or "cli"
- [ ] Click "Delete" or "Revoke" on each exposed token
- [ ] Generate new token:
  - Click "Generate new token" → "Generate new token (classic)"
  - Name: `portfolio-mcp-$(date +%Y%m%d)`
  - Scopes: Only select what you need (e.g., `repo`, `read:user`)
  - Set expiration (recommended: 90 days)
  - Click "Generate token"
  - **COPY THE TOKEN IMMEDIATELY** - you can't see it again
- [ ] Add to .env file:
  ```bash
  GITHUB_TOKEN=ghp_new_token_here
  GITHUB_PORTFOLIO_TOKEN=ghp_new_token_here
  ```
- [ ] Update mcp.json to use `${GITHUB_TOKEN}` instead of hardcoded value
- [ ] Restart VS Code to apply changes
- [ ] Test MCP functionality

**Verification**:

```bash
# Test GitHub API access with new token
curl -H "Authorization: token YOUR_NEW_TOKEN" https://api.github.com/user
```

---

### 2. Sentry Access Token

**Action Items**:

- [ ] Go to https://sentry.io/settings/account/api/auth-tokens/
- [ ] Find and revoke existing token
- [ ] Generate new token:
  - Click "Create New Token"
  - Name: `Portfolio-$(date +%Y%m%d)`
  - Scopes: Select required permissions
  - Click "Create Token"
- [ ] Add to .env:
  ```bash
  SENTRY_ACCESS_TOKEN=your_new_token
  ```
- [ ] Test Sentry integration

---

### 3. reCAPTCHA Keys

**Action Items**:

- [ ] Go to https://www.google.com/recaptcha/admin
- [ ] Delete current site registration
- [ ] Create new site:
  - Label: `Portfolio Site $(date +%Y)`
  - reCAPTCHA type: v3
  - Domains: Add your domains
  - Click "Submit"
- [ ] Copy new site key and secret key
- [ ] Update .env:
  ```bash
  VITE_RECAPTCHA_SITE_KEY=new_site_key
  VITE_RECAPTCHA_SECRET_KEY=new_secret_key
  RECAPTCHA_SECRET_KEY=new_secret_key
  VITE_PUBLIC_RECAPTCHA_SITE_KEY=new_site_key
  ```
- [ ] Update any hardcoded keys in frontend code
- [ ] Test contact form submission

---

### 4. Figma API Credentials

**Action Items**:

- [ ] Go to https://www.figma.com/developers/api
- [ ] Settings → Personal Access Tokens
- [ ] Revoke existing token
- [ ] Generate new token:
  - Click "Generate new token"
  - Description: `Portfolio-$(date +%Y%m%d)`
  - Click "Generate"
- [ ] Update .env:
  ```bash
  FIGMA_API_KEY=new_api_key
  FIGMA_CLIENT_SECRET=new_client_secret
  ```
- [ ] Test Figma integration

---

### 5. Codacy API Tokens

**Action Items**:

- [ ] Go to https://app.codacy.com/account/apiTokens
- [ ] Revoke existing tokens:
  - API Token
  - Project Token
- [ ] Generate new tokens:
  - Click "Create API token"
  - Name: `Portfolio-$(date +%Y%m%d)`
  - Click "Create"
- [ ] Go to project settings for project token
- [ ] Update .env:
  ```bash
  CODACY_API_TOKEN=new_api_token
  CODACY_PROJECT_TOKEN=new_project_token
  ```
- [ ] Test Codacy integration in CI/CD

---

## 🔒 Post-Rotation Security

### MCP Configuration Update

**File**: `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json`

- [ ] Open mcp.json in editor
- [ ] Find lines 251 and 262
- [ ] Replace hardcoded tokens with environment variable references:
  ```json
  {
    "Authorization": "Bearer ${GITHUB_TOKEN}",
    "GITHUB_TOKEN": "${GITHUB_TOKEN}"
  }
  ```
- [ ] Save file
- [ ] Restart VS Code
- [ ] Verify MCP is working

### Environment Variable Setup (Windows)

- [ ] Set system environment variable (Option 1 - Recommended):
  ```powershell
  # Run in PowerShell as Administrator
  [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_new_token', 'User')
  ```

OR

- [ ] Use .env file in project (Option 2):
  - Tokens already added to `.env` in previous steps
  - Ensure `.env` is in `.gitignore` ✅
  - Never commit `.env` to git

---

## 🧹 Git History Cleanup (Optional)

Since repository is PRIVATE, this is optional but recommended:

- [ ] Review git history cleanup scripts:
  - Windows: `scripts/cleanup-git-history.ps1`
  - Unix/Git Bash: `scripts/cleanup-git-history.sh`
- [ ] Backup current state
- [ ] Run cleanup script:

  ```bash
  # Git Bash
  ./scripts/cleanup-git-history.sh

  # PowerShell
  .\scripts\cleanup-git-history.ps1
  ```

- [ ] Verify .env removed from history:
  ```bash
  git log --all --full-history -- .env
  ```
- [ ] Force push (⚠️ Destructive):
  ```bash
  git push --force --all
  git push --force --tags
  ```
- [ ] Notify collaborators to re-clone repository

---

## ✅ Verification Checklist

- [ ] All new tokens work correctly
- [ ] No hardcoded secrets in mcp.json
- [ ] .env file not committed to git
- [ ] mcp.json not committed to git
- [ ] VS Code MCP working with new tokens
- [ ] CI/CD pipelines working
- [ ] All integrations tested:
  - [ ] GitHub API
  - [ ] Sentry error tracking
  - [ ] reCAPTCHA on contact form
  - [ ] Figma API (if used)
  - [ ] Codacy code quality checks

---

## 🎯 Prevention Measures

Install and configure these tools to prevent future leaks:

### 1. Git Secrets Scanner

```bash
# Install gitleaks
winget install gitleaks

# Or use the repo setup script
pnpm setup:tools

# Scan repository
gitleaks detect --source . --verbose
```

### 2. Pre-commit Hook

- [ ] Install pre-commit hooks:

  ```bash
  # Create pre-commit hook
  cat > .git/hooks/pre-commit << 'EOF'
  #!/bin/bash
  # Prevent committing .env files
  if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ Error: Attempting to commit .env file!"
    echo "Remove .env from staging: git reset HEAD .env"
    exit 1
  fi
  EOF

  chmod +x .git/hooks/pre-commit
  ```

### 3. GitHub Secret Scanning

- [ ] Enable secret scanning (if not already):
  - Go to: https://github.com/Themis128/figma-cloud-portfolio/settings/security_analysis
  - Enable "Secret scanning"
  - Enable "Push protection"

### 4. Regular Security Audits

- [ ] Schedule quarterly token rotation
- [ ] Review .gitignore monthly
- [ ] Audit git history for leaks quarterly
- [ ] Review team access permissions

---

## 📞 Emergency Response

If repository accidentally becomes PUBLIC:

1. **Immediate**:
   - [ ] Make repository private again
   - [ ] Revoke ALL tokens immediately
   - [ ] Generate new tokens
   - [ ] Check GitHub Security tab for alerts

2. **Within 24 hours**:
   - [ ] Rotate all API keys and passwords
   - [ ] Review access logs for unauthorized access
   - [ ] Monitor services for unusual activity

3. **Within 1 week**:
   - [ ] Audit all integrations
   - [ ] Review and update security policies
   - [ ] Team training on secret management

---

## 📝 Notes

- Keep this checklist updated as you complete tasks
- Document any issues encountered during rotation
- Record new token creation dates for future reference
- Store emergency contacts for each service

---

**Status**: 🟡 In Progress
**Last Updated**: 2026-02-01
**Next Review**: 2026-05-01 (90 days)
