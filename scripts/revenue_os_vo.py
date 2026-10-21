#!/usr/bin/env python3
"""Build the Revenue OS 30s voiceover: three lines (the cost, us, the close), placed on the timeline, one word file.

Usage:
  python3 scripts/revenue_os_vo.py                       # Kokoro am_michael (sandbox default)
  python3 scripts/revenue_os_vo.py --engine edge --voice en-IN-PrabhatNeural   # the brief's voice

Writes public/audio/revenue-os-vo.mp3 (30s) and public/audio/words.json:
  [{vo, text, display, start_ms, end_ms, frame}], times absolute and including leading
  silence; `frame` is the first frame at or after the word's sound.
"""
import argparse
import json
import math
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
# VO1 (the cost) opens the film; VO2 (us) starts on the turn, 4 frames after the scan line
# (T.scan in src/RevenueOS/timeline.ts); VO3 ends before the silent end card at 26.0s.
# Pauses inside a line are capped at MAX_PAUSE.
MAX_PAUSE = 0.25
LINES = [
    "Every unworked lead is revenue you paid for, and lost. Every month you wait, a competitor answers first.",
    "Revenue OS works every lead within minutes, books the visit, and grows the customer, on the systems you already run. Live in weeks.",
    "Your CRM records what happened. Revenue OS makes it happen. Starting this quarter.",
]
VO1_START = 0.4
VO3_END = 25.8


def scan_frame() -> int:
    src = (ROOT / "src/RevenueOS/timeline.ts").read_text()
    return int(re.search(r"\bscan:\s*(\d+)", src).group(1))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--engine", default="kokoro")
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--rate", default="-8%")
    ap.add_argument("--pitch", default="-2Hz")
    args = ap.parse_args()

    words = []
    with tempfile.TemporaryDirectory() as tmp:
        timed_lines, clips = [], []
        for vo, text in enumerate(LINES, 1):
            clip = Path(tmp) / f"vo{vo}.mp3"
            subprocess.run(
                [sys.executable, str(ROOT / "scripts/tts.py"), text, str(clip), "--engine", args.engine,
                 "--voice", args.voice, f"--rate={args.rate}", f"--pitch={args.pitch}", f"--max-pause={MAX_PAUSE}"],
                check=True,
            )
            timed_lines.append((clip, json.loads(clip.with_suffix(".words.json").read_text())))

        e1 = VO1_START + timed_lines[0][1][-1]["end"]
        s2 = (scan_frame() + 4) / FPS - timed_lines[1][1][0]["start"]
        e2 = s2 + timed_lines[1][1][-1]["end"]
        s3 = VO3_END - timed_lines[2][1][-1]["end"]
        starts = [VO1_START, round(s2, 2), round(s3, 2)]
        print(f"VO starts {starts}; VO1 ends {e1:.2f}s, VO2 ends {e2:.2f}s")
        if s2 + timed_lines[1][1][0]["start"] < e1 + 0.2 or s3 < e2 + 0.5:
            print("WARNING: VO lines too close; move T.scan or shorten a line")

        for vo, ((clip, timed), start, text) in enumerate(zip(timed_lines, starts, LINES), 1):
            display = text.split()
            assert len(display) == len(timed), f"VO{vo}: {len(display)} tokens vs {len(timed)} timed words"
            for shown, w in zip(display, timed):
                a, b = w["start"] + start, w["end"] + start
                words.append({"vo": vo, "text": w["text"], "display": shown, "start_ms": round(a * 1000),
                              "end_ms": round(b * 1000), "frame": math.ceil(a * FPS)})
            clips.append((clip, start))

        inputs, chains = [], []
        for i, (clip, start) in enumerate(clips):
            inputs += ["-i", str(clip)]
            ms = int(start * 1000)
            chains.append(f"[{i}:a]aresample=44100,adelay={ms}|{ms}[a{i}]")
        chains.append("".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0,apad=whole_dur=30,atrim=0:30[out]")
        out = ROOT / "public/audio/revenue-os-vo.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(chains),
                        "-map", "[out]", "-b:a", "192k", str(out)], check=True)

    (ROOT / "public/audio/words.json").write_text(json.dumps(words, indent=2, ensure_ascii=False))
    last = words[-1]["end_ms"]
    print(f"{len(words)} words in {len(LINES)} VO lines; last word ends {last} ms")
    if last > 26000:
        print("WARNING: VO3 runs into the silent end card (26.0s)")


if __name__ == "__main__":
    main()
