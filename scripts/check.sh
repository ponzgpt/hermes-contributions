#!/usr/bin/env bash
# The one check. Run before every commit and first thing in the deploy script.
#
# Four repos folded in here, each with its own language and its own check; this
# runs all of them plus the one they were all missing — scripts/freshness.mjs,
# which re-reads what Nous publishes and fails when anything this repo quotes
# has moved. Set SKIP_FRESHNESS=1 only when upstream is genuinely unreachable.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

step() { printf '\n\033[1m── %s\033[0m\n' "$*"; }
fail=0
note() { printf '  ✗ %s\n' "$*" >&2; fail=1; }

step "Node — lint, format, unit tests"
npm run --silent lint
npm run --silent format:check
npm run --silent test

step "Shell — the 0th state machine"
sh -n onboarding/0th
command -v shellcheck >/dev/null && shellcheck -s sh onboarding/0th || echo "  (shellcheck not installed; CI runs it)"
( cd onboarding && ./check.sh )

step "Python — the vault MCP server and its tools"
# The MCP server needs its dependency installed; a venv inside the part keeps it
# off the machine. Created on first run so a fresh clone can just run the check.
VENV=$PWD/pkm-toolkit/.venv
if [ ! -x "$VENV/bin/python" ]; then
  echo "  creating pkm-toolkit/.venv"
  "${PYTHON:-python3}" -m venv "$VENV"
  "$VENV/bin/pip" install -q -r pkm-toolkit/requirements.txt
fi
( cd pkm-toolkit && "$VENV/bin/python" -m unittest discover -s tests -q )

step "Site — it builds, and says what it must say"
npm run --silent build
NOTICE=$(node -e "import('./scripts/notice.mjs').then(m=>process.stdout.write(m.NOTICE))")
for f in dist/index.html dist/onboarding/index.html dist/field-guide/index.html dist/pkm-toolkit/index.html; do
  [ -s "$f" ] || { note "missing or empty: $f"; continue; }
  grep -qF "$NOTICE" "$f" || note "$f does not carry the not-affiliated statement verbatim"
  grep -q '{{' "$f" && note "$f has an unfilled template placeholder"
done
grep -qF "$NOTICE" README.md || note "README.md does not carry the not-affiliated statement verbatim"
[ -s dist/0th ] && cmp -s dist/0th onboarding/0th || note "dist/0th is not the script in onboarding/"

step "Docs — required files, and no broken internal links"
for f in README.md AGENTS.md DEPLOYMENT.md LICENSE upstream.json; do
  [ -f "$f" ] || note "missing required file: $f"
done
[ "$(grep -c '' AGENTS.md)" -le 40 ] || note "AGENTS.md is over 40 lines ($(grep -c '' AGENTS.md))"
while IFS= read -r -d '' md; do
  while read -r target; do
    case "$target" in http://*|https://*|mailto:*|\#*|'') continue;; esac
    [ -e "$(dirname "$md")/${target%%#*}" ] || note "broken internal link in ${md#./}: $target"
  done < <(grep -oE '\]\([^)]+\)' "$md" | sed -E 's/^\]\(|\)$//g')
done < <(find . -name '*.md' -not -path './.git/*' -not -path './node_modules/*' -not -path './dist/*' -not -path '*/.venv/*' -print0)

if [ "${SKIP_FRESHNESS:-}" = 1 ]; then
  step "Upstream freshness — SKIPPED (SKIP_FRESHNESS=1)"
  note "freshness was skipped: do not deploy on this run"
else
  step "Upstream freshness"
  node scripts/freshness.mjs || fail=1
fi

[ "$fail" -eq 0 ] || { printf '\n\033[31mcheck failed\033[0m\n' >&2; exit 1; }
printf '\n\033[32mcheck passed\033[0m\n'
