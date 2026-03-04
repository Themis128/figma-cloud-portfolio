# GitHub Secrets Setup Guide

This guide will help you set up all the necessary secrets for your GitHub Actions workflows to work with AWS Amplify deployment.

## 🚀 Quick Setup (Automated)

### Option 1: Bash Script (Linux/Mac)

```bash
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh Themis128/figma-cloud-portfolio YOUR_GITHUB_TOKEN
```

### Option 2: PowerShell Script (Windows)

```powershell
.\setup-github-secrets.ps1 -Repo "Themis128/figma-cloud-portfolio" -Token "YOUR_GITHUB_TOKEN"
```

## 🔧 Manual Setup

If the automated scripts don't work, follow these steps:

### 1. Go to GitHub Repository Settings

Navigate to: <https://github.com/Themis128/figma-cloud-portfolio/settings/secrets/actions>

### 2. Add Repository Secrets

#### AWS Configuration (Required for Deployment)

```bash
AWS_ACCESS_KEY_ID          → Your AWS Access Key ID
AWS_SECRET_ACCESS_KEY      → Your AWS Secret Access Key
AWS_REGION                 → eu-central-1
AMPLIFY_PRODUCTION_APP_ID  → d25rpobpd22vvg   ✅ confirmed (baltzakis-portfolio)
AMPLIFY_STAGING_APP_ID     → d25rpobpd22vvg   ✅ same app — staging = a branch on this app
                             (create a "staging" branch in Amplify Console if not yet done)
```

#### Application Secrets (From your .env file)

```bash
VITE_RECAPTCHA_SITE_KEY           → 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
VITE_RECAPTCHA_SECRET_KEY         → 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
VITE_GOOGLE_ANALYTICS_ID          → G-FT79QM66D3
VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID → G-FT79QM66D3
GOOGLE_ANALYTICS_MEASUREMENT_ID   → G-FT79QM66D3 (server-side, optional)
GOOGLE_ANALYTICS_API_SECRET       → <GA4 Measurement Protocol API secret> (server-side)
VITE_PUBLIC_RECAPTCHA_SITE_KEY    → 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
VITE_AI_PROVIDER                  → ollama
VITE_AI_MODEL                     → llama2
VITE_OLLAMA_BASE_URL              → http://localhost:11434/v1
CODACY_API_TOKEN                  → Your Codacy API token
CODACY_PROJECT_TOKEN              → Your Codacy project token
SENTRY_DSN                        → Your Sentry DSN
VITE_SENTRY_DSN                   → Your Sentry DSN
VITE_GITHUB_TOKEN            → Your GitHub personal access token
```

## 🔑 How to Get These Secrets

### AWS Secrets

1. **AWS Access Keys**: Go to AWS IAM Console → Users → Your User → Security Credentials → Create Access Key
2. **Amplify App IDs**: Go to AWS Amplify Console → Your App → App Settings → General → App ID

### Other Secrets

- **reCAPTCHA**: <https://www.google.com/recaptcha/admin>
- **Google Analytics**: <https://analytics.google.com>
- **Codacy**: <https://app.codacy.com> → Your Project → Settings → Integrations
- **Sentry**: <https://sentry.io> → Your Project → Settings → Client Keys
- **GitHub Token**: <https://github.com/settings/tokens> → Generate new token (repo scope)

## ✅ Verification

After setting up the secrets:

1. **Check GitHub Actions**: Go to the Actions tab in your repository
2. **Trigger a workflow**: Push to `develop` branch (staging) or `production` branch
3. **Monitor deployment**: Check AWS Amplify Console for deployment status

## 🚨 Expected Issues (Until You Set Up Amplify)

The workflows will likely fail initially because:

- AWS Amplify apps may not exist yet
- IAM permissions may not be configured
- Environment variables may be missing

This is **normal** - the workflows are designed to check for these and fail gracefully with clear error messages.

## 🛠️ Troubleshooting

### Workflow fails with "Amplify app not found"

- Create the Amplify app in AWS Console first
- Ensure the app ID matches the secret `AMPLIFY_PRODUCTION_APP_ID` or `AMPLIFY_STAGING_APP_ID`

### Workflow fails with "AWS credentials invalid"

- Check that your AWS access keys are correct
- Ensure the IAM user has Amplify permissions
- Verify the AWS region is correct

### Build fails with missing environment variables

- Ensure all `VITE_*` secrets are set in GitHub
- Check that the variable names match exactly

## 📋 Required IAM Permissions

Your AWS IAM user needs these permissions for Amplify deployment:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:*",
        "s3:*",
        "cloudformation:*",
        "iam:*",
        "lambda:*",
        "apigateway:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🔄 Next Steps

1. Set up your AWS Amplify apps (staging and production)
2. Configure the required secrets as described above
3. Test the deployment by pushing to the appropriate branches
4. Monitor the deployment progress in AWS Amplify Console

## 📞 Support

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Ensure AWS permissions are properly configured
4. Check AWS Amplify Console for additional error details
