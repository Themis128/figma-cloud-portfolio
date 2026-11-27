#!/bin/bash
# Fetch gh-aw Gemini pool keys from self-hosted Infisical and print
# "KEY=value" lines on stdout (eval-ready; nothing touches disk).
#
# Usage from Git-bash (no plaintext file persisted):
#   eval "$(wsl -e bash -lc 'bash /mnt/c/Users/tbaltzakis/figma-cloud-portfolio/.devin/skills/gh-aw-ops/scripts/fetch_keys.sh')"
#
# Requires: docker `infisical` container up on omv/WSL, UA creds in
# ~/.config/secrets/infisical (INFISICAL_UA_CLIENT_ID / _SECRET).
set -euo pipefail

WORKSPACE="27660119-de58-4d8b-adaf-a39c8fc8c79e"
API="http://localhost:8080"   # inside-container port
CREDS="$HOME/.config/secrets/infisical"
KEYS=(GEMINI_API_KEY GEMINI_API_KEY_2)

CID=$(grep INFISICAL_UA_CLIENT_ID "$CREDS" | cut -d= -f2 | tr -d '\r\n')
CSEC=$(grep INFISICAL_UA_CLIENT_SECRET "$CREDS" | cut -d= -f2 | tr -d '\r\n')
TOK=$(docker exec infisical wget -qO- \
  --post-data "{\"clientId\":\"$CID\",\"clientSecret\":\"$CSEC\"}" \
  --header 'Content-Type: application/json' \
  "$API/api/v1/auth/universal-auth/login" \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
[ -n "$TOK" ] || { echo "auth failed" >&2; exit 1; }

for K in "${KEYS[@]}"; do
  docker exec infisical wget -qO- \
    --header "Authorization: Bearer $TOK" \
    "$API/api/v3/secrets/raw/$K?workspaceId=$WORKSPACE&environment=prod&secretPath=/" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('$K=' + d['secret']['secretValue'])"
done
