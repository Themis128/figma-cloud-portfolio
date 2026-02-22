#!/bin/bash
# Deploy Playwright AI Autofix Lambda Function for Real-Time Config
# This script deploys the AI autofix Lambda function to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Playwright AI Autofix Lambda Deployment${NC}"
echo -e "${BLUE}================================================${NC}"

# Configuration
ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo '')}"
REGION="${AWS_REGION:-us-east-1}"
FUNCTION_NAME="playwright-autofix"
LAMBDA_ROLE="${LAMBDA_ROLE:-arn:aws:iam::${ACCOUNT_ID}:role/lambda-basic-role}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if account ID is available
if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}Error: Could not determine AWS Account ID. Please set AWS_ACCOUNT_ID or configure AWS CLI.${NC}"
    exit 1
fi

echo -e "${GREEN}Account ID: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}Region: ${REGION}${NC}"
echo -e "${GREEN}Function Name: ${FUNCTION_NAME}${NC}"
echo ""

# Create deployment directory
DEPLOY_DIR="deploy-playwright-autofix"
mkdir -p "$DEPLOY_DIR"

# Step 1: Build the Lambda function
echo -e "${YELLOW}Step 1: Building Lambda function...${NC}"
cd amplify/functions/playwright-autofix

# Create a simple package for Lambda
cp index.ts "$DEPLOY_DIR/../../../../$DEPLOY_DIR/index.mjs"

# Convert TypeScript to ES module format for Lambda
cat > "$DEPLOY_DIR/../../../../$DEPLOY_DIR/index.mjs" << 'EOF'
/**
 * Playwright AI Autofix Lambda Function
 * Real-time test failure analysis and fix suggestions
 */

// Error patterns for common Playwright issues
const ERROR_PATTERNS = {
  selector: [
    { pattern: /locator\.(getBy|findBy|locator).*not found/i, type: 'element-not-found' },
    { pattern: /waiting for locator/i, type: 'element-timeout' },
    { pattern: /strict mode violation/i, type: 'multiple-elements' },
    { pattern: /element is not attached/i, type: 'stale-element' },
    { pattern: /element is not visible/i, type: 'visibility' },
  ],
  timeout: [
    { pattern: /timeout.*exceeded/i, type: 'timeout' },
    { pattern: /waiting for.*timed out/i, type: 'wait-timeout' },
    { pattern: /navigation.*timed out/i, type: 'navigation-timeout' },
  ],
  action: [
    { pattern: /element is not editable/i, type: 'not-editable' },
    { pattern: /element is disabled/i, type: 'disabled' },
    { pattern: /click intercepted/i, type: 'click-intercepted' },
    { pattern: /scroll.*into view/i, type: 'scroll-needed' },
  ],
  assertion: [
    { pattern: /expect\(.*\)\.(toBe|toHave|toContain).*failed/i, type: 'assertion-failed' },
    { pattern: /snapshot.*mismatch/i, type: 'snapshot-mismatch' },
    { pattern: /text content.*mismatch/i, type: 'text-mismatch' },
  ],
};

const SELECTOR_IMPROVEMENTS = {
  'xpath=': 'Consider using CSS selectors or data-testid for better reliability',
  'text=': 'Consider using getByText() or getByRole() for better maintainability',
  '.btn': 'Consider using more specific selector like [data-testid="submit-btn"]',
  '#root': 'Root selector is too generic, consider more specific targeting',
  'div >': 'Deep nested selectors are brittle, consider data-testid',
  '[class=': 'Class selectors can change, prefer data-testid or role',
};

function generateSelectorFix(error, selector) {
  const suggestions = [];
  
  if (selector) {
    for (const [pattern, improvement] of Object.entries(SELECTOR_IMPROVEMENTS)) {
      if (selector.toLowerCase().includes(pattern.toLowerCase())) {
        suggestions.push({
          type: 'selector',
          confidence: 0.85,
          suggestion: improvement,
          code: `// Before:\nawait page.locator('${selector}')\n\n// After:\nawait page.getByTestId('your-test-id')`,
          documentation: 'https://playwright.dev/docs/locators',
        });
      }
    }
  }

  if (/not found|not visible|not attached/i.test(error)) {
    suggestions.push({
      type: 'wait',
      confidence: 0.9,
      suggestion: 'Add explicit wait for element before interaction',
      code: `await page.locator('selector').waitFor({ state: 'visible' });`,
    });
  }

  if (/stale|not attached/i.test(error)) {
    suggestions.push({
      type: 'selector',
      confidence: 0.95,
      suggestion: 'Element became stale. Re-locate the element or add retry logic',
      code: `const locator = page.getByTestId('element');\nawait locator.waitFor();\nawait locator.click();`,
    });
  }

  return suggestions;
}

