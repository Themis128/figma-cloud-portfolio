#!/bin/bash

# Script to set up GitHub repository secrets from .env file
# Usage: ./setup-github-secrets.sh <github-repo> <github-token>
# Example: ./setup-github-secrets.sh Themis128/figma-cloud-portfolio ghp_...

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <github-repo> <github-token>"
    echo "Example: $0 Themis128/figma-cloud-portfolio ghp_..."
    exit 1
fi

REPO="$1"
TOKEN="$2"
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found in current directory"
    exit 1
fi

echo "🔐 Setting up GitHub repository secrets for $REPO"
echo "📄 Reading secrets from $ENV_FILE"

# Function to set a GitHub secret
set_secret() {
    local name="$1"
    local value="$2"

    if [ -z "$value" ]; then
        echo "⚠️  Skipping $name (empty value)"
        return
    fi

    echo "🔑 Setting secret: $name"

    # Create the secret using GitHub API
    curl -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/actions/secrets/$name" \
        -d "{\"encrypted_value\":\"$value\",\"key_id\":\"$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/$REPO/actions/secrets/public-key" | jq -r .key_id)\",\"key\":\"$(curl -s -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/$REPO/actions/secrets/public-key" | jq -r .key)\"}" 2>/dev/null || echo "❌ Failed to set $name"
}

# Read .env file and set secrets
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^[[:space:]]*# ]] && continue
    [[ -z "$key" ]] && continue

    # Remove quotes from value if present
    value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")

    # Convert environment variable name to GitHub secret name
    secret_name=$(echo "$key" | tr '[:lower:]' '[:upper:]')

    set_secret "$secret_name" "$value"
done < "$ENV_FILE"

echo ""
echo "✅ GitHub secrets setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/$REPO/settings/secrets/actions"
echo "2. Verify the secrets were created:"
echo "   - VITE_RECAPTCHA_SITE_KEY"
echo "   - VITE_RECAPTCHA_SECRET_KEY"
echo "   - VITE_GOOGLE_ANALYTICS_ID"
echo "   - VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID"
echo "   - VITE_PUBLIC_RECAPTCHA_SITE_KEY"
echo "   - VITE_AI_PROVIDER"
echo "   - VITE_AI_MODEL"
echo "   - VITE_OLLAMA_BASE_URL"
echo "   - CODACY_API_TOKEN"
echo "   - CODACY_PROJECT_TOKEN"
echo "   - SENTRY_DSN"
echo "   - VITE_SENTRY_DSN"
echo "   - GITHUB_PORTFOLIO_TOKEN"
echo ""
echo "3. Add missing AWS secrets:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_REGION"
echo "   - AMPLIFY_PRODUCTION_APP_ID"
echo "   - AMPLIFY_STAGING_APP_ID"
echo ""
echo "⚠️  Note: AWS secrets must be obtained from AWS IAM and Amplify Console"
<parameter name="filePath">d:\Nuxt Projects\new-portfolio\setup-github-secrets.sh