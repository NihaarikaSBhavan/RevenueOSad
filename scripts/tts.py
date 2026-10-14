#!/usr/bin/env python3
"""Generate a voice line and save word-boundary timestamps.

Usage:
  python3 scripts/tts.py "Your line here" public/audio/name.mp3 [--engine auto] [--voice ...] [--rate +0%]

Writes <name>.mp3 and <name>.words.json ([{text, start, end}] in seconds).

Engines (all free):
  edge    Microsoft edge-tts. Exact word timestamps. Needs network access
          to speech.platform.bing.com (WebSocket).
  kokoro  Local neural TTS (Kokoro-82M, Apache 2.0). Runs offline after
          `bash scripts/setup-kokoro.sh`. Word timings are estimated from
          phoneme counts.
  espeak  espeak-ng. Robotic; for quick drafts only. Estimated timings.
  auto    (default) edge, falling back to kokoro if edge can't connect.
"""
import argparse
import asyncio
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KOKORO_MODEL = ROOT / "models/kokoro/kokoro-v1.0.onnx"
KOKORO_VOICES = ROOT / "models/kokoro/voices-v1.0.bin"
TICKS_PER_SECOND = 10_000_000
# Stress and length marks in phoneme strings aren't sounds of their own
NOT_SOUNDS = str.maketrans("", "", " ˈˌː")
DEFAULT_VOICES = {"edge": "en-US-AriaNeural", "kokoro": "af_heart", "espeak": "en-us"}


