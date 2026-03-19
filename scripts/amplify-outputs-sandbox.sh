#!/usr/bin/env bash
# Regenerates amplify_outputs.json from the active sandbox stack.
# Use this after `pnpm amplify:dev` errors with "Entity expansion limit exceeded"
# (known AWS SDK XML parsing bug — the stack deploys successfully despite the error).
set -euo pipefail

REGION="us-east-1"
PREFIX="amplify-baltzakisportfolionextjs-t-sandbox"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Get the main sandbox stack only — exclude nested stacks like -auth..., -data..., etc.
# The main stack name ends with exactly one hex hash after the prefix (no further dashes).
STACK_NAME=$(aws cloudformation list-stacks \
  --region "$REGION" \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
  --query "StackSummaries[?starts_with(StackName, '$PREFIX')].StackName" \
  --output text 2>/dev/null \
  | tr '\t' '\n' \
  | grep -E "^${PREFIX}-[0-9a-f]+$" \
  | head -1)

if [ -z "$STACK_NAME" ]; then
  echo "No active sandbox stack found with prefix: $PREFIX"
  exit 1
fi

echo "Generating outputs from: $STACK_NAME"
pnpm --package=@aws-amplify/backend-cli dlx ampx generate outputs \
  --stack "$STACK_NAME" \
  --out-dir "$OUT_DIR"
