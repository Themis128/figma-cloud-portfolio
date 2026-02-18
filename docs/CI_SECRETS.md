# CI / Deployment Secrets (required)

This document lists the repository secrets used by the CI/CD workflows and how to set them.

## Required secrets
- `AWS_ACCESS_KEY_ID` — IAM user access key with permissions to start Amplify jobs or deploy resources.
- `AWS_SECRET_ACCESS_KEY` — IAM secret key paired with the access key.
- `AMPLIFY_APP_ID` — Amplify Console app ID (found in Amplify app settings).
- `AMPLIFY_BRANCH` — Branch name in Amplify to trigger releases (e.g., `production`).

## Optional secrets
- `AWS_REGION` — AWS region, defaults to `us-east-1`.
- `DEPLOY_TO_GHPAGES` — Set to `true` to enable GitHub Pages deployment in the release workflow.
- `DOCKER_USERNAME` / `DOCKER_PASSWORD` — For pushing Docker images from CI.

## How to set secrets
1. Recommended (safe): Run the included GH-CLI helper:
   - Unix/macOS: `bash ./scripts/set-gh-secrets.sh`
   - PowerShell (Windows): `pwsh ./scripts/set-gh-secrets.ps1`
   - You can pass values via environment variables or enter them when prompted.

2. Manually in GitHub UI:
   - Repository → Settings → Secrets & variables → Actions → New repository secret
   - Add each secret name/value.

3. Using GitHub CLI (example):
   - `echo "$AWS_ACCESS_KEY_ID" | gh secret set AWS_ACCESS_KEY_ID -R owner/repo --body -`

## Notes & security
- Do NOT commit secret values to the repository.
- Use least-privilege IAM credentials for CI.
- Rotate credentials regularly and update the repository secrets.

---
If you want, I can open a PR adding this document and the helper scripts (recommended).