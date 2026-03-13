#!/usr/bin/env bash
# Setup script for the RAG chatbot with local LLM
# Usage: cd server/bot && bash setup.sh

set -euo pipefail

echo "=== Portfolio RAG Chatbot Setup ==="

# 1. Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# 2. Activate and install dependencies
echo "Installing dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

# 3. Download LLM model (one-time, ~2 GB)
echo "Checking LLM model..."
python download_model.py

# 4. Build the knowledge base index
echo "Building knowledge base index..."
python indexer.py

# 5. Done
echo ""
echo "=== Setup complete ==="
echo "To start the chatbot server:"
echo "  cd server/bot && ./venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8001"
echo ""
echo "Or use: pnpm dev:bot"
echo ""
echo "The server will start on port ${PORT:-8001}"
echo "Health check: http://localhost:${PORT:-8001}/api/health"
echo ""
echo "The chatbot runs FULLY OFFLINE — no internet needed after setup."
