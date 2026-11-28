#!/usr/bin/env bash
set -euo pipefail

if [ -f scripts/smoke.mjs ]; then
  BASE="$BASE_URL" node scripts/smoke.mjs
fi

node scripts/deploy-smoke.mjs
