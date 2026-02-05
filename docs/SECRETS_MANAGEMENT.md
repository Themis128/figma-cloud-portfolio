# 🔒 Secure Secrets Management Guide

## Overview

This guide explains how to securely manage environment variables and secrets for the portfolio project without storing them in version-controlled files.

## Quick Start

### 1. Load Environment Variables

```powershell
cd d:\Nuxt Projects\new-portfolio
.\scripts\setup-env-vars.ps1
```

### 2. Interactive Setup (Recommended)

```powershell
.\scripts\setup-env-vars.ps1 -Interactive
```

This will prompt you to enter sensitive values that won't be stored in version control.

## Security Best Practices

### ✅ DO

- Store secrets in environment variables
- Use Windows Credential Manager for local development
- Use Azure Key Vault for deployed applications
- Rotate exposed tokens immediately
- Add `.env*` files to `.gitignore`
- Keep `.env.example` with placeholder values only

### ❌ DON'T

- Commit `.env` files to Git
- Store secrets in source code
- Use the same token across environments
- Share API keys in chat or email
- Keep backup files with secrets in version control

## Setup Methods

### Method 1: PowerShell Profile (Recommended for Local Development)

Create a PowerShell profile file to store secrets locally:

```powershell
# Open or create your PowerShell profile
if (!(Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force | Out-Null
}
notepad $PROFILE
```

Add your secrets to the profile:

```powershell
# GitHub Tokens
$env:GITHUB_TOKEN = 'ghp_your_personal_access_token_here'
$env:GITHUB_MCP_TOKEN = 'ghp_your_mcp_token_here'

# Figma
$env:FIGMA_API_KEY = 'figd_your_figma_key_here'

# Firebase
$env:VITE_FIREBASE_API_KEY = 'your_firebase_api_key'
$env:VITE_FIREBASE_PROJECT_ID = 'your_project_id'
$env:VITE_FIREBASE_VAPID_KEY = 'your_vapid_key'

# AWS
$env:AWS_ACCESS_KEY_ID = 'your_aws_access_key'
$env:AWS_SECRET_ACCESS_KEY = 'your_aws_secret_key'
$env:AWS_REGION = 'us-east-1'

# AI Services (choose one or more)
$env:VITE_OPENAI_API_KEY = 'sk_your_openai_key_here'
$env:VITE_ANTHROPIC_API_KEY = 'sk-ant_your_claude_key_here'

# Google reCAPTCHA
$env:VITE_RECAPTCHA_SITE_KEY = 'your_public_key'
# VITE_RECAPTCHA_SECRET_KEY = 'your_secret_key'  # Server-side only

# Google Analytics
$env:VITE_GOOGLE_ANALYTICS_ID = 'G_your_tracking_id'

# Codacy
$env:CODACY_API_TOKEN = 'your_codacy_token'
$env:CODACY_PROJECT_TOKEN = 'your_project_token'
```

Save the file and reload your PowerShell:

```powershell
& $PROFILE
```

### Method 2: Windows Credential Manager (For Sensitive Credentials)

Store passwords securely in Windows Credential Manager:

```powershell
# Store a credential
$cred = Get-Credential
$cred.Password | ConvertFrom-SecureString | Set-Content 'path\to\encrypted.txt'

# Retrieve a credential
$password = Get-Content 'path\to\encrypted.txt' | ConvertTo-SecureString
$cred = New-Object System.Management.Automation.PSCredential('username', $password)
```

### Method 3: Azure Key Vault (For Production)

For deployed applications, use Azure Key Vault:

```powershell
# Install Azure PowerShell module
Install-Module -Name Az.KeyVault -Force

# List secrets
Get-AzKeyVaultSecret -VaultName 'your-vault-name'

# Get a specific secret
$secret = Get-AzKeyVaultSecret -VaultName 'your-vault-name' -Name 'github-token'
```

### Method 4: GitHub Secrets (For CI/CD)

Store secrets in GitHub for automated deployments:

1. Go to: Settings → Secrets and variables → Actions
2. Create new secrets required for your workflows:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `GITHUB_TOKEN` (auto-provided)
   - `FIREBASE_CONFIG`
   - etc.

Reference in workflows:

```yaml
- name: Deploy
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: pnpm run build
```

## Required Secrets by Feature

### GitHub Integration

- **GITHUB_TOKEN**: Personal Access Token
  - Scopes: `repo`, `gist`, `read:user`
  - Get: https://github.com/settings/tokens
  - Status: ⚠️ EXPOSED - Rotate immediately

### Figma API

- **FIGMA_API_KEY**: Figma access token
  - Get: https://www.figma.com/developers/api#authentication
  - Status: ⚠️ EXPOSED - Rotate immediately

