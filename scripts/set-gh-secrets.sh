#!/usr/bin/env bash
# Usage: export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... && ./scripts/set-gh-secrets.sh
# Or run interactively — the script will prompt for missing values.

set -euo pipefail
# Try GH CLI first, fallback to GITHUB_REPOSITORY env. Validate owner/repo format.
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [[ -z "$REPO" || ! "$REPO" =~ ^[^/]+/[^/]+$ ]]; then
  if [[ -n "${GITHUB_REPOSITORY:-}" && "${GITHUB_REPOSITORY:-}" =~ ^[^/]+/[^/]+$ ]]; then
    REPO="${GITHUB_REPOSITORY}"
  else
    read -r -p "Enter repository (owner/repo): " REPO
    if [[ ! "$REPO" =~ ^[^/]+/[^/]+$ ]]; then
      echo "Repository must be in 'owner/repo' format" >&2
      exit 1
    fi
  fi
fi

prompt_if_missing() {
  local name="$1"
  local val="${!name:-}"
  if [ -z "$val" ]; then
    read -r -p "Enter value for $name: " val
  fi
  echo "$val"
}

# Required secrets
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-$(prompt_if_missing AWS_ACCESS_KEY_ID)}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-$(prompt_if_missing AWS_SECRET_ACCESS_KEY)}
AMPLIFY_APP_ID=${AMPLIFY_APP_ID:-$(prompt_if_missing AMPLIFY_APP_ID)}
AMPLIFY_BRANCH=${AMPLIFY_BRANCH:-$(prompt_if_missing AMPLIFY_BRANCH)}

# Optional
AWS_REGION=${AWS_REGION:-us-east-1}
DEPLOY_TO_GHPAGES=${DEPLOY_TO_GHPAGES:-false}
DOCKER_USERNAME=${DOCKER_USERNAME:-}
DOCKER_PASSWORD=${DOCKER_PASSWORD:-}

echo "Setting secrets on $REPO..."

echo "$AWS_ACCESS_KEY_ID" | gh secret set AWS_ACCESS_KEY_ID -R "$REPO" --body -
echo "$AWS_SECRET_ACCESS_KEY" | gh secret set AWS_SECRET_ACCESS_KEY -R "$REPO" --body -
echo "$AWS_REGION" | gh secret set AWS_REGION -R "$REPO" --body -
echo "$AMPLIFY_APP_ID" | gh secret set AMPLIFY_APP_ID -R "$REPO" --body -
echo "$AMPLIFY_BRANCH" | gh secret set AMPLIFY_BRANCH -R "$REPO" --body -
echo "$DEPLOY_TO_GHPAGES" | gh secret set DEPLOY_TO_GHPAGES -R "$REPO" --body -

if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
  echo "$DOCKER_USERNAME" | gh secret set DOCKER_USERNAME -R "$REPO" --body -
  echo "$DOCKER_PASSWORD" | gh secret set DOCKER_PASSWORD -R "$REPO" --body -
fi

echo "Secrets set successfully. Verify in repository -> Settings -> Secrets & variables -> Actions."