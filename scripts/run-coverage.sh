#!/bin/bash

# Comprehensive Coverage Reporter for Codacy
# Combines Vitest and Playwright coverage reports

echo "🚀 Running Comprehensive Coverage Analysis"
echo "==========================================="

# Set Codacy environment variables
export CODACY_API_TOKEN="mJb73g9iJzu51wQ6JRC"
export CODACY_PROJECT_TOKEN="a88486da551443bf83db6d40385e4085"
export CODACY_ORGANIZATION_PROVIDER="gh"
export CODACY_USERNAME="Themis128"
export CODACY_PROJECT_NAME="figma-cloud-portfolio"

echo "📋 Environment variables set:"
echo "  CODACY_API_TOKEN: ${CODACY_API_TOKEN}"
echo "  CODACY_PROJECT_TOKEN: ${CODACY_PROJECT_TOKEN}"
echo "  CODACY_ORGANIZATION_PROVIDER: ${CODACY_ORGANIZATION_PROVIDER}"
echo "  CODACY_USERNAME: ${CODACY_USERNAME}"
echo "  CODACY_PROJECT_NAME: ${CODACY_PROJECT_NAME}"
echo ""

# Verify environment variables are set
if [ -z "$CODACY_API_TOKEN" ] && [ -z "$CODACY_PROJECT_TOKEN" ]; then
    echo "❌ Error: Neither CODACY_API_TOKEN nor CODACY_PROJECT_TOKEN is set!"
    exit 1
fi

echo "✅ Environment variables verified"
echo ""

# Function to run tests with coverage
run_vitest_coverage() {
    echo "🧪 Running Vitest with coverage..."

    # Clean up old coverage files first
    rm -rf coverage/

    if command -v pnpm >/dev/null 2>&1; then
        pnpm test:unit --coverage
        TEST_EXIT_CODE=$?
    else
        npm run test:unit -- --coverage
        TEST_EXIT_CODE=$?
    fi

    if [ $TEST_EXIT_CODE -eq 0 ] && [ -f "coverage/vitest/lcov.info" ]; then
        echo "✅ Vitest coverage report generated successfully"
        return 0
    elif [ $TEST_EXIT_CODE -ne 0 ]; then
        echo "❌ Vitest failed with exit code: $TEST_EXIT_CODE"
        return $TEST_EXIT_CODE
    else
        echo "⚠️  Vitest completed but coverage report not found"
        return 1
    fi
}

run_playwright_coverage() {
    echo "🎭 Running Playwright with coverage..."
    # Note: Playwright doesn't generate LCOV directly
    # This would require additional setup with istanbul or similar
    echo "ℹ️  Playwright coverage requires additional configuration"
    return 0
}

# Run test suites with coverage
echo "📊 Generating coverage reports..."
echo ""

VITEST_SUCCESS=0
PLAYWRIGHT_SUCCESS=0

run_vitest_coverage
VITEST_SUCCESS=$?

run_playwright_coverage
PLAYWRIGHT_SUCCESS=$?

echo ""

# Check if any coverage reports exist
COVERAGE_EXISTS=0
COVERAGE_FILE=""

if [ -f "coverage/vitest/lcov.info" ]; then
    # Check if the file was modified recently (within last 5 minutes)
    # to ensure it's from this run, not a previous one
    if [ $(find "coverage/vitest/lcov.info" -mmin -5 2>/dev/null | wc -l) -gt 0 ]; then
        echo "📁 Found recent Vitest coverage: coverage/vitest/lcov.info"
        COVERAGE_EXISTS=1
        COVERAGE_FILE="coverage/vitest/lcov.info"
    else
        echo "⚠️  Found old Vitest coverage file (not from this run)"
    fi
fi

if [ "$COVERAGE_EXISTS" -eq 0 ]; then
    echo "❌ No recent coverage reports found to upload"
    echo "💡 Run tests with coverage first:"
    echo "   pnpm test:unit --coverage"
    exit 1
fi

echo ""

# Download and run the Codacy coverage reporter
echo "🔄 Uploading coverage to Codacy..."
echo ""

# Run the Codacy coverage reporter script
bash <(curl -Ls https://coverage.codacy.com/get.sh)

UPLOAD_EXIT_CODE=$?

echo ""
if [ $UPLOAD_EXIT_CODE -eq 0 ]; then
    echo "🎉 Coverage upload completed successfully!"
    echo ""
    echo "📈 View your coverage report at:"
    echo "   https://app.codacy.com/gh/Themis128/figma-cloud-portfolio/coverage"
else
    echo "❌ Coverage upload failed with exit code: $UPLOAD_EXIT_CODE"
    exit $UPLOAD_EXIT_CODE
fi