### Firebase (Client-side)

- **VITE_FIREBASE_API_KEY**: Public API key
- **VITE_FIREBASE_PROJECT_ID**: Project identifier
- **VITE_FIREBASE_AUTH_DOMAIN**: Auth domain
- **VITE_FIREBASE_STORAGE_BUCKET**: Storage bucket
- **VITE_FIREBASE_VAPID_KEY**: Web push key
- Get: Firebase Console → Project Settings

### Firebase (Server-side - DO NOT EXPOSE)

- **FIREBASE_PROJECT_ID**: Private
- **FIREBASE_PRIVATE_KEY**: Private - Never in `.env`
- **FIREBASE_CLIENT_EMAIL**: Private

### AWS Services

- **AWS_ACCESS_KEY_ID**: AWS credential
- **AWS_SECRET_ACCESS_KEY**: AWS credential
- **AWS_REGION**: Region (us-east-1)
- **VITE*LAMBDA*\*\_URL**: Function URLs after deployment

### AI Services (Choose one or more)

- **VITE_OPENAI_API_KEY**: OpenAI (sk-...)
  - Get: https://platform.openai.com/api-keys
- **VITE_ANTHROPIC_API_KEY**: Claude (sk-ant-...)
  - Get: https://console.anthropic.com/
- **VITE_TOGETHER_API_KEY**: Together AI
  - Get: https://api.together.xyz/settings/api-keys

### Google reCAPTCHA

- **VITE_RECAPTCHA_SITE_KEY**: Public key
- **RECAPTCHA_SECRET_KEY**: Private key (server-only)
- Get: https://www.google.com/recaptcha/admin

### Sentry (Error Tracking)

- **VITE_SENTRY_DSN**: Client DSN
- **SENTRY_DSN**: Server DSN
- **SENTRY_ACCESS_TOKEN**: API token
- Get: https://sentry.io/settings/account/api-tokens/

## Development Workflow

### 1. Initial Setup

```powershell
# Clone repository
git clone https://github.com/Themis128/figma-cloud-portfolio.git
cd figma-cloud-portfolio

# Copy example
cp .env.example .env

# Run setup script
.\scripts\setup-env-vars.ps1 -Interactive
```

### 2. Local Development

```powershell
# Environment variables are loaded from PowerShell profile on startup
pnpm install
pnpm dev
```

### 3. Before Committing

```powershell
# Verify no secrets in staged files
git diff --cached | grep -i "token\|key\|secret"

# Check commit won't contain secrets
git status
```

## Rotating Exposed Secrets

If a secret is ever exposed (like in our case), follow this process:

### Step 1: Revoke Immediately

- GitHub PAT: https://github.com/settings/tokens → Delete
- Figma Key: https://www.figma.com/developers/api → Regenerate
- AWS: https://console.aws.amazon.com/iam/ → Deactivate

### Step 2: Generate New Secret

- Get from respective service
- Store in PowerShell profile or vault
- **DO NOT** commit

### Step 3: Update Application

- Update environment variables
- Restart application
- Run tests to verify

### Step 4: Audit

```powershell
# Search git history for the exposed secret
git log -S "ghp_old_token_here" --all

# View commits that might contain secrets
git log --all --oneline -- ".env*"
```

## Monitoring & Alerts

### GitHub Secret Scanning

Enable in repository settings:

1. Settings → Security & analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

This will block commits containing common secret patterns.

### Codacy Secret Detection

Our quality checks now include Trivy for secret scanning:

```bash
pnpm run lint  # Includes secret detection
```

## Troubleshooting

### Environment Variable Not Found

```powershell
# Check if variable is set
$env:GITHUB_TOKEN

# List all environment variables
Get-ChildItem env: | grep -i github
```

### Configuration Not Loading

```powershell
# Reload PowerShell profile
& $PROFILE

# Verify profile path
echo $PROFILE

# Test setup script
.\scripts\setup-env-vars.ps1 -Interactive
```

### Secrets Leaked in History

```powershell
# Rewrite history (dangerous!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  -- --all

# Or use BFG Repo Cleaner (recommended)
bfg --delete-files .env
```

## References

- [GitHub: Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS: Best practices for credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Microsoft: Secret Management module](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.secretmanagement/)

## Next Steps

1. ✅ Review this guide
2. ✅ Set up PowerShell profile with secrets
3. ✅ Run `.\scripts\setup-env-vars.ps1 -Interactive`
4. ✅ Test with `pnpm dev`
5. ✅ Commit changes (`.env` files are excluded via `.gitignore`)
6. ✅ Verify no secrets in git: `git log -p -- .env`
