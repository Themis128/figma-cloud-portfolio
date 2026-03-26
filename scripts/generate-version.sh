#!/usr/bin/env bash
# Generate version.json with the current git commit hash and build timestamp.
# This file is fetched by PWAUpdateNotification to detect new deployments.

set -euo pipefail

COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > public/version.json << EOF
{
  "commit": "${COMMIT}",
  "buildTime": "${TIMESTAMP}"
}
EOF

echo "Generated public/version.json (commit: ${COMMIT}, built: ${TIMESTAMP})"
