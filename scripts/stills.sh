#!/usr/bin/env bash
# Render one still per beat (frames listed in src/RevenueOS/timeline.ts STILLS) to out/stills/.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/stills
B=$(mktemp -d)
npx remotion bundle src/index.ts --out-dir "$B" >/dev/null
node -e '
const src = require("fs").readFileSync("src/RevenueOS/timeline.ts", "utf8");
const block = src.slice(src.indexOf("STILLS"));
for (const m of block.matchAll(/\["([^"]+)",\s*(\d+)\]/g)) console.log(m[1], m[2]);
' | while read -r name frame; do
  npx remotion still "$B" RevenueOS30 "out/stills/$name.png" --frame="$frame" --log=error
  echo "out/stills/$name.png  (frame $frame)"
done
rm -rf "$B"
