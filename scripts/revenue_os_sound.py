#!/usr/bin/env python3
"""Score and mix the Revenue OS 30s film.

Reads every cue frame from src/RevenueOS/timeline.ts, synthesises the music bed and SFX,
mixes them under public/audio/revenue-os-vo.mp3 and writes public/audio/revenue-os-mix.wav.

  - Music: low 100 BPM pulse building 0-24s, pad underneath (A minor through the cost, lifting
    to C major on the turn), hats from 11s; hard cut to silence at the end card (26.0s). The pulse grid is phased so the three end-card
    drumbeats land on it.
  - SFX: a low clock tick on each unanswered-counter tick, ticks on field writes, whoosh on camera glides, a click on each of the 3 clicks,
    a low riser 22-24s, three drums. Each is trimmed to its own beat.
  - Music sits 18 LU under the voice; the full mix is normalised to -14 LUFS, peaks <= -1 dBFS.
"""
import re
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


def cues() -> dict:
    src = (ROOT / "src/RevenueOS/timeline.ts").read_text()
    body = src[src.index("export const T"): src.index("};", src.index("export const T"))]
    out = {}
    for key, val in re.findall(r"(\w+):\s*(\[[^\]]*\]|\d+)", body):
        out[key] = [int(v) for v in re.findall(r"\d+", val)] if val.startswith("[") else int(val)
    return out


def t_of(frame: float) -> float:
    return frame / FPS


def place(track: np.ndarray, sound: np.ndarray, at: float) -> None:
    i = int(at * SR)
    if i >= N:
        return
    j = min(N, i + len(sound))
    track[i:j] += sound[: j - i]


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(0, t - attack) / decay)


