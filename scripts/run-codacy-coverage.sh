#!/bin/bash

# Codacy Coverage Reporter Script
# Sets up environment variables and runs the Codacy coverage reporter

echo "🚀 Running Codacy Coverage Reporter"
echo "====================================="

# Codacy environment variables must be provided by CI or local env
echo "📋 Using Codacy environment variables (do not hard-code tokens in scripts)"
for v in CODACY_API_TOKEN CODACY_PROJECT_TOKEN CODACY_ORGANIZATION_PROVIDER CODACY_USERNAME CODACY_PROJECT_NAME; do
    if [ -z "${!v}" ]; then
        echo "  ⚠️  $v: NOT SET"
    else
        echo "  ✅ $v: set"
    fi
done
echo ""

# Verify environment variables are set
if [ -z "$CODACY_API_TOKEN" ] && [ -z "$CODACY_PROJECT_TOKEN" ]; then
    echo "❌ Error: Neither CODACY_API_TOKEN nor CODACY_PROJECT_TOKEN is set!"
    exit 1
fi

echo "✅ Environment variables verified"
echo ""

# Download and run the Codacy coverage reporter
echo "🔄 Downloading and running Codacy coverage reporter..."
echo ""

# Run the Codacy coverage reporter script
bash <(curl -Ls https://coverage.codacy.com/get.sh)

echo ""
echo "🎉 Codacy Coverage Reporter execution completed!"