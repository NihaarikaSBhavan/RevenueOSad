#!/usr/bin/env bash
# Render the Mozhi OS film: voice + mix (scripts/mozhi_audio.py), picture with Remotion, then mux
# the mastered mix in untouched (Remotion's audio path re-levels it), and report loudness.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/mozhi_audio.py
npx remotion render MozhiOS30 out/.mozhi-os-30s.video.mp4 --muted --log=error
ffmpeg -y -loglevel error -i out/.mozhi-os-30s.video.mp4 -i public/audio/mozhi-mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart out/mozhi-os-30s.mp4
rm -f out/.mozhi-os-30s.video.mp4
ffmpeg -nostats -i out/mozhi-os-30s.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|Peak:"
