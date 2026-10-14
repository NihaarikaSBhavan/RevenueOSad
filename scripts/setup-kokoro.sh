#!/usr/bin/env bash
# Install Kokoro (free, local, Apache 2.0) and download its model files (~350 MB).
set -euo pipefail
cd "$(dirname "$0")/.."
pip install -U kokoro-onnx soundfile
mkdir -p models/kokoro
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "models/kokoro/$f" ] || curl -fL --retry 3 -o "models/kokoro/$f" "$base/$f"
done
echo "Kokoro ready: models/kokoro/"
