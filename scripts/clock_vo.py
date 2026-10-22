#!/usr/bin/env python3
"""Build "The Clock" (Revenue OS, 30s): voiceover, scene timeline and sound cues.

Every scene is one VO line, so picture and voice cannot drift apart. This script is the
single source of truth for timing: it voices each line, lays the lines end to end, and writes

  public/audio/clock-vo.mp3     the voiceover, 30s
  src/Clock/timeline.json       scenes (frames), each line's words (frames), and sound cues

Usage:
  python3 scripts/clock_vo.py                                   # Kokoro am_michael (sandbox)
  python3 scripts/clock_vo.py --engine edge --voice en-IN-PrabhatNeural
"""
import argparse
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
DURATION = 900
MAX_PAUSE = 0.25

# (scene id, line, silence before the line in seconds)
LINES = [
    ("arrive", "A customer is ready to buy.", 0.4),
    ("wait", "Your business makes them wait.", 0.55),
    ("leak", "That's revenue you paid for, going to whoever answers first.", 0.5),
    ("gap", "Every quarter you wait, the gap compounds.", 0.55),
    ("turn", "Revenue OS closes it.", 1.0),  # the held breath before the turn
    ("answered", "Every enquiry answered within minutes. Booked. Followed up.", 0.7),
    ("clicks", "Your team steps in for three clicks.", 0.55),
    ("grown", "Every lead worked. Every customer grown.", 0.9),  # room for the three clicks
    ("weeks", "Live in weeks, on your existing systems.", 0.6),
]
# Spoken over the end card
SIGNOFF = ("signoff", "Start this quarter.")
LEAD_IN = 0.3  # each scene starts this long before its first word (overlapping the last one's fade)
HOLD_END = 3  # a scene ends this many frames before the next line's first word
SIGNOFF_DELAY = 16  # frames into the end card


def voice(text: str, out: Path, args) -> list:
    subprocess.run(
        [sys.executable, str(ROOT / "scripts/tts.py"), text, str(out), "--engine", args.engine, "--voice", args.voice,
         f"--rate={args.rate}", f"--pitch={args.pitch}", f"--max-pause={MAX_PAUSE}"],
        check=True, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
    )
    return json.loads(out.with_suffix(".words.json").read_text())


def frame(t: float) -> int:
    return math.ceil(t * FPS)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--engine", default="kokoro")
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--rate", default="+5%")
    ap.add_argument("--pitch", default="-2Hz")
    args = ap.parse_args()

    scenes, clips = [], []
    with tempfile.TemporaryDirectory() as tmp:
        t = 0.0
        for i, (sid, text, before) in enumerate(LINES):
            clip = Path(tmp) / f"{sid}.mp3"
            timed = voice(text, clip, args)
            t += before
            start = t - timed[0]["start"]  # the first word lands at t
            display = text.split()
            assert len(display) == len(timed), f"{sid}: {len(display)} tokens vs {len(timed)} timed words"
            words = [{"text": d, "frame": frame(start + w["start"]), "end": frame(start + w["end"])} for d, w in zip(display, timed)]
            scenes.append({"id": sid, "start": frame(t - LEAD_IN), "words": words})
            clips.append((clip, start))
            t = start + timed[-1]["end"]

        vo_end = t
        end_card = frame(vo_end + 0.7)
        for a, b in zip(scenes, scenes[1:]):
            a["end"] = b["words"][0]["frame"] - HOLD_END
        scenes[-1]["end"] = end_card + 6

        sid, text = SIGNOFF
        clip = Path(tmp) / "signoff.mp3"
        timed = voice(text, clip, args)
        start = (end_card + SIGNOFF_DELAY) / FPS - timed[0]["start"]
        signoff = [{"text": d, "frame": frame(start + w["start"]), "end": frame(start + w["end"])} for d, w in zip(text.split(), timed)]
        clips.append((clip, start))
        if frame(start + timed[-1]["end"]) > DURATION - 20:
            print(f"WARNING: sign-off ends at {start + timed[-1]['end']:.2f}s, past the end")

        inputs, chains = [], []
        for i, (clip, s) in enumerate(clips):
            inputs += ["-i", str(clip)]
            ms = int(s * 1000)
            chains.append(f"[{i}:a]aresample=44100,adelay={ms}|{ms}[a{i}]")
        chains.append("".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0,apad=whole_dur=30,atrim=0:30[out]")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(chains),
                        "-map", "[out]", "-b:a", "192k", str(ROOT / "public/audio/clock-vo.mp3")], check=True)

    by = {s["id"]: s for s in scenes}
    word = lambda sid, w: next(x for x in by[sid]["words"] if x["text"].strip(".,").lower() == w)

    # Clock ticks under "wait": the gaps shrink from 9 to 2 frames as the timer accelerates
    ticks, f, gap = [], by["wait"]["start"] + 6, 9.0
    while f < by["wait"]["end"] - 2:
        ticks.append(round(f))
        f += gap
        gap = max(2.0, gap * 0.86)
    clicks_at = word("clicks", "three")["frame"]
    cues = {
        "ping": by["arrive"]["start"] + 4,
        "ticks": ticks,
        "fieldIn": by["leak"]["start"] + 4,
        "leakGo": word("leak", "going")["frame"] - 2,
        "chart": by["gap"]["start"] + 6,
        "collapse": by["turn"]["start"] - 20,  # the gap closes in the silence before the line
        "sweep": by["turn"]["start"] - 2,
        "timerStop": word("answered", "minutes")["end"],
        "clicks": [clicks_at, clicks_at + 9, clicks_at + 18],
        "fieldBack": by["grown"]["start"] + 2,
        "stackDrop": by["weeks"]["start"] + 8,
        "endCard": end_card,
        "logo": end_card + 2,
        "cta": signoff[-1]["end"] + 4,
        "proof": signoff[-1]["end"] + 14,
    }
    out = {"fps": FPS, "duration": DURATION, "scenes": scenes, "signoff": signoff, "cues": cues}
    path = ROOT / "src/Clock/timeline.json"
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(out, indent=1))
    for s in scenes:
        print(f"{s['id']:9s} {s['start'] / FPS:5.2f}-{s['end'] / FPS:5.2f}s  ({s['end'] - s['start']}f)")
    print(f"VO ends {vo_end:.2f}s; end card {end_card / FPS:.2f}s ({DURATION - end_card}f)")
    if end_card > DURATION - 90:
        print("WARNING: the end card is under 3s; tighten the script")


if __name__ == "__main__":
    main()
