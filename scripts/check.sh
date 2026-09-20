#!/usr/bin/env bash
# Required docs exist and internal links resolve. Extended per part as each one lands —
# see AGENTS.md non-negotiable 2: upstream quotes get a freshness check, not a promise.
set -euo pipefail
ROOT=${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}
cd "$ROOT"

fail=0
note() { echo "  ✗ $*" >&2; fail=1; }

for f in README.md AGENTS.md; do
  [ -f "$f" ] || note "missing required document: $f"
done

while IFS= read -r -d '' md; do
  while read -r target; do
    case "$target" in http://*|https://*|mailto:*|\#*|'') continue;; esac
    [ -e "$(dirname "$md")/${target%%#*}" ] || note "broken internal link in ${md#./}: $target"
  done < <(grep -oE '\]\([^)]+\)' "$md" | sed -E 's/^\]\(|\)$//g')
done < <(find . -name '*.md' -not -path './.git/*' -print0)

[ "$fail" -eq 0 ] || { echo "check failed" >&2; exit 1; }
echo "check passed"