function generateTimeoutFix(error, timeout) {
  const suggestions = [];
  const currentValue = timeout || 30000;

  if (/navigation.*timeout/i.test(error)) {
    suggestions.push({
      type: 'timeout',
      confidence: 0.9,
      suggestion: 'Navigation timeout - page may be loading slowly or stuck',
      code: `await page.goto('/url', { waitUntil: 'networkidle', timeout: 60000 });`,
    });
  }

  if (/element.*timeout|waiting for.*timeout/i.test(error)) {
    suggestions.push({
      type: 'wait',
      confidence: 0.85,
      suggestion: `Current timeout (${currentValue}ms) may be too short`,
      code: `await expect(page.locator('selector')).toBeVisible({ timeout: 60000 });`,
    });
  }

  return suggestions;
}

function generateActionFix(error) {
  const suggestions = [];

  if (/click intercepted/i.test(error)) {
    suggestions.push({
      type: 'action',
      confidence: 0.95,
      suggestion: 'Click intercepted by another element. Try force click or dismiss overlays',
      code: `await locator.click({ force: true });`,
    });
  }

  if (/not editable|disabled/i.test(error)) {
    suggestions.push({
      type: 'action',
      confidence: 0.9,
      suggestion: 'Element is not interactive. Wait for it to become enabled',
      code: `await expect(locator).toBeEnabled();\nawait locator.click();`,
    });
  }

  return suggestions;
}

function generateAssertionFix(error) {
  const suggestions = [];

  if (/snapshot.*mismatch/i.test(error)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.8,
      suggestion: 'Visual snapshot mismatch. Review changes or update baseline',
      code: `npx playwright test --update-snapshots`,
    });
  }

  if (/text.*mismatch/i.test(error)) {
    suggestions.push({
      type: 'assertion',
      confidence: 0.85,
      suggestion: 'Text content does not match expected value',
      code: `await expect(locator).toContainText('partial text');`,
    });
  }

  return suggestions;
}

function analyzeError(request) {
  const { error, selector, timeout } = request;
  const errorMessage = error?.message || '';
  const allSuggestions = [];

  allSuggestions.push(...generateSelectorFix(errorMessage, selector));
  allSuggestions.push(...generateTimeoutFix(errorMessage, timeout));
  allSuggestions.push(...generateActionFix(errorMessage));
  allSuggestions.push(...generateAssertionFix(errorMessage));

  if (allSuggestions.length === 0) {
    allSuggestions.push({
      type: 'config',
      confidence: 0.5,
      suggestion: 'Consider increasing timeouts or adding explicit waits',
      code: `await page.getByTestId('element').click();`,
    });
  }

  return allSuggestions.sort((a, b) => b.confidence - a.confidence);
}

export const handler = async (event) => {
  const startTime = Date.now();

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const request = {
      testTitle: body.testTitle || 'Unknown Test',
      error: body.error || { message: 'Unknown error' },
      file: body.file || 'unknown',
      line: body.line,
      code: body.code,
      selector: body.selector,
      timeout: body.timeout,
    };

    const suggestions = analyzeError(request);
    const autoFixable = suggestions.some(s => s.confidence >= 0.9);
    const recommendedAction = suggestions[0]?.suggestion || 'Review the error manually';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        suggestions,
        autoFixable,
        recommendedAction,
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'playwright-autofix-v1',
          version: '1.0.0',
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        suggestions: [],
        autoFixable: false,
        recommendedAction: 'Internal server error',
        metadata: {
          processingTime: Date.now() - startTime,
          model: 'playwright-autofix-v1',
          version: '1.0.0',
        },
        error: error.message,
      }),
    };
  }
};
EOF

cd "$DEPLOY_DIR/../../../../"
echo -e "${GREEN}✓ Lambda function built${NC}"