def lowpass(x: np.ndarray, cutoff) -> np.ndarray:
    """One-pole lowpass; cutoff may be a scalar or a per-sample array (Hz)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc += a[k] * (x[k] - acc)
        y[k] = acc
    return y


# ---------- sounds ----------
def tick() -> np.ndarray:
    n = int(0.045 * SR)
    t = np.arange(n) / SR
    s = 0.6 * np.sin(2 * np.pi * 1900 * t) + 0.4 * np.sin(2 * np.pi * 3800 * t)
    return s * env(n, 0.001, 0.009)


def click() -> np.ndarray:
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    snap = rng.standard_normal(n) * env(n, 0.0005, 0.004)
    snap = snap - lowpass(snap, 2500)  # keep the bright part
    thump = np.sin(2 * np.pi * 140 * t) * env(n, 0.001, 0.018)
    return 0.8 * snap + 0.6 * thump


def whoosh(length: float = 0.55) -> np.ndarray:
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = 300 + 2600 * np.sin(np.pi * t / length) ** 2  # opens then closes
    band = lowpass(noise, sweep) - lowpass(noise, sweep * 0.35)
    shape = np.sin(np.pi * t / length) ** 1.6
    return band * shape


def pop() -> np.ndarray:
    """A soft bubble pop for chat messages and notifications."""
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    f = 650 + 700 * (t / 0.07)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.018)


def stamp() -> np.ndarray:
    """A low, short thud for the time stamps."""
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(90 + 60 * np.exp(-t / 0.02)) / SR) * env(n, 0.001, 0.07)
    paper = lowpass(rng.standard_normal(n), 3000) * env(n, 0.0005, 0.012)
    return body + 0.4 * paper


def shimmer(length: float = 0.9) -> np.ndarray:
    """The scan line: a quiet, rising airy sweep."""
    n = int(length * SR)
    t = np.arange(n) / SR
    air = rng.standard_normal(n)
    band = lowpass(air, 1500 + 6000 * t / length) - lowpass(air, 800 + 3000 * t / length)
    return band * np.sin(np.pi * t / length) ** 2


def riser(length: float) -> np.ndarray:
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 70 + 120 * (t / length) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    air = lowpass(rng.standard_normal(n), 400 + 3000 * (t / length) ** 2)
    shape = (t / length) ** 2.2
    s = (0.7 * tone + 0.5 * air) * shape
    s[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))  # trimmed to its beat
    return s


def drum() -> np.ndarray:
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.22)
    hit = lowpass(rng.standard_normal(n), 1800) * env(n, 0.0005, 0.02)
    return body + 0.5 * hit


# ---------- music ----------
def music(cut: float, turn: float) -> np.ndarray:
    out = np.zeros(N)
    period = 0.6  # 100 BPM
    phase = (cut + 0.0667) % period  # first drum (frame 782) sits on the grid
    t_all = np.arange(N) / SR
    build = np.clip(t_all / 24.0, 0, 1)

    # Pulse: a soft sub thump on every beat, growing with the build
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * np.cumsum(50 + 18 * np.exp(-t / 0.04)) / SR) * env(n, 0.004, 0.11)
    k = 0
    while phase + k * period < cut:
        at = phase + k * period
        place(out, thump * (0.35 + 0.65 * min(1, at / 24.0) ** 1.3), at)
        k += 1

    # Pad: A minor under the cost, crossfading to C major over 1.2s on the turn (optimism, not alarm)
    lift = np.clip((t_all - turn) / 1.2, 0, 1)
    pad = np.zeros(N)
    for f, a in [(110.0, 1.0), (164.81, 0.7), (220.0, 0.55), (261.63, 0.4)]:
        pad += (1 - lift) * a * np.sin(2 * np.pi * f * t_all + rng.uniform(0, 6.28))
    for f, a in [(130.81, 1.0), (196.0, 0.7), (261.63, 0.55), (329.63, 0.4)]:
        pad += lift * a * np.sin(2 * np.pi * f * t_all + rng.uniform(0, 6.28))
    pad *= (0.12 + 0.38 * build) * (1 + 0.08 * np.sin(2 * np.pi * 0.25 * t_all))
    out += 0.09 * pad

    # Hats: quiet eighth notes from 11s
    hn = int(0.03 * SR)
    hat = rng.standard_normal(hn) * env(hn, 0.0005, 0.006)
    hat = hat - lowpass(hat, 6000)
    k = 0
    while phase + k * period / 2 < cut:
        at = phase + k * period / 2
        if at >= 11.0:
            place(out, hat * 0.18 * (0.4 + 0.6 * min(1, (at - 11) / 13)), at)
        k += 1

    # Hard cut to silence for the end card (5 ms fade, no click)
    gate = np.ones(N)
    c = int(cut * SR)
    gate[c:] = 0
    gate[c - int(0.005 * SR): c] = np.linspace(1, 0, int(0.005 * SR))
    return out * gate


def true_peak(x: np.ndarray) -> float:
    return float(np.max(np.abs(resample_poly(x, 4, 1))))


def true_peak_limit(x: np.ndarray, ceiling: float) -> np.ndarray:
    """Look-ahead limiter driven by 4x-oversampled peaks: 2 ms attack, 80 ms release."""
    over = np.abs(resample_poly(x, 4, 1)).reshape(-1, 4).max(axis=1)[: len(x)]
    need = np.minimum(1.0, ceiling / np.maximum(over, 1e-9))
    look = int(0.002 * SR)
    # Look ahead: each sample takes the smallest gain needed in the next 2 ms
    padded = np.concatenate([need, np.ones(look)])
    target = np.minimum.reduce([padded[i : i + len(need)] for i in range(look + 1)])
    gain = np.empty_like(target)
    g = 1.0
    rel = np.exp(-1 / (0.08 * SR))
    for k in range(len(target)):
        g = target[k] if target[k] < g else target[k] + (g - target[k]) * rel
        gain[k] = g
    return x * gain


def load_voice() -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "public/audio/revenue-os-vo.mp3"),
         "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        check=True, capture_output=True,
    ).stdout
    v = np.frombuffer(raw, dtype=np.float32).astype(float)
    out = np.zeros(N)
    out[: min(N, len(v))] = v[:N]
    return out


def main() -> None:
    T = cues()
    cut = t_of(T["endCard1"])  # music silent from the end card
    meter = pyln.Meter(SR)

    voice = load_voice()
    bed = music(cut, t_of(T["scan"]))
    # Music 18 LU under the voice (both measured where they play)
    v_lufs = meter.integrated_loudness(voice[int(1.0 * SR): int(26 * SR)])
    m_lufs = meter.integrated_loudness(bed[: int(cut * SR)])
    bed *= 10 ** (((v_lufs - 18) - m_lufs) / 20)
    # Duck: 18 LU under the voice while it speaks, up 9 dB in the gaps between lines
    hop = int(0.01 * SR)
    frames = np.abs(voice[: N // hop * hop]).reshape(-1, hop).max(axis=1)
    speaking = frames > 0.02
    # Hold through the short pauses inside a line, and open early before each line
    hold = int(0.35 / 0.01)
    spk = np.convolve(speaking.astype(float), np.ones(2 * hold + 1), mode="same") > 0
    duck = np.repeat(np.where(spk, 1.0, 10 ** (9 / 20)), hop)
    duck = np.concatenate([duck, np.full(N - len(duck), duck[-1])])
    k = int(0.25 * SR)  # 250 ms smoothing on every ramp
    duck = np.convolve(duck, np.ones(k) / k, mode="same")
    bed *= duck

    sfx = np.zeros(N)
    for f in T["counter"]:
        place(sfx, stamp() * 0.12, t_of(f))
    for f in [T["numberSnap"], T["sourceStamp"], T["warmChip"], *T["land"], T["snap"]]:
        place(sfx, tick() * 0.22, t_of(f))
    for f in [T["msg1"], T["reply1"], T["msgHindi"], T["replyHindi"], T["invite"], T["reminder"], T["thankYou"]]:
        place(sfx, pop() * 0.16, t_of(f))
    for f in [T["feedItem"], T["preview"], T["visitDone"], T["nba"], *T["labels"]]:
        place(sfx, tick() * 0.14, t_of(f))
    for f in [T["saturday"], T["days30"]]:
        place(sfx, stamp() * 0.35, t_of(f))
    place(sfx, shimmer() * 0.08, t_of(T["scan"]))
    for f, gain in [(T["glideChat"], 0.16), (T["glideCalendar"], 0.11), (T["glideGrowth"], 0.11)]:
        place(sfx, whoosh() * gain, t_of(f) - 0.12)
    for f in [T["click1"], T["click2"], T["click3"]]:
        place(sfx, click() * 0.42, t_of(f))
    place(sfx, riser(2.0) * 0.2, 22.0)
    for f in T["drums"]:
        place(sfx, drum() * 0.85, t_of(f))

    mix = voice + bed + sfx
    # Loudness is measured on the stereo file we ship (two identical channels), per EBU R128
    lufs = lambda x: meter.integrated_loudness(np.stack([x, x], axis=1))
    # Normalise and true-peak limit alternately until it settles at -14 LUFS, <= -1 dBTP
    for _ in range(10):
        mix *= 10 ** ((-14.0 - lufs(mix)) / 20)
        mix = true_peak_limit(mix, 10 ** (-1.2 / 20))

    out = ROOT / "public/audio/revenue-os-mix.wav"
    sf.write(out, np.stack([mix, mix], axis=1).astype(np.float32), SR, subtype="PCM_24")
    print(f"voice {v_lufs:.1f} LUFS, music set to {v_lufs - 18:.1f} LUFS (18 LU under)")
    print(f"mix {lufs(mix):.2f} LUFS (stereo), true peak {20 * np.log10(true_peak(mix)):.2f} dBTP -> {out.relative_to(ROOT)}")
    print(f"music cut at {cut:.3f}s; drums at {[round(t_of(f), 3) for f in T['drums']]}")


if __name__ == "__main__":
    main()
