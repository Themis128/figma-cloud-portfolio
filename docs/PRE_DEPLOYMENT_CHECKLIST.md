# 🚀 Pre-Deployment Checklist (30 minutes)

Follow this checklist **before pushing to production** for the first time.

---

## ✅ Task 1: Create GitHub Secrets (5 minutes)

### Step-by-Step:

1. **Open GitHub Repository**
   - Go to: https://github.com/Themis128/new-portfolio
   - Click: **Settings** tab (top menu)

2. **Navigate to Secrets**
   - Left sidebar: **Secrets and variables**
   - Click: **Actions**

3. **Add CODACY_ACCOUNT_TOKEN**
   - Click: **New repository secret**
   - **Name**: `CODACY_ACCOUNT_TOKEN`
   - **Value**: [Your current Codacy token from AWS Secrets Manager or local env]
     ```bash
     # Get from PowerShell:
     $env:CODACY_ACCOUNT_TOKEN
     ```
   - Click: **Add secret**
   - ✅ Verify: Secret appears in list (value hidden)

4. **Add GITHUB_TOKEN**
   - Click: **New repository secret**
   - **Name**: `GITHUB_TOKEN`
   - **Value**: [Generate at https://github.com/settings/tokens]
     - Click: **Generate new token (classic)**
     - Scopes: `repo`, `workflow`, `write:org`
     - Expiration: 1 year
     - Click: **Generate token**
     - Copy token (only shown once!)
   - Paste token in GitHub Secrets form
   - Click: **Add secret**
   - ✅ Verify: Secret appears in list

5. **Add FIGMA_API_KEY**
   - Click: **New repository secret**
   - **Name**: `FIGMA_API_KEY`
   - **Value**: [Get from https://www.figma.com/developers/api#access-tokens]
     - Log in to Figma
     - Click: **Get access token**
     - Copy token
   - Paste in GitHub Secrets form
   - Click: **Add secret**
   - ✅ Verify: Secret appears in list

6. **Add AWS_ACCESS_KEY_ID**
   - Click: **New repository secret**
   - **Name**: `AWS_ACCESS_KEY_ID`
   - **Value**: [From AWS IAM Console]
     - Go to: https://console.aws.amazon.com/iam/
     - Click: **Users** → Your user
     - Click: **Security credentials** tab
     - Click: **Create access key**
     - Copy: **Access key ID** (starts with AKIA...)
   - Paste in GitHub Secrets form
   - Click: **Add secret**
   - ✅ Verify: Secret appears in list

7. **Add AWS_SECRET_ACCESS_KEY**
   - Click: **New repository secret**
   - **Name**: `AWS_SECRET_ACCESS_KEY`
   - **Value**: [From same IAM console as above]
     - From step 6: Copy the **Secret access key**
     - ⚠️ **IMPORTANT**: This is only shown once! Copy immediately!
   - Paste in GitHub Secrets form
   - Click: **Add secret**
   - ✅ Verify: Secret appears in list

### Verification:

```bash
# Verify all 5 secrets are visible in GitHub
# (Values are masked/hidden)
Settings → Secrets and variables → Actions

Expected list:
  ✅ AWS_ACCESS_KEY_ID
  ✅ AWS_SECRET_ACCESS_KEY
  ✅ CODACY_ACCOUNT_TOKEN
  ✅ FIGMA_API_KEY
  ✅ GITHUB_TOKEN
```

---

## ✅ Task 2: Update AWS Amplify (5 minutes)

### Step-by-Step:

1. **Open AWS Amplify Console**
   - Go to: https://us-east-1.console.aws.amazon.com/amplify/
   - Click: Your portfolio app (us-east-1 region)

2. **Add Environment Variables**
   - Left sidebar: **Settings**
   - Click: **Environment variables**
   - Click: **Manage variables**

3. **Add AWS_SECRETS_MANAGER_ID**
   - Click: **Add environment variable**
   - **Name**: `AWS_SECRETS_MANAGER_ID`
   - **Value**: `portfolio/env`
   - Click: **Save** (appears at bottom)

4. **Add AWS_REGION**
   - Click: **Add environment variable**
   - **Name**: `AWS_REGION`
   - **Value**: `eu-central-1`
   - Click: **Save**

5. **Verify amplify.yml Configuration**
   - Download: Your `amplify.yml` from the repo
   - Open: `amplify.yml` in editor
   - Check for this line in **preBuild phase**:
     ```yaml
     preBuild:
       commands:
         - bash scripts/load-secrets.sh --write-env .env.production
     ```
   - ✅ If present: Continue to step 6
   - ❌ If missing: Add this line to preBuild commands section

6. **Enable AWS WAF (Optional but Recommended)**
   - Left sidebar: **Settings**
   - Click: **Security**
   - Toggle: **Enable WAF**
   - ✅ Verify: WAF shows "Enabled"

### Verification:

```bash
# Verify environment variables are set
AWS Amplify Console → Settings → Environment variables

Expected:
  ✅ AWS_REGION = eu-central-1
  ✅ AWS_SECRETS_MANAGER_ID = portfolio/env

# Verify amplify.yml has load-secrets.sh
cat amplify.yml | grep load-secrets
# Should output: bash scripts/load-secrets.sh --write-env .env.production
```

---

## ✅ Task 3: Test Deployment (10 minutes)

### Step-by-Step:

1. **Create Test Branch**

   ```bash
   # Make sure you're in repo directory
   cd d:\Nuxt Projects\new-portfolio

   # Create new test branch from main
   git checkout main
   git pull origin main
   git checkout -b test/deployment-verification
   ```

2. **Make Small Test Change**

   ```bash
   # Edit README or a config file
   echo "# Test deployment - $(date)" >> TEST_DEPLOYMENT.md

   # Commit and push
   git add TEST_DEPLOYMENT.md
   git commit -m "ci: test deployment pipeline"
   git push origin test/deployment-verification
   ```

3. **Watch GitHub Actions**
   - Go to: https://github.com/Themis128/new-portfolio/actions
   - Find workflow: **Build & Deploy** (most recent)
   - Click: View workflow run
   - Watch stages:
     - ✅ **Quality Checks** (lint, types, format) — should pass
     - ✅ **Security Audit** (npm audit, secrets scan) — should pass
     - ✅ **Build** (vite, server, resume) — should pass
     - ⏳ **Unit Tests** (may have pre-existing failures, OK)
     - ⏳ **E2E Tests** (may be skipped for non-production, OK)
     - ⏳ **Deploy** (only runs on `production` branch)

4. **Expected Results for Test Branch**

   ```
   ✅ Quality Checks: PASS
   ✅ Security Audit: PASS
   ✅ Build: PASS
   ⏳ Deploy: SKIPPED (only runs on production branch)
   ```

5. **Monitor for Errors**
   - If any stage **FAIL**:
     - Click: Failed job
     - Read: Error message
     - Common issues:
       - Missing GitHub Secrets → Add missing secret
       - Build error → Check logs, fix locally with `pnpm run build`
       - Missing dependencies → Run `pnpm install`

6. **Merge to Production**
   - Once test workflow passes quality checks:

   ```bash
   # Switch to production branch
   git checkout production

   # Merge test branch
   git merge test/deployment-verification

   # Push to production
   git push origin production
   ```

7. **Monitor Production Deployment**
   - Go to: GitHub Actions
   - Watch: **Build & Deploy** workflow (should now include Deploy stage)
   - Expected stages:
     - ✅ Quality Checks
     - ✅ Security Audit
     - ✅ Build
     - ⏳ Unit Tests
     - ⏳ E2E Tests
     - ✅ **Deploy stage runs** (AWS Amplify deployment)
     - ✅ Notify (Slack notification, if configured)

8. **Verify Live Deployment**

   ```bash
   # Check your live app
   curl https://yourdomain.com
   # OR
   Open in browser: https://yourdomain.com

   # Should return 200 OK with HTML content
   ```

9. **Check Health Endpoint**
   ```bash
   curl https://yourdomain.com/health
   # Expected: 200 OK (or 404 if not implemented)
   ```

### Troubleshooting Test Deployment:

| Issue                                      | Solution                                                             |
| ------------------------------------------ | -------------------------------------------------------------------- |
| **GitHub Actions fails at Quality Checks** | Run `pnpm lint` locally, fix errors, re-push                         |
| **Security Audit fails**                   | Run `pnpm audit`, check SAST results                                 |
| **Build fails**                            | Run `pnpm run build` locally, check errors                           |
| **Deploy stage missing**                   | Make sure you pushed to `production` branch, not test branch         |
| **Amplify deployment fails**               | Check AWS Amplify console logs, verify environment vars are set      |
| **Secrets not loaded**                     | Verify AWS_SECRETS_MANAGER_ID and AWS_REGION are in Amplify env vars |

---

## ✅ Task 4: Rotate Exposed Token (15 minutes)

⚠️ **CRITICAL**: Your Codacy token was exposed in terminal history. **Must rotate immediately.**

### Step-by-Step:

1. **Revoke Old Token**
   - Go to: https://app.codacy.com/organizations
   - Click: **Settings** (left sidebar)
   - Click: **Integrations** → **API Tokens**
   - Find: Your old token (exposed one)
   - Click: **Revoke** button
   - Confirm: "Yes, revoke this token"
   - ✅ Verify: Token shows as "Revoked"

2. **Generate New Token**
   - Same page: **API Tokens**
   - Click: **Generate Token**
   - **Name** (optional): `portfolio-github-actions`
   - **Scope** (if available): Select repo access
   - Click: **Generate**
   - ✅ **IMPORTANT**: Copy token immediately (only shown once!)

3. **Store New Token Locally (Temporary)**

   ```powershell
   # PowerShell - Store temporarily for AWS update
   $newToken = 'paste-your-new-token-here'

   # Verify token is set
   Write-Host "Token set: $newToken"
   ```

4. **Update AWS Secrets Manager**

   ```bash
   # Update the secret with new token
   aws secretsmanager update-secret \
     --secret-id portfolio/env \
     --secret-string "{\"CODACY_ACCOUNT_TOKEN\":\"$newToken\"}" \
     --region eu-central-1

   # Verify update succeeded
   aws secretsmanager describe-secret --secret-id portfolio/env --region eu-central-1
   # Should show new VersionId in output
   ```

5. **Update GitHub Secrets**
   - Go to: GitHub → Settings → Secrets and variables → Actions
   - Click: **CODACY_ACCOUNT_TOKEN** (existing secret)
   - Click: **Update**
   - **Value**: Paste new token
   - Click: **Update secret**
   - ✅ Verify: Secret updated (note the timestamp)

6. **Clear Local History**

   ```powershell
   # Remove token from PowerShell history
   Remove-Item -Path (Get-PSReadlineOption).HistorySavePath -Force -ErrorAction SilentlyContinue

   # Clear environment variable
   $env:CODACY_ACCOUNT_TOKEN = ''

   # Verify cleared
   Write-Host "Token cleared: $env:CODACY_ACCOUNT_TOKEN"
   ```

7. **Test New Token**

   ```bash
   # Push test commit to verify token works in CI/CD
   git add .
   git commit -m "ci: test rotated Codacy token"
   git push origin production

   # Monitor GitHub Actions:
   # Should complete security audit successfully
   ```

8. **Update Rotation Log**
   - Open: `TOKEN_ROTATION_SCHEDULE.md`
   - Find: Codacy token section
   - Update:
     ```markdown
     | CODACY_ACCOUNT_TOKEN | API Token | 90 days | 2026-02-01 | 2026-05-01 |
     ```
   - Save file

### Verification:

```bash
# Verify token rotation complete:

# 1. Old token is revoked
# Check Codacy dashboard → shows "Revoked"

# 2. New token is in AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id portfolio/env --region eu-central-1 | grep CODACY
# Should show new token hash

# 3. New token is in GitHub Secrets
GitHub → Settings → Secrets → CODACY_ACCOUNT_TOKEN
# Should show "Updated [timestamp]"

# 4. CI/CD works with new token
GitHub Actions → workflow should complete successfully
```

---

## 📋 Final Verification Checklist

Before marking deployment as complete:

- [ ] **GitHub Secrets**: All 5 secrets created and visible
- [ ] **AWS Amplify**: Environment variables set (AWS_SECRETS_MANAGER_ID, AWS_REGION)
- [ ] **amplify.yml**: Has `load-secrets.sh --write-env` step
- [ ] **AWS WAF**: Enabled in Amplify console
- [ ] **Test Branch**: GitHub Actions workflow passed
- [ ] **Production Deployment**: Pushed to production branch
- [ ] **Live App**: Accessible at https://yourdomain.com
- [ ] **Health Check**: https://yourdomain.com returns 200
- [ ] **Old Token Revoked**: Codacy token revoked in dashboard
- [ ] **New Token Stored**: Token in AWS Secrets Manager and GitHub Secrets
- [ ] **Rotation Log Updated**: TOKEN_ROTATION_SCHEDULE.md updated

---

## ⏱️ Time Tracking

Use this to track your progress:

```
Start Time: [WRITE YOUR START TIME]

Task 1: Create GitHub Secrets        _____ min (target: 5)
Task 2: Update AWS Amplify          _____ min (target: 5)
Task 3: Test Deployment             _____ min (target: 10)
Task 4: Rotate Token                _____ min (target: 15)

Total Time: _____ min (target: 35)

End Time: [WRITE YOUR END TIME]
```

---

## 🆘 Need Help?

### GitHub Actions Fails?

1. Click: Failed job
2. Read: Error message and logs
3. Common fixes:

   ```bash
   # Fix linting errors
   pnpm lint --fix

   # Check TypeScript
   pnpm typecheck

   # Rebuild locally
   pnpm run build
   ```

### Amplify Deployment Fails?

1. Check: AWS Amplify Console → Deployments tab
2. View: Logs for error message
3. Common issues:
   - Secret not found → Verify AWS_SECRETS_MANAGER_ID in env vars
   - Build timeout → Check build logs for long-running processes
   - Missing files → Verify artifacts path correct in amplify.yml

### Token Still Causing Issues?

1. Verify: AWS Secrets Manager has new token

   ```bash
   aws secretsmanager get-secret-value --secret-id portfolio/env
   ```

2. Verify: GitHub Secrets has new token

   ```
   GitHub → Settings → Secrets → CODACY_ACCOUNT_TOKEN
   ```

3. Clear: Local environment

   ```bash
   $env:CODACY_ACCOUNT_TOKEN = ''
   ```

4. Test: With new token locally
   ```bash
   git push origin production
   # Watch GitHub Actions deploy
   ```

---

## 📞 Support Resources

- **GitHub Actions Help**: https://docs.github.com/en/actions
- **AWS Amplify Docs**: https://docs.aws.amazon.com/amplify/
- **AWS Secrets Manager**: https://docs.aws.amazon.com/secretsmanager/
- **Codacy API**: https://docs.codacy.com/api/

---

**Next Step After This Checklist**:

Once all 4 tasks pass ✅, your deployment is **live and secured**!

Monitor it with:

- GitHub Actions Dashboard → Watch for failures
- AWS Amplify Console → Check deployment status
- CloudWatch → Monitor errors and performance
- Your app → https://yourdomain.com

🎉 **Congratulations on going live!**
