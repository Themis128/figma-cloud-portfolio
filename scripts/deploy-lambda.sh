#!/usr/bin/env bash
# Build and deploy the Express API server to AWS Lambda.
#
# Usage:
#   ./scripts/deploy-lambda.sh           # build + deploy
#   ./scripts/deploy-lambda.sh --build   # build only (no deploy)
#
# The script:
#   1. Bundles server/lambda.ts → dist/lambda/index.mjs  (esbuild, single file)
#   2. Copies bot/knowledge/*.md and content/blog/*.mdx   (runtime file reads)
#   3. Zips everything → dist/lambda.zip
#   4. Deploys to the figma-portfolio-api Lambda function
#   5. Updates handler config (timeout 60s, Node 20.x)
set -euo pipefail

FUNCTION_NAME="figma-portfolio-api"
AWS_REGION="us-east-1"
DIST_DIR="dist/lambda"
ZIP_FILE="dist/lambda.zip"
BUILD_ONLY=false

if [[ "${1:-}" == "--build" ]]; then
  BUILD_ONLY=true
fi

echo "══════════════════════════════════════════"
echo "  Lambda Build & Deploy → ${FUNCTION_NAME}"
echo "══════════════════════════════════════════"

# ── Step 1: Clean ──────────────────────────────────────────────────────────────
rm -rf "${DIST_DIR}" "${ZIP_FILE}"
mkdir -p "${DIST_DIR}"

# ── Step 2: Bundle with esbuild ───────────────────────────────────────────────
echo "📦 Bundling server/lambda.ts → ${DIST_DIR}/index.mjs..."
npx esbuild server/lambda.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --format=esm \
  --outfile="${DIST_DIR}/index.mjs" \
  --minify \
  --sourcemap=external \
  --external:@aws-sdk/* \
  --banner:js="import{createRequire}from'module';const require=createRequire(import.meta.url);"

echo "   Bundle size: $(du -sh "${DIST_DIR}/index.mjs" | cut -f1)"

# ── Step 3: Copy runtime assets ──────────────────────────────────────────────
echo "📋 Copying knowledge base and blog files..."
mkdir -p "${DIST_DIR}/bot/knowledge"
cp server/bot/knowledge/*.md "${DIST_DIR}/bot/knowledge/"
echo "   Knowledge: $(ls "${DIST_DIR}/bot/knowledge/" | wc -l) files"

mkdir -p "${DIST_DIR}/content/blog"
if ls content/blog/*.mdx 1>/dev/null 2>&1; then
  cp content/blog/*.mdx "${DIST_DIR}/content/blog/"
  echo "   Blog posts: $(ls "${DIST_DIR}/content/blog/" | wc -l) files"
else
  echo "   Blog posts: 0 files (no MDX found)"
fi

# ── Step 4: Zip ──────────────────────────────────────────────────────────────
echo "🗜  Creating ${ZIP_FILE}..."
(cd "${DIST_DIR}" && zip -r -q "../../${ZIP_FILE}" .)
echo "   Zip size: $(du -sh "${ZIP_FILE}" | cut -f1)"

if [[ "${BUILD_ONLY}" == true ]]; then
  echo ""
  echo "✅ Build complete (--build mode, skipping deploy)"
  exit 0
fi

# ── Step 5: Deploy to Lambda ─────────────────────────────────────────────────
echo "🚀 Deploying to ${FUNCTION_NAME}..."
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --zip-file "fileb://${ZIP_FILE}" \
  --region "${AWS_REGION}" \
  --output text \
  --query 'FunctionArn'

echo "⏳ Waiting for function to become active..."
aws lambda wait function-active-v2 \
  --function-name "${FUNCTION_NAME}" \
  --region "${AWS_REGION}"

# ── Step 6: Update handler configuration ─────────────────────────────────────
echo "🔧 Updating handler configuration..."
aws lambda update-function-configuration \
  --function-name "${FUNCTION_NAME}" \
  --handler "index.handler" \
  --runtime "nodejs20.x" \
  --timeout 60 \
  --memory-size 1024 \
  --region "${AWS_REGION}" \
  --output text \
  --query 'FunctionArn' > /dev/null

echo "⏳ Waiting for configuration update..."
aws lambda wait function-active-v2 \
  --function-name "${FUNCTION_NAME}" \
  --region "${AWS_REGION}"

# ── Step 7: Verify ───────────────────────────────────────────────────────────
echo ""
echo "🧪 Verifying deployment..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws/api/ping" \
  --max-time 15)

if [[ "${RESPONSE}" == "200" ]]; then
  echo "✅ Lambda is live and responding (HTTP ${RESPONSE})"
else
  echo "⚠️  Lambda returned HTTP ${RESPONSE} — check CloudWatch logs"
fi

echo ""
echo "✅ Deployed ${FUNCTION_NAME}"
echo "   URL: https://oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws/"
echo "   Invoke mode: RESPONSE_STREAM"
