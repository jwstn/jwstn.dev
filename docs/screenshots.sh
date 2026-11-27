#!/usr/bin/env bash
# Screenshot the single-theme site. Requires the dev server on :4321.
set -euo pipefail

BASE="${BASE:-http://localhost:4321}"
OUT="docs/screenshots"
mkdir -p "$OUT"

ROUTES=(
  "home|"
  "projects|projects"
  "project|projects/spotui"
  "blog|blog"
  "gallery|gallery"
  "album|gallery/spring-2026"
  "music|music"
)

for entry in "${ROUTES[@]}"; do
  name="${entry%%|*}"
  path="${entry##*|}"
  url="$BASE/${path}"

  pnpm --silent dlx playwright@latest screenshot \
    --viewport-size=1440,900 --full-page --wait-for-timeout=2500 \
    "$url" "$OUT/$name-desktop.png" >/dev/null 2>&1
  echo "done $name-desktop"

  pnpm --silent dlx playwright@latest screenshot \
    --viewport-size=375,812 --full-page --wait-for-timeout=2500 \
    "$url" "$OUT/$name-mobile.png" >/dev/null 2>&1
  echo "done $name-mobile"
done

pnpm --silent dlx playwright@latest screenshot \
  --viewport-size=1440,900 --full-page --color-scheme=dark --wait-for-timeout=2500 \
  "$BASE/" "$OUT/home-dark.png" >/dev/null 2>&1
echo "done home-dark"
echo "ALL DONE"
