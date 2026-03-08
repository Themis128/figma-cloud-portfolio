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
NEXT_PUBLIC_SITE_URL="${SITE_URL}" pnpm run build

# Sync to S3
echo "☁  Syncing to s3://${S3_BUCKET}..."
aws s3 sync out/ "s3://${S3_BUCKET}" --delete --region "${AWS_REGION}"

# Invalidate CloudFront
echo "🔄 Invalidating CloudFront ${CF_DISTRIBUTION}..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "${CF_DISTRIBUTION}" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text)

echo "⏳ Waiting for invalidation ${INVALIDATION_ID}..."
aws cloudfront wait invalidation-completed \
  --distribution-id "${CF_DISTRIBUTION}" \
  --id "${INVALIDATION_ID}"

echo ""
echo "✅ Deployed to ${SITE_URL}"
echo "   CloudFront invalidation: ${INVALIDATION_ID} (completed)"
