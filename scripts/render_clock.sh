#!/usr/bin/env bash
# Render "The Clock": rebuild the mix, render picture with Remotion, then mux the mastered mix in
# untouched (Remotion's audio path re-levels it), and report loudness.
# Run scripts/clock_vo.py first whenever the script or voice changes.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/clock_sound.py
npx remotion render TheClock30 out/.the-clock-30s.video.mp4 --muted --log=error
ffmpeg -y -loglevel error -i out/.the-clock-30s.video.mp4 -i public/audio/clock-mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart out/the-clock-30s.mp4
rm -f out/.the-clock-30s.video.mp4
ffmpeg -nostats -i out/the-clock-30s.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A14 Summary | grep -E "I:|Peak:"
