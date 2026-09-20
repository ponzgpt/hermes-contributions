#!/bin/sh
# The one runnable check.
#
# Everything in ./0th is either a shell-out to Hermes or a decision about which
# step comes next. The shell-outs are Hermes' problem. The decisions are mine,
# and the one that can silently go wrong is `provider_set` — it greps YAML
# instead of parsing it, so it could easily match a `provider:` belonging to
# some other top-level key and tell a stuck user they are finished.
#
# This drives ./0th against synthetic HERMES_HOME directories and asserts the
# advice it gives. No framework, no fixtures.
#
#   ./check.sh

set -eu
cd "$(dirname "$0")"

pass=0; fail=0
ok()   { pass=$((pass+1)); printf '  ok    %s\n' "$1"; }
bad()  { fail=$((fail+1)); printf '  FAIL  %s\n' "$1"; printf '        %s\n' "$2"; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# A fake `hermes` on PATH, so we exercise the branches that need it installed.
mkdir -p "$tmp/bin"
cat > "$tmp/bin/hermes" <<'EOF'
#!/bin/sh
[ "${1:-}" = "gateway" ] && exit 1   # "no gateway running"
exit 0
EOF
chmod +x "$tmp/bin/hermes"
export PATH="$tmp/bin:$PATH"

# ── expects <name> <home-dir> <substring that must appear> ───────────────────
expects() {
  name=$1; home=$2; want=$3
  out=$(HERMES_HOME="$home" NO_COLOR=1 sh ./0th next 2>&1) || true
  case "$out" in
    *"$want"*) ok "$name" ;;
    *) bad "$name" "expected to see: $want" ;;
  esac
}

# ── expects_not <name> <home-dir> <substring that must NOT appear> ───────────
expects_not() {
  name=$1; home=$2; unwanted=$3
  out=$(HERMES_HOME="$home" NO_COLOR=1 sh ./0th next 2>&1) || true
  case "$out" in
    *"$unwanted"*) bad "$name" "should not have said: $unwanted" ;;
    *) ok "$name" ;;
  esac
}

printf '\n0TH Hermes — state machine\n'

# 1. installed, but nothing configured
a="$tmp/a"; mkdir -p "$a/hermes-agent"
expects "no config      → tells you to run setup" "$a" "hermes setup"

# 2. config exists but no provider chosen: the stuck-user case
b="$tmp/b"; mkdir -p "$b/hermes-agent"
cat > "$b/config.yaml" <<'EOF'
model:
  default: some-model
tools:
  web: true
EOF
expects "config, no provider → tells you to run hermes model" "$b" "hermes model"

# 3. fully configured
c="$tmp/c"; mkdir -p "$c/hermes-agent"
cat > "$c/config.yaml" <<'EOF'
model:
  default: Hermes-4-405B
  provider: nous-portal
EOF
expects "provider set   → tells you to prove it with a chat" "$c" "Prove it works"

# 4. the trap: a `provider:` that belongs to something else entirely.
#    If the grep is naive this reports "you're done" to a user who is not.
d="$tmp/d"; mkdir -p "$d/hermes-agent"
cat > "$d/config.yaml" <<'EOF'
model:
  default: some-model
memory:
  provider: sqlite
secrets:
  provider: bitwarden
EOF
expects     "foreign provider key → still asks for a model provider" "$d" "hermes model"
expects_not "foreign provider key → does not claim you are finished" "$d" "Prove it works"

# 5. indentation the wizard actually writes (two spaces) and a tab, both count
e="$tmp/e"; mkdir -p "$e/hermes-agent"
printf 'model:\n\tprovider: openrouter\n' > "$e/config.yaml"
expects "tab-indented provider → recognised" "$e" "Prove it works"

# 6. an empty provider value is not a provider
f="$tmp/f"; mkdir -p "$f/hermes-agent"
printf 'model:\n  provider:\n' > "$f/config.yaml"
expects "empty provider value → still asks for one" "$f" "hermes model"

# ── the installer is never reimplemented ────────────────────────────────────
printf '\nContract\n'
# shellcheck disable=SC2016  # literal search string: $INSTALL_URL must not expand
if grep -q 'curl -fsSL "$INSTALL_URL" | bash' ./0th; then
  ok "install shells out to the official installer"
else
  bad "install shells out to the official installer" "the curl | bash line changed"
fi
if [ "$(grep -c 'apt install\|brew install' ./0th)" -le 4 ]; then
  ok "no package manager orchestration beyond advice"
else
  bad "no package manager orchestration beyond advice" "this script started installing things itself"
fi

# ── every documented subcommand exists ──────────────────────────────────────
for c in next check install doctor local help; do
  if grep -q "^  $c" ./0th || grep -q "^  $c|" ./0th; then
    ok "subcommand: $c"
  else
    bad "subcommand: $c" "documented in help but not in the dispatch case"
  fi
done

printf '\n%s passed, %s failed\n\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
