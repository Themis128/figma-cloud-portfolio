#!/usr/bin/env bash
# Generate announcements.json from recent git commits (feat/fix/refactor/perf).
# Runs at build time as part of `pnpm build`.
# Output: public/announcements.json

OUT="public/announcements.json"
MAX_ITEMS=10

# Get recent feat/fix/refactor/perf commits from the last 30 days
COMMITS=$(git log \
  --since="30 days ago" \
  --format='{"hash":"%h","date":"%aI","subject":"%s"}' \
  --no-merges \
  -- ':(exclude)*.lock.yml' ':(exclude)pnpm-lock.yaml' \
  | grep -iE '"subject":"(feat|fix|refactor|perf)' \
  | head -n "$MAX_ITEMS" || true)

if [ -z "$COMMITS" ]; then
  echo "[]" > "$OUT"
  echo "No announcements to generate"
  exit 0
fi

echo "$COMMITS" | node -e "
  const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\n').filter(Boolean);
  const items = lines.map(l => {
    const c = JSON.parse(l);
    const match = c.subject.match(/^(\w+)(?:\(([^)]*)\))?[!]?:\s*(.+)/);
    if (!match) return null;
    const [, type, scope, description] = match;
    const labels = {
      feat: 'New Feature',
      fix: 'Bug Fix',
      refactor: 'Improvement',
      perf: 'Performance',
    };
    const label = labels[type] || type;
    const title = scope ? label + ': ' + scope : label;
    return {
      id: c.date.slice(0,10) + '-' + c.hash,
      title: title,
      description: description.charAt(0).toUpperCase() + description.slice(1),
      date: c.date,
      type: type,
    };
  }).filter(Boolean);
  process.stdout.write(JSON.stringify(items, null, 2) + '\n');
" > "$OUT"

COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$OUT','utf8')).length)")
echo "Generated $COUNT announcements → $OUT"
