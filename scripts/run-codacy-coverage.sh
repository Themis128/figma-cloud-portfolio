#!/bin/bash

# Codacy Coverage Reporter Script
# Sets up environment variables and runs the Codacy coverage reporter

echo "🚀 Running Codacy Coverage Reporter"
echo "====================================="

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

# Download and run the Codacy coverage reporter
echo "🔄 Downloading and running Codacy coverage reporter..."
echo ""

# Run the Codacy coverage reporter script
bash <(curl -Ls https://coverage.codacy.com/get.sh)

echo ""
echo "🎉 Codacy Coverage Reporter execution completed!"