#!/usr/bin/env bash
# Dev environment startup dashboard.
# Runs as predev:all hook to show system status before servers start.

SANDBOX_API="oeaimykf5vg3dj3d7wvumx5lhy"
PRODUCTION_API="xwonpbkzc5ab5fqyfx53spkh7u"
OUTPUTS="amplify_outputs.json"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Header ────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}  baltzakisthemis.com — Dev Environment${NC}"
echo -e "${DIM}  ════════════════════════════════════════════${NC}"

# ─── System Info ───────────────────────────────────────
NODE_VER=$(node -v 2>/dev/null || echo "not found")
PNPM_VER=$(pnpm -v 2>/dev/null || echo "not found")
PYTHON_VER=$(python3 --version 2>/dev/null | awk '{print $2}' || echo "not found")
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
GIT_COMMIT=$(git log -1 --format='%h %s' 2>/dev/null || echo "unknown")

echo -e ""
echo -e "  ${BOLD}Runtime${NC}"
echo -e "  ${DIM}────────────────────────────────────────────${NC}"
echo -e "  Node:       ${GREEN}${NODE_VER}${NC}  ${DIM}│${NC}  pnpm: ${GREEN}${PNPM_VER}${NC}  ${DIM}│${NC}  Python: ${GREEN}${PYTHON_VER}${NC}"
echo -e "  Branch:     ${CYAN}${GIT_BRANCH}${NC}"
echo -e "  Commit:     ${DIM}${GIT_COMMIT}${NC}"

# ─── Environment ──────────────────────────────────────
echo -e ""
echo -e "  ${BOLD}Environment${NC}"
echo -e "  ${DIM}────────────────────────────────────────────${NC}"

if [ -f ".env.local" ]; then
  ENV_COUNT=$(grep -c -v '^\s*#\|^\s*$' .env.local 2>/dev/null || echo 0)
  echo -e "  .env.local: ${GREEN}${ENV_COUNT} vars loaded${NC}"
else
  echo -e "  .env.local: ${RED}not found${NC}"
fi

# ─── Port Cleanup ─────────────────────────────────────
PORTS=(3000 3001)
KILLED=()
for port in "${PORTS[@]}"; do
  pids=$(lsof -ti :"$port" -sTCP:LISTEN 2>/dev/null)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill 2>/dev/null
    KILLED+=("$port")
  fi
done
# Remove stale Next.js lock file
rm -f .next/dev/lock

if [ ${#KILLED[@]} -gt 0 ]; then
  echo -e "  ${YELLOW}⚠ Killed stale processes on port(s): ${KILLED[*]}${NC}"
  echo -e ""
fi

# ─── Services ──────────────────────────────────────────
echo -e ""
echo -e "  ${BOLD}Services${NC}"
echo -e "  ${DIM}────────────────────────────────────────────${NC}"
echo -e "  Next.js:    ${CYAN}http://localhost:3000${NC}  ${DIM}(Turbopack)${NC}"
echo -e "  Express:    ${CYAN}http://localhost:3001${NC}  ${DIM}(API + Bedrock chatbot)${NC}"

# ─── Amplify Backend ──────────────────────────────────
echo -e ""
echo -e "  ${BOLD}Amplify Backend${NC}"
echo -e "  ${DIM}────────────────────────────────────────────${NC}"

if pgrep -f "ampx sandbox" > /dev/null 2>&1; then
  echo -e "  Sandbox:    ${GREEN}● running${NC}"
  SANDBOX_RUNNING=true
else
  echo -e "  Sandbox:    ${RED}○ not running${NC}  ${DIM}(start with: pnpm amplify:dev)${NC}"
  SANDBOX_RUNNING=false
fi

if [ -f "$OUTPUTS" ]; then
  API_URL=$(grep '"url"' "$OUTPUTS" 2>/dev/null | head -1 | sed 's/.*"url": *"//;s/".*//')
  USER_POOL=$(grep '"user_pool_id"' "$OUTPUTS" 2>/dev/null | head -1 | sed 's/.*"user_pool_id": *"//;s/".*//')

  if [ -z "$API_URL" ]; then
    echo -e "  Connected:  ${GREEN}● auth only${NC}  ${DIM}(no AppSync API)${NC}"
  elif echo "$API_URL" | grep -q "$SANDBOX_API"; then
    echo -e "  Connected:  ${GREEN}● sandbox${NC}  ${DIM}(${SANDBOX_API})${NC}"
  elif echo "$API_URL" | grep -q "$PRODUCTION_API"; then
    echo -e "  Connected:  ${YELLOW}▲ PRODUCTION${NC}  ${DIM}(${PRODUCTION_API})${NC}"
    if [ "$SANDBOX_RUNNING" = true ]; then
      echo -e "  ${YELLOW}  ⚠ Sandbox running but config points to production!${NC}"
      echo -e "  ${DIM}    Fix: touch amplify/backend.ts${NC}"
    fi
  else
    echo -e "  Connected:  ${RED}? unknown${NC}  ${DIM}(${API_URL})${NC}"
  fi

  if [ -n "$USER_POOL" ]; then
    echo -e "  Cognito:    ${DIM}${USER_POOL}${NC}"
  fi
else
  echo -e "  Config:     ${RED}✗ amplify_outputs.json missing${NC}"
  echo -e "  ${DIM}              Run: pnpm amplify:dev${NC}"
fi

# ─── Production ────────────────────────────────────────
echo -e ""
echo -e "  ${BOLD}Production${NC}"
echo -e "  ${DIM}────────────────────────────────────────────${NC}"
echo -e "  App:        ${DIM}d1zjif7pi1h3om (us-east-1)${NC}"
echo -e "  Domain:     ${CYAN}https://www.baltzakisthemis.com${NC}"
echo -e "  API:        ${DIM}${PRODUCTION_API}${NC}"

echo -e ""
echo -e "  ${DIM}════════════════════════════════════════════${NC}"
echo ""
