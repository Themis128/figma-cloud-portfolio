#!/usr/bin/env bash
# Set Netlify secrets for GitHub Actions deployment
# Usage: ./scripts/set-netlify-secrets.sh
# Requires: gh CLI (https://cli.github.com/)

set -euo pipefail

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Alternative: Set secrets manually in GitHub UI:"
    echo "  1. Go to: https://github.com/Themis128/figma-cloud-portfolio/settings/secrets/actions"
    echo "  2. Click 'New repository secret'"
    echo "  3. Add NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID, NETLIFY_SITE_NAME"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "Not logged in to GitHub CLI. Run: gh auth login"
    exit 1
fi

REPO="Themis128/figma-cloud-portfolio"

echo "Setting Netlify secrets on $REPO..."
echo ""
echo "You can find these values at:"
echo "  NETLIFY_AUTH_TOKEN: https://app.netlify.com/user/applications#personal-access-tokens"
echo "  NETLIFY_SITE_ID: Site Settings -> General -> Site details -> API ID"
echo "  NETLIFY_SITE_NAME: Site name (e.g., your-site-name for your-site-name.netlify.app)"
echo ""

# Prompt for Netlify Auth Token
read -r -p "Enter NETLIFY_AUTH_TOKEN (or press Enter to skip): " NETLIFY_AUTH_TOKEN
if [ -n "$NETLIFY_AUTH_TOKEN" ]; then
    echo "$NETLIFY_AUTH_TOKEN" | gh secret set NETLIFY_AUTH_TOKEN -R "$REPO"
    echo "✓ NETLIFY_AUTH_TOKEN set"
else
    echo "⊘ NETLIFY_AUTH_TOKEN skipped"
fi

# Prompt for Netlify Site ID
read -r -p "Enter NETLIFY_SITE_ID (API ID from Site Settings): " NETLIFY_SITE_ID
if [ -n "$NETLIFY_SITE_ID" ]; then
    echo "$NETLIFY_SITE_ID" | gh secret set NETLIFY_SITE_ID -R "$REPO"
    echo "✓ NETLIFY_SITE_ID set"
else
    echo "⊘ NETLIFY_SITE_ID skipped"
fi

# Prompt for Netlify Site Name
read -r -p "Enter NETLIFY_SITE_NAME (site name for preview URLs): " NETLIFY_SITE_NAME
if [ -n "$NETLIFY_SITE_NAME" ]; then
    echo "$NETLIFY_SITE_NAME" | gh secret set NETLIFY_SITE_NAME -R "$REPO"
    echo "✓ NETLIFY_SITE_NAME set"
else
    echo "⊘ NETLIFY_SITE_NAME skipped"
fi

echo ""
echo "Secrets configuration complete!"
echo "Verify at: https://github.com/$REPO/settings/secrets/actions"