def run_edge(text: str, out: Path, voice: str, rate: str, pitch: str = "+0Hz") -> list:
    import edge_tts

    async def go() -> list:
        words = []
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
        audio = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.extend(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                end = start + chunk["duration"] / TICKS_PER_SECOND
                words.append({"text": chunk["text"], "start": round(start, 3), "end": round(end, 3)})
        out.write_bytes(audio)
        return words

    return asyncio.run(go())


def to_mp3(wav: Path, out: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ar", "44100", "-b:a", "192k", str(out)],
        check=True,
    )


def speech_span(samples, sample_rate: int, threshold: float = 0.01) -> tuple[float, float]:
    """First and last moments the signal rises above the silence threshold."""
    import numpy as np

    loud = np.flatnonzero(np.abs(samples) > threshold)
    if loud.size == 0:
        return 0.0, len(samples) / sample_rate
    return loud[0] / sample_rate, loud[-1] / sample_rate


def find_pauses(samples, sample_rate: int, threshold: float = 0.01, min_gap: float = 0.06) -> list:
    """(start, end) of each quiet stretch longer than min_gap, inside the speech."""
    import numpy as np

    frame = int(sample_rate * 0.01)
    n = len(samples) // frame
    loud = np.abs(np.asarray(samples[: n * frame])).reshape(n, frame).max(axis=1) > threshold
    pauses, run_start = [], None
    for i, is_loud in enumerate(loud):
        if not is_loud and run_start is None:
            run_start = i
        elif is_loud and run_start is not None:
            if run_start > 0 and (i - run_start) * 0.01 >= min_gap:
                pauses.append((run_start * 0.01, i * 0.01))
            run_start = None
    return pauses


def align(guesses: list[float], pauses: list, marks: list[str]) -> list[tuple[int, int]]:
    """Pair clause breaks with pauses, in order, at least total cost.

    Cost is the distance between a break's guessed time and the pause. A break
    with no pause is free between plain words, cheap for a comma and dearer for
    a full stop; a pause matching no break costs most.
    """
    m, n = len(guesses), len(pauses)
    skip_break = [0.8 if mark in ".!?" else 0.25 if mark in ",;:" else 0.0 for mark in marks]
    skip_pause = 0.6
    inf = float("inf")
    cost = [[inf] * (n + 1) for _ in range(m + 1)]
    move = [[None] * (n + 1) for _ in range(m + 1)]
    cost[0][0] = 0.0
    for c in range(m + 1):
        for p in range(n + 1):
            here = cost[c][p]
            if here == inf:
                continue
            steps = []
            if c < m:
                steps.append((c + 1, p, skip_break[c], None))
            if p < n:
                steps.append((c, p + 1, skip_pause, None))
            if c < m and p < n:
                mid = (pauses[p][0] + pauses[p][1]) / 2
                # Long pauses belong at punctuation, not between plain words
                length = pauses[p][1] - pauses[p][0]
                long_at_plain = 0.4 if marks[c] not in ".!?,;:" and length > 0.2 else 0.0
                # ...and the longest pauses are sentence ends
                long_at_stop = -0.3 * min(1.0, length / 0.3) if marks[c] in ".!?" and length > 0.2 else 0.0
                steps.append((c + 1, p + 1, abs(guesses[c] - mid) + long_at_plain + long_at_stop, (c, p)))
            for nc, np_, step, pair in steps:
                if here + step < cost[nc][np_]:
                    cost[nc][np_] = here + step
                    move[nc][np_] = (c, p, pair)
    pairs, c, p = [], m, n
    while (c, p) != (0, 0):
        c, p, pair = move[c][p]
        if pair:
            pairs.append(pair)
    return pairs[::-1]


def time_words(tokens: list[str], weights: list[int], samples, sample_rate: int) -> list:
    """Estimate word times: snap word gaps to real pauses (punctuation first), spread the rest by weight."""
    start, end = speech_span(samples, sample_rate)
    # A stop consonant inside the final word reads as a pause; ignore the tail
    pauses = [p for p in find_pauses(samples, sample_rate) if p[1] < end - 0.2]
    # Every gap between words may hold a pause; punctuated gaps are expected to
    clause_ends = list(range(len(tokens) - 1))

    # Where each clause break would fall with a plain proportional spread
    total = sum(weights)
    guesses = [start + (end - start) * sum(weights[: i + 1]) / total for i in clause_ends]
    bounds = [(clause_ends[c], *pauses[p]) for c, p in align(guesses, pauses, [tokens[i][-1] for i in clause_ends])]

    # Drop any snap that would squeeze words below a plausible length, then re-spread
    min_per_weight = 0.04  # seconds per phoneme (or character) of weight
    while True:
        segments, seg_start, first = [], start, 0
        for k, (i, pause_start, pause_end) in enumerate([*bounds, (len(tokens) - 1, end, end)]):
            segments.append((k, first, i, seg_start, pause_start))
            seg_start, first = pause_end, i + 1
        tight = [k for k, a, b, t0, t1 in segments if t1 - t0 < min_per_weight * sum(weights[a : b + 1])]
        if not tight or not bounds:
            break
        # Of the snaps on either side of the squeezed stretch, drop the weaker one:
        # an unpunctuated gap before a punctuated one, then the shorter pause
        k = tight[0]
        sides = [j for j in (k - 1, k) if 0 <= j < len(bounds)]
        strength = lambda j: (tokens[bounds[j][0]][-1:] in ".!?,;:", bounds[j][2] - bounds[j][1])
        bounds.pop(min(sides, key=strength))

    words = []
    for _, a, b, t0, t1 in segments:
        words += spread_words(tokens[a : b + 1], weights[a : b + 1], t0, t1)
    return words


def spread_words(tokens: list[str], weights: list[int], start: float, end: float) -> list:
    total = sum(weights)
    words, cursor = [], start
    for token, weight in zip(tokens, weights):
        span = (end - start) * weight / total
        words.append({"text": token, "start": round(cursor, 3), "end": round(cursor + span, 3)})
        cursor += span
    return words


def clean(token: str) -> str:
    return token.strip(".,!?;:\"'()")


def run_kokoro(text: str, out: Path, voice: str, rate: str) -> list:
    import soundfile as sf
    from kokoro_onnx import Kokoro

    if not KOKORO_MODEL.exists():
        sys.exit("Kokoro model missing. Run: bash scripts/setup-kokoro.sh")
    kokoro = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    speed = 1.0 + int(rate.rstrip("%")) / 100
    samples, sample_rate = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "voice.wav"
        sf.write(wav, samples, sample_rate)
        to_mp3(wav, out)

    # Weight each word by its phoneme count (plus one for the gap after it)
    tokens = text.split()
    weights = [
        len(kokoro.tokenizer.phonemize(clean(t) or t, "en-us").translate(NOT_SOUNDS)) + 1 for t in tokens
    ]
    return finish(tokens, weights, samples, sample_rate)


def run_espeak(text: str, out: Path, voice: str, rate: str) -> list:
    import numpy as np
    import soundfile as sf

    words_per_min = int(160 * (1.0 + int(rate.rstrip("%")) / 100))
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "voice.wav"
        subprocess.run(["espeak-ng", "-v", voice, "-s", str(words_per_min), "-w", str(wav), text], check=True)
        samples, sample_rate = sf.read(wav)
        to_mp3(wav, out)
    tokens = text.split()
    return finish(tokens, [len(t) + 1 for t in tokens], np.asarray(samples), sample_rate)


def finish(tokens: list[str], weights: list[int], samples, sample_rate: int) -> list:
    words = time_words(tokens, weights, samples, sample_rate)
    for w in words:
        w["text"] = clean(w["text"]) or w["text"]
    return words


def shift_pitch(path: Path, pitch: str) -> None:
    """Approximate edge-tts's pitch offset (Hz) for local engines; timing is preserved."""
    hz = float(pitch.rstrip("Hz") or 0)
    if hz == 0:
        return
    factor = 1 + hz / 120  # relative to a typical ~120 Hz speaking voice
    tmp = path.with_suffix(".pitch.mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-af",
         f"asetrate=44100*{factor},aresample=44100,atempo={1 / factor}", "-b:a", "192k", str(tmp)],
        check=True,
    )
    tmp.replace(path)


