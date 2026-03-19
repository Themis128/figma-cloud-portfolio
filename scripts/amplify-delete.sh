#!/usr/bin/env bash
# Deletes the Amplify sandbox stack via AWS CLI directly.
# The ampx sandbox delete command hits an AWS SDK XML entity expansion bug
# with this project's resource naming, so we bypass it with the AWS CLI.
set -euo pipefail

REGION="us-east-1"
PREFIX="amplify-baltzakisportfolionextjs-t-sandbox"

STACK_NAME=$(aws cloudformation list-stacks \
  --region "$REGION" \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE UPDATE_ROLLBACK_COMPLETE \
  --query "StackSummaries[?starts_with(StackName, '$PREFIX')].StackName" \
  --output text 2>/dev/null | awk '{print $1}')

if [ -z "$STACK_NAME" ]; then
  echo "No sandbox stack found with prefix: $PREFIX"
  exit 0
fi

echo "Deleting sandbox stack: $STACK_NAME"
aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$REGION"
echo "Delete initiated. Stack will be removed in ~2 minutes."
