---

# Builder.io Integration Security Best Practices

- Only public Builder.io API keys are used in the frontend (never secret keys).
- No sensitive data is sent to Builder.io; only user attributes for targeting (ID, role, country, A/B group, etc.).
- All environment variables are managed via `.env` and `.env.local` and documented in `.env.example`.
- reCAPTCHA v3 is enabled on all forms for bot/spam protection.
- HTTP security headers (Helmet.js) and rate limiting are enforced on the backend.
- XSS, SQL injection, and command injection protections are in place throughout the stack.
- Builder.io preview/editing mode is visually indicated and can be exited by users.
- Analytics and A/B test events are tracked only with non-sensitive metadata.
- For more, see Builder.io security docs: https://www.builder.io/c/docs/security
# 🔒 Security Remediation Complete - Summary

**Date**: 2026-02-01
**Repository**: figma-cloud-portfolio (PRIVATE)
**Status**: ✅ Security Framework Implemented

---

## 📊 Current Security Status

### ✅ Completed

- [x] Repository visibility confirmed (PRIVATE)
- [x] Security vulnerabilities identified and documented
- [x] `.env` backup created
- [x] `.env` and `mcp.json` added to `.gitignore`
- [x] Comprehensive security documentation created
- [x] Automated scripts for token rotation
- [x] Automated scripts for git history cleanup
- [x] Security verification script created
- [x] All security tools and templates in place

### 🟡 Pending User Action

- [ ] **Revoke exposed tokens** (GitHub, Sentry, reCAPTCHA, Figma, Codacy)
- [ ] **Generate new tokens** for all services
- [ ] **Update `.env` file** with new tokens
- [ ] **Update `mcp.json`** to use environment variable references
- [ ] **Restart VS Code** to apply MCP changes
- [ ] **Test all integrations** with new tokens
- [ ] **(Optional) Clean git history** using provided scripts

---

## 📁 Files Created

### Documentation

1. **`SECURITY_REMEDIATION.md`**
   - Complete security remediation guide
   - List of all exposed tokens
   - Detailed action items for each service

2. **`TOKEN_ROTATION_CHECKLIST.md`**
   - Step-by-step token rotation checklist
   - Direct links to service settings
   - Verification steps for each token
   - Prevention measures and best practices

3. **`MCP_SECURE_CONFIG.md`**
   - Guide for securing MCP configuration
   - Examples of secure vs insecure patterns
   - Environment variable setup instructions

### Scripts

4. **`scripts/rotate-tokens.sh`**
   - Interactive token rotation helper
   - Updates `.env` file with new tokens
   - Provides clear instructions for each service

5. **`scripts/cleanup-git-history.sh`** (Bash)
   - Removes `.env` from git history
   - Creates backup branch before cleanup
   - Comprehensive verification

6. **`scripts/cleanup-git-history.ps1`** (PowerShell)
   - Windows version of cleanup script
   - Same functionality as Bash version

7. **`scripts/verify-security.sh`**
   - Automated security verification
   - Checks all security measures
   - Provides actionable feedback

### Backups

8. **`.env.backup.YYYYMMDD_HHMMSS`**
   - Backup of current `.env` file
   - Created automatically by scripts

---

## 🚀 Quick Start Guide

### Step 1: Understand the Situation

**Good News**:

- ✅ Repository is **PRIVATE** (risk is limited)
- ✅ All security measures now in place
- ✅ Automated tools ready to use

**Need Action**:

- ⚠️ Tokens are exposed in git history
- ⚠️ Tokens hardcoded in `mcp.json`
- ⚠️ Must rotate all tokens as precaution

### Step 2: Rotate Tokens (Required)

**Option A: Interactive Script** (Easiest)

```bash
./scripts/rotate-tokens.sh
```

Follow the prompts to update each token.

**Option B: Manual Process**
Follow the detailed checklist in `TOKEN_ROTATION_CHECKLIST.md`

### Step 3: Update MCP Configuration (Required)

Edit: `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json`

Replace hardcoded tokens (lines 251, 262):

```json
{
  "Authorization": "Bearer ${GITHUB_TOKEN}",
  "GITHUB_TOKEN": "${GITHUB_TOKEN}"
}
```

See `MCP_SECURE_CONFIG.md` for detailed instructions.

### Step 4: Verify Security

```bash
./scripts/verify-security.sh
```

This checks:

- ✅ `.env` and `mcp.json` in `.gitignore`
- ✅ No files tracked by git
- ✅ No hardcoded secrets in code
- ✅ Repository visibility
- ✅ All security measures

### Step 5: Clean Git History (Optional)

Since repository is PRIVATE, this is optional but recommended:

```bash
# Bash/Git Bash
./scripts/cleanup-git-history.sh

# PowerShell
.\scripts\cleanup-git-history.ps1
```

**⚠️ Warning**: This rewrites git history and requires force push.

---

