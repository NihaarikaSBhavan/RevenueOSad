#!/usr/bin/env python3
"""Generate a voice line with edge-tts and save word-boundary timestamps.

Usage:
  python3 scripts/tts.py "Your line here" public/audio/name.mp3 [--voice en-US-AriaNeural] [--rate +0%]

Writes <name>.mp3 and <name>.words.json ([{text, start, end}] in seconds).

--offline uses espeak-ng instead (for networks that block the edge-tts
WebSocket); word timings are then estimated from character length.
"""
import argparse
import asyncio
import json
import subprocess
import tempfile
from pathlib import Path

import edge_tts

TICKS_PER_SECOND = 10_000_000


def offline_tts(text: str, out: Path) -> list:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "voice.wav"
        subprocess.run(["espeak-ng", "-v", "en-us", "-s", "160", "-w", str(wav), text], check=True)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ar", "44100", str(out)],
            check=True,
        )
    duration = float(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(out)],
            check=True, capture_output=True, text=True,
        ).stdout
    )
    tokens = text.split()
    total = sum(len(t) + 1 for t in tokens)
    words, cursor = [], 0.0
    for t in tokens:
        span = duration * (len(t) + 1) / total
        words.append({"text": t.strip(".,!?;:"), "start": round(cursor, 3), "end": round(cursor + span, 3)})
        cursor += span
    return words


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("text")
    ap.add_argument("out")
    ap.add_argument("--voice", default="en-US-AriaNeural")
    ap.add_argument("--rate", default="+0%")
    ap.add_argument("--offline", action="store_true")
    args = ap.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    words_path = out.with_suffix(".words.json")
    if args.offline:
        words = offline_tts(args.text, out)
        words_path.write_text(json.dumps(words, indent=2))
        print(f"wrote {out} and {words_path} ({len(words)} words, estimated timings)")
        return

    words = []
    communicate = edge_tts.Communicate(
        args.text, args.voice, rate=args.rate, boundary="WordBoundary"
    )
    with out.open("wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                words.append(
                    {
                        "text": chunk["text"],
                        "start": round(start, 3),
                        "end": round(start + chunk["duration"] / TICKS_PER_SECOND, 3),
                    }
                )

    words_path.write_text(json.dumps(words, indent=2))
    print(f"wrote {out} and {words_path} ({len(words)} words)")


if __name__ == "__main__":
    asyncio.run(main())
