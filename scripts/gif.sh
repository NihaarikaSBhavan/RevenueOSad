#!/usr/bin/env bash
# Render a composition to MP4, then to a LinkedIn-ready GIF (two-pass palette, kept under ~5 MB).
# Usage: bash scripts/gif.sh TVAArchitecture out/tva-architecture.gif [fps]
set -euo pipefail
id="$1"
gif="$2"
fps="${3:-12}"
mp4="${gif%.gif}.mp4"
npx remotion render "$id" "$mp4" --crf=12
ffmpeg -v error -y -i "$mp4" \
  -vf "fps=${fps},split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  "$gif"
ls -lh "$gif"