ENGINES = {"edge": run_edge, "kokoro": run_kokoro, "espeak": run_espeak}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("text")
    ap.add_argument("out")
    ap.add_argument("--engine", choices=["auto", *ENGINES], default="auto")
    ap.add_argument("--voice", help="engine-specific voice id (defaults: %s)" % DEFAULT_VOICES)
    ap.add_argument("--rate", default="+0%", help="speed change, e.g. +10%% or --rate=-5%%")
    ap.add_argument("--pitch", default="+0Hz", help="pitch offset, e.g. --pitch=-2Hz")
    args = ap.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    engine = args.engine
    if engine == "auto":
        try:
            words = run_edge(args.text, out, args.voice or DEFAULT_VOICES["edge"], args.rate, args.pitch)
            engine = "edge"
        except Exception as e:  # network blocked, DNS failure, proxy rejection...
            print(f"edge-tts unavailable ({type(e).__name__}); falling back to kokoro", file=sys.stderr)
            engine = "kokoro"
            # Keep a Kokoro voice id if one was given; edge ids look like en-US-AriaNeural
            voice = args.voice if args.voice and "Neural" not in args.voice else DEFAULT_VOICES["kokoro"]
            words = run_kokoro(args.text, out, voice, args.rate)
            shift_pitch(out, args.pitch)
    elif engine == "edge":
        words = run_edge(args.text, out, args.voice or DEFAULT_VOICES["edge"], args.rate, args.pitch)
    else:
        words = ENGINES[engine](args.text, out, args.voice or DEFAULT_VOICES[engine], args.rate)
        shift_pitch(out, args.pitch)

    words_path = out.with_suffix(".words.json")
    words_path.write_text(json.dumps(words, indent=2))
    timing = "exact" if engine == "edge" else "estimated"
    print(f"[{engine}] wrote {out} and {words_path} ({len(words)} words, {timing} timings)")


if __name__ == "__main__":
    main()
