#!/usr/bin/env bash
# The guide is one HTML file: it must render its title and must never contain a credential.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
grep -q '<title>Hermes Field Guide' index.html || { echo "index.html lost its title" >&2; exit 1; }
if grep -nE '(sk-[A-Za-z0-9_-]{16,}|(api[_-]?key|token|password)\s*[=:]\s*["'"'"'][^"'"'"']{8,})' index.html; then echo "credential-like string in index.html" >&2; exit 1; fi
echo "check passed"