# Step 2: Create ZIP package
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
cd "$DEPLOY_DIR"
zip -r "../${FUNCTION_NAME}.zip" index.mjs
cd ..
rm -rf "$DEPLOY_DIR"
echo -e "${GREEN}✓ Deployment package created: ${FUNCTION_NAME}.zip${NC}"

# Step 3: Check if function exists
echo -e "${YELLOW}Step 3: Checking for existing function...${NC}"
FUNCTION_EXISTS=$(aws lambda list-functions --region "$REGION" --query "Functions[?FunctionName=='${FUNCTION_NAME}'].FunctionName" --output text 2>/dev/null || echo "")

if [ "$FUNCTION_EXISTS" = "$FUNCTION_NAME" ]; then
    echo -e "${YELLOW}Function exists, updating...${NC}"
    
    # Update existing function
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://${FUNCTION_NAME}.zip" \
        --region "$REGION" \
        --no-cli-pager
    
    echo -e "${GREEN}✓ Function code updated${NC}"
    
    # Wait for update to complete
    echo -e "${YELLOW}Waiting for update to complete...${NC}"
    aws lambda wait function-updated \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION"
else
    echo -e "${YELLOW}Creating new function...${NC}"
    
    # Create new function
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs20.x \
        --role "$LAMBDA_ROLE" \
        --handler index.handler \
        --zip-file "fileb://${FUNCTION_NAME}.zip" \
        --timeout 30 \
        --memory-size 512 \
        --region "$REGION" \
        --no-cli-pager
    
    echo -e "${GREEN}✓ Function created${NC}"
fi

# Step 4: Create or update API Gateway
echo -e "${YELLOW}Step 4: Setting up API Gateway...${NC}"
API_NAME="${FUNCTION_NAME}-api"

# Check if API exists
API_ID=$(aws apigatewayv2 get-apis --region "$REGION" --query "Items[?Name=='${API_NAME}'].ApiId" --output text 2>/dev/null || echo "")

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
    # Create HTTP API
    API_ID=$(aws apigatewayv2 create-api \
        --name "$API_NAME" \
        --protocol-type HTTP \
        --region "$REGION" \
        --query ApiId --output text)
    
    echo -e "${GREEN}✓ API created: ${API_ID}${NC}"
else
    echo -e "${GREEN}✓ API exists: ${API_ID}${NC}"
fi

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}" \
    --payload-format-version 2.0 \
    --region "$REGION" \
    --query IntegrationId --output text 2>/dev/null || echo "")

if [ -n "$INTEGRATION_ID" ] && [ "$INTEGRATION_ID" != "None" ]; then
    echo -e "${GREEN}✓ Integration created: ${INTEGRATION_ID}${NC}"
    
    # Create route
    aws apigatewayv2 create-route \
        --api-id "$API_ID" \
        --route-key 'POST /autofix' \
        --target "integrations/${INTEGRATION_ID}" \
        --region "$REGION" \
        --no-cli-pager 2>/dev/null || true
    
    echo -e "${GREEN}✓ Route created${NC}"
    
    # Create stage
    aws apigatewayv2 create-stage \
        --api-id "$API_ID" \
        --stage-name prod \
        --auto-deploy \
        --region "$REGION" \
        --no-cli-pager 2>/dev/null || true
    
    echo -e "${GREEN}✓ Stage created${NC}"
fi

# Step 5: Add Lambda permissions
echo -e "${YELLOW}Step 5: Adding Lambda permissions...${NC}"
aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/POST/autofix" \
    --statement-id apigw-autofix-invoke \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || true

echo -e "${GREEN}✓ Permissions added${NC}"

# Cleanup
rm -f "${FUNCTION_NAME}.zip"

# Output
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "API Endpoint: ${BLUE}https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/autofix${NC}"
echo ""
echo -e "Set this environment variable for your tests:"
echo -e "${YELLOW}export PLAYWRIGHT_AUTOFIX_ENDPOINT=\"https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/autofix\"${NC}"
echo ""
echo -e "Or add to your .env file:"
echo -e "${YELLOW}PLAYWRIGHT_AUTOFIX_ENDPOINT=https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod/autofix${NC}"
echo ""