## 🔑 Tokens Requiring Rotation

| Service   | Priority    | Location           | Action URL                                          |
| --------- | ----------- | ------------------ | --------------------------------------------------- |
| GitHub    | 🔴 CRITICAL | `mcp.json`, `.env` | https://github.com/settings/tokens                  |
| Sentry    | 🟡 HIGH     | `.env`             | https://sentry.io/settings/account/api/auth-tokens/ |
| reCAPTCHA | 🟡 HIGH     | `.env`             | https://www.google.com/recaptcha/admin              |
| Figma     | 🟢 MEDIUM   | `.env`             | https://www.figma.com/developers/api                |
| Codacy    | 🟢 MEDIUM   | `.env`             | https://app.codacy.com/account/apiTokens            |

---

## 📋 Detailed Documentation

For complete details, see:

1. **Security Analysis**: `SECURITY_REMEDIATION.md`
2. **Token Rotation**: `TOKEN_ROTATION_CHECKLIST.md`
3. **MCP Security**: `MCP_SECURE_CONFIG.md`

---

## 🛠️ Available Commands

### Security Verification

```bash
./scripts/verify-security.sh
```

### Token Rotation

```bash
./scripts/rotate-tokens.sh
```

### Git History Cleanup

```bash
# Bash
./scripts/cleanup-git-history.sh

# PowerShell
.\scripts\cleanup-git-history.ps1
```

### Manual Checks

```bash
# Check if .env in git
git ls-files | grep ".env"

# Check git history for .env
git log --all --full-history -- .env

# Scan for hardcoded secrets
git grep -E "(ghp_|gho_|github_pat_)" -- '*.ts' '*.tsx' '*.js' '*.jsx'
```

---

## ✅ Verification Checklist

After completing token rotation:

- [ ] Run `./scripts/verify-security.sh` - all checks pass
- [ ] GitHub PAT works: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`
- [ ] MCP in VS Code works (no errors)
- [ ] Sentry error tracking works
- [ ] reCAPTCHA on contact form works
- [ ] Figma integration works (if used)
- [ ] Codacy integration in CI/CD works
- [ ] No LSP errors in VS Code
- [ ] Dev server starts: `pnpm dev`
- [ ] Build succeeds: `pnpm build`
- [ ] Tests pass: `pnpm test`

---

## 🎯 Prevention Measures Implemented

### Immediate Protection

- ✅ `.env` in `.gitignore`
- ✅ `mcp.json` in `.gitignore`
- ✅ Security documentation in place
- ✅ Automated verification tools

### Recommended Next Steps

- [ ] Install git-secrets: `winget install gitleaks`
- [ ] Add pre-commit hooks (template in `TOKEN_ROTATION_CHECKLIST.md`)
- [ ] Enable GitHub secret scanning (if available)
- [ ] Schedule quarterly token rotation
- [ ] Team training on secret management

---

## 🆘 If Repository Becomes Public

**Immediate Actions**:

1. Make private again immediately
2. Revoke ALL tokens within 1 hour
3. Check GitHub security alerts
4. Generate all new tokens
5. Monitor services for unauthorized access

**Contact Support If Needed**:

- GitHub: https://support.github.com/
- Sentry: From dashboard
- Google reCAPTCHA: https://support.google.com/

---

## 📞 Need Help?

### Documentation Files

- `SECURITY_REMEDIATION.md` - Complete remediation guide
- `TOKEN_ROTATION_CHECKLIST.md` - Stepby-step token rotation
- `MCP_SECURE_CONFIG.md` - MCP security guide

### Verification

```bash
./scripts/verify-security.sh
```

### All Scripts

- `scripts/rotate-tokens.sh` - Token rotation helper
- `scripts/cleanup-git-history.sh/.ps1` - Git cleanup
- `scripts/verify-security.sh` - Security verification

---

## 📝 Important Notes

1. **Repository is PRIVATE** ✅
   - Exposed tokens only accessible to collaborators
   - Risk is medium, not critical
   - Still rotate as best practice

2. **Automated Tools Ready** ✅
   - Scripts tested and ready to use
   - Documentation complete
   - Verification automated

3. **Git History Cleanup** ⚠️
   - Optional for private repos
   - Recommended for additional security
   - Requires force push (destructive)

4. **Regular Maintenance** 📅
   - Rotate tokens every 90 days
   - Run security verification monthly
   - Review access logs quarterly

---

## ✨ Successfully Implemented

Your repository now has:

- ✅ Comprehensive security documentation
- ✅ Auto tools for token management
- ✅ Git history cleanup scripts
- ✅ Security verification automation
- ✅ Prevention measures in place
- ✅ Clear action plan for remediation

**Next Action**: Follow the Quick Start Guide above to rotate your tokens.

---

**Created**: 2026-02-01
**Last Updated**: 2026-02-01
**Next Review**: 2026-05-01 (90 days)
