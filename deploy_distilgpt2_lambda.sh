#!/bin/bash
# Deploy DistilGPT2 Lambda + API Gateway for Playwright AI autofix

set -e

# Variables (edit these)
ACCOUNT_ID="278585680617"
ROLE_NAME="root"
REGION="us-east-1"

# 1. Package handler
zip distilgpt2_lambda.zip distilgpt2_lambda.py

# 2. Package dependencies as layer
mkdir -p python
pip install transformers torch numpy -t python
zip -r layer.zip python
rm -rf python

# 3. Publish Lambda Layer
LAYER_ARN=$(aws lambda publish-layer-version \
  --layer-name distilgpt2-deps \
  --description "DistilGPT2 dependencies" \
  --zip-file fileb://layer.zip \
  --compatible-runtimes python3.10 \
  --region $REGION \
  --query LayerVersionArn --output text)

echo "Layer ARN: $LAYER_ARN"

# 4. Create Lambda function
aws lambda create-function \
  --function-name distilgpt2-autofix \
  --runtime python3.10 \
  --role arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME \
  --handler distilgpt2_lambda.lambda_handler \
  --zip-file fileb://distilgpt2_lambda.zip \
  --layers $LAYER_ARN \
  --timeout 30 \
  --memory-size 2048 \
  --region $REGION

# 5. Create API Gateway
API_ID=$(aws apigatewayv2 create-api \
  --name distilgpt2-autofix-api \
  --protocol-type HTTP \
  --region $REGION \
  --query ApiId --output text)

echo "API ID: $API_ID"

# 6. Create Lambda integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:$REGION:$ACCOUNT_ID:function:distilgpt2-autofix \
  --payload-format-version 2.0 \
  --region $REGION \
  --query IntegrationId --output text)

echo "Integration ID: $INTEGRATION_ID"

# 7. Create route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key 'POST /autofix' \
  --target integrations/$INTEGRATION_ID \
  --region $REGION

# 8. Deploy API
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy \
  --region $REGION

# 9. Add Lambda permissions for API Gateway
aws lambda add-permission \
  --function-name distilgpt2-autofix \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/POST/autofix \
  --statement-id apigw-invoke \
  --region $REGION

echo "Deployment complete!"
echo "API endpoint: https://$API_ID.execute-api.$REGION.amazonaws.com/prod/autofix"
