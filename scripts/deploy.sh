#!/usr/bin/env bash
# Deploy frontend to S3 + CloudFront and optionally the Amplify Gen 2 backend.
# Usage:
#   ./scripts/deploy.sh          # frontend only
#   ./scripts/deploy.sh --all    # frontend + backend outputs
set -euo pipefail

S3_BUCKET="figma-portfolio-static"
CF_DISTRIBUTION="E134SCTR0QGQKJ"
AWS_REGION="us-east-1"
SITE_URL="https://www.baltzakisthemis.com"

echo "══════════════════════════════════════════"
echo "  Deploy → ${SITE_URL}"
echo "══════════════════════════════════════════"

# Generate Amplify backend outputs (production)
echo "⬇  Generating amplify_outputs.json (production)..."
npx ampx generate outputs --branch production --app-id d1zjif7pi1h3om

# Build frontend
echo "🔨 Building Next.js (static export)..."
NEXT_PUBLIC_SITE_URL="${SITE_URL}" \
NEXT_PUBLIC_API_BASE_URL="/api" \
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="${NEXT_PUBLIC_RECAPTCHA_SITE_KEY:-}" \
NEXT_PUBLIC_GA_ID="${NEXT_PUBLIC_GA_ID:-}" \
pnpm run build

# Sync to S3 and capture changed paths
echo "☁  Syncing to s3://${S3_BUCKET}..."
SYNC_OUTPUT=$(aws s3 sync out/ "s3://${S3_BUCKET}" --delete --region "${AWS_REGION}" 2>&1) || true
echo "$SYNC_OUTPUT"

# Extract changed paths for targeted invalidation
CHANGED=$(echo "$SYNC_OUTPUT" | awk '
  /^upload:/ { sub(/^upload: out\//, "/"); sub(/ to s3:.*/, ""); print }
  /^delete:/ { sub(/^delete: s3:\/\/'"${S3_BUCKET}"'\//, "/"); print }
' | head -50)
CHANGED_COUNT=$(echo "$CHANGED" | grep -c . || true)

if [ "$CHANGED_COUNT" -eq 0 ]; then
  echo "✅ No files changed — skipping CloudFront invalidation"
  echo "   Deployed to ${SITE_URL} (no changes)"
  exit 0
fi

# Use wildcard if too many files changed, otherwise targeted
if [ "$CHANGED_COUNT" -gt 49 ]; then
  echo "🔄 Invalidating CloudFront ${CF_DISTRIBUTION} (${CHANGED_COUNT} files → wildcard)..."
  PATHS="/*"
else
  echo "🔄 Invalidating CloudFront ${CF_DISTRIBUTION} (${CHANGED_COUNT} paths)..."
  PATHS="$CHANGED"
fi

# shellcheck disable=SC2086
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "${CF_DISTRIBUTION}" \
  --paths $PATHS \
  --query 'Invalidation.Id' --output text)

echo "⏳ Waiting for invalidation ${INVALIDATION_ID}..."
aws cloudfront wait invalidation-completed \
  --distribution-id "${CF_DISTRIBUTION}" \
  --id "${INVALIDATION_ID}"

echo ""
echo "✅ Deployed to ${SITE_URL}"
echo "   CloudFront invalidation: ${INVALIDATION_ID} (${CHANGED_COUNT} paths, completed)"
