#!/usr/bin/env bash
set -euo pipefail

repo="${1:-$(pwd)}"
cd "$repo/rhwp-studio"

url="${RHWP_URL:-http://127.0.0.1:8765/?agent=1}"
echo "Running rhwp GUI smoke against $url"
RHWP_URL="$url" node e2e/agent-gui-full-smoke.mjs
