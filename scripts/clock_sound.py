#!/usr/bin/env python3
"""Score and mix "The Clock" (Revenue OS, 30s).

Reads the cues in src/Clock/timeline.json (written by scripts/clock_vo.py), synthesises the
music and SFX, mixes them under public/audio/clock-vo.mp3 and writes public/audio/clock-mix.wav.

  - The cost (blue): a low A-minor drone and a slow sub pulse; a ping on the enquiry; clock ticks
    that speed up with the timer; an airy drain as the leads leave.
  - The turn: everything stops for the held breath, then a rising swell under the orange zip.
  - Us (orange): C major pad, a soft 100 BPM pulse, a click on each of the three clicks, a low
    thud as Revenue OS lands on the stack. The music stops for the end card:
    one low hit and a quiet C-major chord under the logo.
  - Music sits 18 LU under the voice; the mix is normalised to -14 LUFS, true peak <= -1 dBTP.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

from revenue_os_sound import N, SR, click, drum, env, lowpass, place, rng, stamp, tick, true_peak, true_peak_limit, whoosh

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
T = json.loads((ROOT / "src/Clock/timeline.json").read_text())
Q = T["cues"]
S = {s["id"]: s for s in T["scenes"]}
t_of = lambda f: f / FPS
t_all = np.arange(N) / SR


def ping() -> np.ndarray:
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318.5 * t) + 0.35 * np.sin(2 * np.pi * 2637 * t)) * env(n, 0.002, 0.35)


def clock_tick() -> np.ndarray:
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return (0.7 * np.sin(2 * np.pi * 2400 * t) + 0.3 * np.sin(2 * np.pi * 900 * t)) * env(n, 0.0005, 0.006)


def drain(length: float) -> np.ndarray:
    """Air falling away: band-passed noise sweeping down."""
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = 3500 * (1 - t / length) ** 2 + 300
    band = lowpass(noise, sweep) - lowpass(noise, sweep * 0.4)
    return band * np.sin(np.pi * t / length) ** 1.5


def swell(length: float) -> np.ndarray:
    """A warm rise into the turn: C major, filter opening."""
    n = int(length * SR)
    t = np.arange(n) / SR
    tone = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(130.81, 1), (196.0, 0.7), (261.63, 0.5), (329.63, 0.35)])
    s = lowpass(tone, 200 + 2500 * (t / length) ** 2) * (t / length) ** 1.8
    s[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return s


def chord(freqs, amp) -> np.ndarray:
    return sum(a * np.sin(2 * np.pi * f * t_all + rng.uniform(0, 6.28)) for f, a in zip(freqs, amp))


def music() -> np.ndarray:
    hush_a, hush_b = t_of(Q["collapse"]) + 0.15, t_of(Q["sweep"])  # the held breath
    cut = t_of(Q["endCard"])
    turn = t_of(Q["sweep"])
    lift = np.clip((t_all - turn) / 1.0, 0, 1)

    # Pad: A minor drone under the cost, C major after the turn
    minor = chord([55.0, 110.0, 164.81, 220.0], [1.0, 0.8, 0.5, 0.35])
    major = chord([65.41, 130.81, 196.0, 261.63, 329.63], [0.9, 1.0, 0.7, 0.5, 0.3])
    pad = (1 - lift) * minor * (0.5 + 0.5 * np.clip(t_all / turn, 0, 1)) + lift * major
    pad *= 1 + 0.06 * np.sin(2 * np.pi * 0.2 * t_all)
    out = 0.1 * pad

    # Pulse: a slow heartbeat through the cost (72 BPM), a lighter 100 BPM after the turn
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * np.cumsum(48 + 18 * np.exp(-t / 0.04)) / SR) * env(n, 0.004, 0.12)
    at = 0.4
    while at < hush_a:
        place(out, thump * (0.4 + 0.6 * at / hush_a), at)
        at += 60 / 72
    at = turn + 0.6
    while at < cut:
        place(out, thump * 0.55, at)
        at += 0.6

    # Hats after the turn, quiet
    hn = int(0.03 * SR)
    hat = rng.standard_normal(hn) * env(hn, 0.0005, 0.006)
    hat = hat - lowpass(hat, 6000)
    at = turn + 0.9
    while at < cut:
        place(out, hat * 0.12, at)
        at += 0.3

    # Gates: silence for the held breath (40 ms ramps) and from the end card
    gate = np.ones(N)
    r = int(0.04 * SR)
    a, b = int(hush_a * SR), int(hush_b * SR)
    gate[a:b] = 0
    gate[a - r: a] = np.linspace(1, 0, r)
    c = int(cut * SR)
    gate[c:] = 0
    gate[c - int(0.005 * SR): c] = np.linspace(1, 0, int(0.005 * SR))
    out *= gate

    # A soft C-major chord under the logo
    logo = int(t_of(Q["logo"]) * SR)
    tail = major[logo:] * env(N - logo, 0.4, 2.5) * 0.12
    out[logo:] += tail
    return out


def load_voice() -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "public/audio/clock-vo.mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    v = np.frombuffer(raw, dtype=np.float32).astype(float)
    out = np.zeros(N)
    out[: min(N, len(v))] = v[:N]
    return out


def main() -> None:
    meter = pyln.Meter(SR)
    voice = load_voice()
    bed = music()
    v_lufs = meter.integrated_loudness(voice[: int(t_of(Q["endCard"]) * SR)])
    m_lufs = meter.integrated_loudness(bed[: int(t_of(Q["endCard"]) * SR)])
    bed *= 10 ** (((v_lufs - 18) - m_lufs) / 20)
    # Duck under the voice, up 8 dB in the gaps
    hop = int(0.01 * SR)
    frames = np.abs(voice[: N // hop * hop]).reshape(-1, hop).max(axis=1)
    hold = int(0.3 / 0.01)
    spk = np.convolve((frames > 0.02).astype(float), np.ones(2 * hold + 1), mode="same") > 0
    duck = np.repeat(np.where(spk, 1.0, 10 ** (8 / 20)), hop)
    duck = np.concatenate([duck, np.full(N - len(duck), duck[-1])])
    k = int(0.25 * SR)
    bed *= np.convolve(duck, np.ones(k) / k, mode="same")

    sfx = np.zeros(N)
    place(sfx, ping() * 0.22, t_of(Q["ping"]))
    for i, f in enumerate(Q["ticks"]):
        place(sfx, clock_tick() * (0.2 + 0.25 * i / len(Q["ticks"])), t_of(f))
    place(sfx, drain(1.6) * 0.12, t_of(Q["leakGo"]))
    place(sfx, tick() * 0.1, t_of(Q["chart"]))
    place(sfx, swell(t_of(Q["sweep"] + 36) - t_of(Q["sweep"])) * 0.16, t_of(Q["sweep"]))
    place(sfx, whoosh(0.9) * 0.1, t_of(Q["sweep"]))
    place(sfx, ping() * 0.14, t_of(S["answered"]["start"] + 2))
    place(sfx, stamp() * 0.3, t_of(Q["timerStop"]))
    for f in Q["clicks"]:
        place(sfx, click() * 0.42, t_of(f))
    place(sfx, whoosh(0.7) * 0.09, t_of(Q["fieldBack"]))
    place(sfx, stamp() * 0.4, t_of(Q["stackDrop"] + 8))
    place(sfx, drum() * 0.45, t_of(Q["logo"]))

    mix = voice + bed + sfx
    lufs = lambda x: meter.integrated_loudness(np.stack([x, x], axis=1))
    for _ in range(10):
        mix *= 10 ** ((-14.0 - lufs(mix)) / 20)
        mix = true_peak_limit(mix, 10 ** (-1.2 / 20))
    out = ROOT / "public/audio/clock-mix.wav"
    sf.write(out, np.stack([mix, mix], axis=1).astype(np.float32), SR, subtype="PCM_24")
    print(f"voice {v_lufs:.1f} LUFS, music {v_lufs - 18:.1f} LUFS; mix {lufs(mix):.2f} LUFS, "
          f"true peak {20 * np.log10(true_peak(mix)):.2f} dBTP -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
