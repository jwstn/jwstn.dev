#!/usr/bin/env bash
# Screenshot farm for all themes. Requires the dev server on :4322.
# Usage: bash docs/screenshots.sh [theme ...]   (no args = all themes)
set -euo pipefail

BASE="${BASE:-http://localhost:4322}"
ALL_THEMES=(classic editorial brutalist terminal neon riso sticker aurora luxe retro-os kinetic isometric claymorphism cybercore scrapbook surrealism y2k pixel synthwave neumorphism bento maximalism sketch ethereal bohemian victorian wabi-sabi)

if [ $# -gt 0 ]; then
  THEMES=("$@")
else
  THEMES=("${ALL_THEMES[@]}")
fi

declare -A ROUTES
ROUTES[home]=""
ROUTES[projects]="projects"
ROUTES[project]="projects/spotui"
ROUTES[blog]="blog"
ROUTES[gallery]="gallery"
ROUTES[album]="gallery/spring-2026"

for t in "${THEMES[@]}"; do
  mkdir -p "docs/screenshots/$t"
  for name in home projects project blog gallery album; do
    path="${ROUTES[$name]}"
    url="$BASE/${path}?theme=$t"
    [[ -z "$path" ]] && url="$BASE/?theme=$t"

    pnpm --silent dlx playwright@latest screenshot \
      --viewport-size=1440,900 --full-page --wait-for-timeout=3000 \
      "$url" "docs/screenshots/$t/$name-desktop.png" >/dev/null 2>&1
    echo "done $t/$name-desktop"

    pnpm --silent dlx playwright@latest screenshot \
      --viewport-size=375,812 --full-page --wait-for-timeout=3000 \
      "$url" "docs/screenshots/$t/$name-mobile.png" >/dev/null 2>&1
    echo "done $t/$name-mobile"
  done

  pnpm --silent dlx playwright@latest screenshot \
    --viewport-size=1440,900 --full-page --color-scheme=dark --wait-for-timeout=3000 \
    "$BASE/?theme=$t" "docs/screenshots/$t/home-dark.png" >/dev/null 2>&1
  echo "done $t/home-dark"
done

montage docs/screenshots/*/home-desktop.png -tile 4x -geometry 480x320+10+10 -background '#111' -label '%d' docs/screenshots/_overview.png
echo "ALL DONE"
