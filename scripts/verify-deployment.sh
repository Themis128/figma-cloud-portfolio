#!/bin/bash

# AWS Amplify Deployment Verification Script
# Run this after deployment to verify all features are working

echo "🚀 AWS Amplify Deployment Verification"
echo "======================================"

# Get the deployment URL from user
read -p "Enter your Amplify deployment URL (e.g., https://production.xxxxxx.amplifyapp.com): " BASE_URL

if [ -z "$BASE_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo "🔍 Testing deployment at: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "Testing $description... "

    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ PASS${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ FAIL${NC} (Status: $response, Expected: $expected_status)"
        fi
    else
        echo -e "${YELLOW}⚠️  SKIP${NC} (curl not available)"
    fi
}

echo "📡 Testing API Endpoints:"
echo "------------------------"

# Health check
test_endpoint "$BASE_URL/api/ping" 200 "API Health Check"

# Contact form (GET - should return method not allowed or form)
test_endpoint "$BASE_URL/api/contact" 405 "Contact API (GET)"

# Analytics (GET - should return method not allowed)
test_endpoint "$BASE_URL/api/analytics" 405 "Analytics API (GET)"

# Resume download (GET - should work)
test_endpoint "$BASE_URL/api/resume/download" 200 "Resume Download"

# Push notifications (GET - should return method not allowed)
test_endpoint "$BASE_URL/api/push-notifications" 405 "Push Notifications API (GET)"

# GitHub API (GET - should return method not allowed or auth required)
test_endpoint "$BASE_URL/api/github" 401 "GitHub API (GET)"

echo ""
echo "🌐 Testing Frontend Pages:"
echo "-------------------------"

# Homepage
test_endpoint "$BASE_URL/" 200 "Homepage"

# About page
test_endpoint "$BASE_URL/about" 200 "About Page"

# Projects page
test_endpoint "$BASE_URL/projects" 200 "Projects Page"

# Contact page
test_endpoint "$BASE_URL/contact" 200 "Contact Page"

# Agents page
test_endpoint "$BASE_URL/agents" 200 "AI Agents Page"

echo ""
echo "📱 Testing Static Assets:"
echo "------------------------"

# Service worker
test_endpoint "$BASE_URL/sw.js" 200 "Service Worker"

# Manifest
test_endpoint "$BASE_URL/manifest.webmanifest" 200 "Web App Manifest"

# Favicon
test_endpoint "$BASE_URL/favicon.ico" 200 "Favicon"

# Logo
test_endpoint "$BASE_URL/logo.svg" 200 "Logo SVG"

echo ""
echo "📊 Test Results:"
echo "---------------"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! Deployment successful.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check the deployment logs.${NC}"
    exit 1
fi