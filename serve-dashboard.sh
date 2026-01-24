#!/bin/bash
# Script to serve the visual progress dashboard with proper CORS support
# This allows the dashboard to access test result files

echo "🎭 Starting Visual Progress Dashboard Server..."
echo "📊 Dashboard will be available at: http://localhost:8080/visual-progress.html"
echo "🔧 Test results will be accessible at: http://localhost:8080/test-results/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if http-server is installed
if ! command -v http-server &> /dev/null; then
    echo "📦 Installing http-server globally..."
    npm install -g http-server
fi

# Start the server
cd "$(dirname "$0")" || exit 1
http-server . -p 8080 -c-1 --cors
