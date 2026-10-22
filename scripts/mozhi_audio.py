#!/usr/bin/env python3
"""Voice, score and mix the Mozhi OS 30s film.

Single source of timing for picture and sound: this script voices every line (Kokoro),
places it on the shot timeline, then builds the sound design around it and writes

  src/Mozhi/timeline.json        shots, voice clips and cues, in frames
  public/audio/mozhi-mix.wav     voice + ambience + SFX + music, -14 LUFS, true peak <= -1 dBTP

Voices: narrator af_heart (Kokoro's best-rated voice), warmed with a light room; Mozhi hf_alpha; Priya hf_beta. The first call starts in English; Priya
switches to Hindi mid-sentence (one voice across both languages) and Mozhi carries on in Hindi.
Callers on the phone are band-limited.

Usage: python3 scripts/mozhi_audio.py
"""
import json
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from kokoro_onnx import Kokoro
from scipy.signal import butter, resample_poly, sosfilt

from revenue_os_sound import click, drum, env, lowpass, place, rng, stamp, tick, true_peak, true_peak_limit, whoosh

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
DUR = 30.0
N = int(SR * DUR)
t_all = np.arange(N) / SR

# Shot boundaries in seconds (the storyboard's, nudged to fit the lines as voiced)
SHOTS = [
    ("tension", 0.0),
    ("switch", 4.0),
    ("firstCall", 6.0),
    ("orchestrate", 10.7),
    ("followUp", 13.35),
    ("book", 17.7),
    ("support", 19.7),
    ("recover", 21.6),
    ("growth", 23.3),
    ("title", 25.0),
    ("endCard", 26.4),
]

# (id, speaker, voice, lang, speed, start, text). start is seconds, or ("after", gap) to follow the
# previous line.
LINES = [
    ("vo1", "narrator", "af_heart", "en-us", 1.0, 0.3, "Every lead you don't call is revenue you've already paid for."),
    ("vo2", "narrator", "af_heart", "en-us", 1.05, 4.3, "Mozhi calls every one of them."),
    ("mozhiOpen", "mozhi", "hf_alpha", "en-us", 1.2, 6.15, "Hi Priya, is now a good time?"),
    ("priyaEn", "priya", "hf_beta", "en-us", 1.1, ("after", 0.25), "Sure, but"),
    ("priyaHi", "priya", "hf_beta", "hi", 1.1, ("after", 0.02), "पहले डिटेल्स भेज दीजिए।"),
    ("mozhiHi", "mozhi", "hf_alpha", "hi", 1.2, ("after", 0.3), "ज़रूर, अभी व्हाट्सऐप पर भेजती हूँ।"),
    ("mozhiDay3", "mozhi", "hf_alpha", "en-us", 1.3, 13.6, "Hi Priya, did you see the brochure I sent on Tuesday?"),
    ("priyaYes", "priya", "hf_beta", "en-us", 1.1, ("after", 0.1), "Yes, we liked it."),
    ("mozhiSupport", "mozhi", "hf_alpha", "en-us", 1.15, 19.85, "Done. It's moved to the fifteenth."),
    ("vo3a", "narrator", "af_heart", "en-us", 1.15, 23.35, "Sell more."),
    ("vo3b", "narrator", "af_heart", "en-us", 1.15, ("after", 0.1), "Spend less."),
    ("vo3c", "narrator", "af_heart", "en-us", 1.12, ("after", 0.1), "Grow without growing the team."),
    # The sign-off, over the logo after the drumbeats
    ("vo4a", "narrator", "af_heart", "en-us", 1.15, 26.9, "The Vertical AI."),
    ("vo4b", "narrator", "af_heart", "en-us", 1.22, ("after", 0.06), "AI Enterprise OS for success."),
]


def f(t: float) -> int:
    return round(t * FPS)


def trim(a: np.ndarray, thr: float = 0.004) -> np.ndarray:
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 2400] if len(idx) else a


def voice_lines():
    k = Kokoro(str(ROOT / "models/kokoro/kokoro-v1.0.onnx"), str(ROOT / "models/kokoro/voices-v1.0.bin"))
    clips, t = [], 0.0
    for cid, who, voice, lang, speed, start, text in LINES:
        a, sr = k.create(text, voice=voice, lang=lang, speed=speed)
        a = resample_poly(trim(a), SR, sr)
        if isinstance(start, tuple):
            start = t + start[1]
        clips.append({"id": cid, "who": who, "text": text, "start": start, "end": start + len(a) / SR, "audio": a})
        t = start + len(a) / SR
    return clips


def narrator_chain(x: np.ndarray) -> np.ndarray:
    """Clean up the low end, lift presence a touch, and add a short, quiet room for warmth."""
    x = sosfilt(butter(2, 80, btype="highpass", fs=SR, output="sos"), x)
    x = x + 0.25 * sosfilt(butter(2, [2500, 6000], btype="bandpass", fs=SR, output="sos"), x)
    n = int(0.35 * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.07 * SR))
    ir = lowpass(ir, 4000)
    wet = np.convolve(x, ir)
    out = np.concatenate([x, np.zeros(len(wet) - len(x))])
    out += 0.06 * wet / (np.max(np.abs(wet)) + 1e-9) * np.max(np.abs(x))
    return out


def phone_line(x: np.ndarray) -> np.ndarray:
    sos = butter(4, [320, 3400], btype="bandpass", fs=SR, output="sos")
    return np.tanh(1.6 * sosfilt(sos, x)) / 1.2


# ---------- sounds ----------
def ring_burst() -> np.ndarray:
    """A desk phone: 400 + 450 Hz, two 0.4s bursts."""
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 400 * t) + np.sin(2 * np.pi * 450 * t)
    gate = ((t < 0.4) | ((t > 0.6) & (t < 1.0))).astype(float)
    gate = np.convolve(gate, np.ones(240) / 240, mode="same")
    return lowpass(tone * gate, 2500) * 0.5


def ping(f1: float, f2: float, gap: float = 0.09) -> np.ndarray:
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    a = np.sin(2 * np.pi * f1 * t) * env(n, 0.002, 0.12)
    b = np.zeros(n)
    k = int(gap * SR)
    b[k:] = (np.sin(2 * np.pi * f2 * t) * env(n, 0.002, 0.2))[: n - k]
    return a + b


def buzz() -> np.ndarray:
    """A phone vibrating on a table."""
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 160 * t) * (np.sin(2 * np.pi * 9 * t) > 0)
    return lowpass(s, 900) * env(n, 0.01, 0.4)


def room(level: float) -> np.ndarray:
    """Room tone: soft brown-ish noise."""
    return lowpass(rng.standard_normal(N), 700) * level


def home_noise(a: float, b: float) -> np.ndarray:
    """Everyday noise behind Priya: a far-off TV murmur and traffic, band-limited like the call."""
    out = np.zeros(N)
    i, j = int(a * SR), int(b * SR)
    n = j - i
    murmur = lowpass(rng.standard_normal(n), 900) - lowpass(rng.standard_normal(n), 250)
    murmur *= 0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * np.arange(n) / SR) ** 2
    fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.15 * SR))
    out[i:j] = murmur * fade
    return out


def chord(freqs, amps) -> np.ndarray:
    return sum(a * np.sin(2 * np.pi * fr * t_all + rng.uniform(0, 6.28)) for fr, a in zip(freqs, amps))


def music(cue: dict) -> np.ndarray:
    t_on, t_lift, t_cut = cue["toggle"] / FPS, SHOT_S["growth"], SHOT_S["endCard"]
    out = np.zeros(N)
    # Before the switch: an uneasy low drone, nothing else
    minor = chord([55.0, 110.0, 130.81, 164.81], [1.0, 0.7, 0.35, 0.4])
    calm = chord([65.41, 130.81, 196.0, 261.63], [0.8, 1.0, 0.6, 0.35])
    bright = chord([65.41, 130.81, 196.0, 261.63, 329.63, 392.0], [0.8, 1.0, 0.7, 0.5, 0.4, 0.3])
    a = np.clip((t_all - t_on) / 0.6, 0, 1)
    b = np.clip((t_all - t_lift) / 0.8, 0, 1)
    pad = (1 - a) * minor + a * (1 - b) * calm + b * bright * 1.4
    out += 0.08 * pad * (1 + 0.05 * np.sin(2 * np.pi * 0.25 * t_all))
    # The low pulse starts with Mozhi (100 BPM), hats join, everything lifts for the growth
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * np.cumsum(50 + 18 * np.exp(-t / 0.04)) / SR) * env(n, 0.004, 0.11)
    hn = int(0.03 * SR)
    hat = rng.standard_normal(hn) * env(hn, 0.0005, 0.006)
    hat = hat - lowpass(hat, 6000)
    at = t_on + 0.1
    while at < t_cut:
        place(out, thump * (0.5 + 0.4 * (at > t_lift)), at)
        if at > t_on + 2:
            place(out, hat * (0.1 + 0.08 * (at > t_lift)), at + 0.3)
        at += 0.6
    # Silence on the drumbeat: hard cut at the end card (5 ms)
    c = int(t_cut * SR)
    out[c:] = 0
    out[c - 240: c] *= np.linspace(1, 0, 240)
    # A quiet chord under the logo
    lg = int(cue["logo"] / FPS * SR)
    out[lg:] += bright[lg:] * env(N - lg, 0.3, 2.0) * 0.06
    return out


SHOT_S = dict(SHOTS)


def main() -> None:
    clips = voice_lines()
    by = {c["id"]: c for c in clips}
    for a, b in zip(clips, clips[1:]):
        if b["start"] < a["end"]:
            print(f"WARNING: {b['id']} starts {a['end'] - b['start']:.2f}s before {a['id']} ends")
    for c in clips:
        print(f"{c['id']:13s} {c['start']:6.2f}-{c['end']:6.2f}  {c['text']}")

    s = {k: f(v) for k, v in SHOTS}
    cue = {
        "toggle": s["switch"] + 6,
        "dialFrom": s["switch"] + 16,
        "langSwitch": f(by["priyaHi"]["start"]),
        "qualify": [f(by["mozhiOpen"]["end"]) - 6, f(by["priyaHi"]["start"]) + 4, f(by["priyaHi"]["end"]) - 4],
        # the WhatsApp lands as Mozhi says it, with the CRM filling straight after
        "whatsapp": f(by["mozhiHi"]["start"] + 0.55 * (by["mozhiHi"]["end"] - by["mozhiHi"]["start"])),
        "crm": [f(by["mozhiHi"]["start"] + 0.55 * (by["mozhiHi"]["end"] - by["mozhiHi"]["start"])) + 6 + 6 * i for i in range(4)],
        "day3": s["followUp"] + 2,
        "memory": s["followUp"] + 12,
        "booked": s["book"] + 8,
        "confirm": s["book"] + 18,
        "handoff": s["book"] + 30,
        "salesUp": s["book"] + 44,
        "logged": f(by["mozhiSupport"]["end"]) - 4,
        "tap": s["recover"] + 30,
        "paid": s["recover"] + 38,
        "metrics": [s["growth"] + 6 + 8 * i for i in range(5)],
        "drums": [s["endCard"] + 2, s["endCard"] + 7, s["endCard"] + 12],
        "logo": f(by["vo4a"]["start"]) - 2,
        "tagline": f(by["vo4b"]["start"]),
    }
    tl = {
        "fps": FPS,
        "duration": int(DUR * FPS),
        "shots": [{"id": k, "start": s[k], "end": s[SHOTS[i + 1][0]] if i + 1 < len(SHOTS) else int(DUR * FPS)} for i, (k, _) in enumerate(SHOTS)],
        "clips": [{"id": c["id"], "who": c["who"], "text": c["text"], "start": f(c["start"]), "end": f(c["end"])} for c in clips],
        "cues": cue,
    }
    out = ROOT / "src/Mozhi/timeline.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(tl, indent=1, ensure_ascii=False))

    # ---------- mix ----------
    voice = np.zeros(N)
    for c in clips:
        a = c["audio"] * (1.0 if c["who"] == "narrator" else 0.9)
        if c["who"] == "narrator":
            a = narrator_chain(a)
        if c["who"] == "priya":
            a = phone_line(a)
        place(voice, a, c["start"])
    # Priya is on a call: her room bleeds in under her lines, through the same phone line
    calls = np.zeros(N)
    for a, b in [(by["priyaEn"]["start"] - 0.3, by["priyaHi"]["end"] + 0.3), (by["priyaYes"]["start"] - 0.3, by["priyaYes"]["end"] + 0.3)]:
        calls += home_noise(a, b)
    calls = phone_line(calls) * 0.05

    sfx = np.zeros(N)
    office = room(0.02)
    office[int(SHOT_S["firstCall"] * SR):] *= 0  # the office tone is only under the office shots
    g0 = int(SHOT_S["growth"] * SR)
    office[g0: int(SHOT_S["title"] * SR)] = room(0.02)[g0: int(SHOT_S["title"] * SR)]
    sfx += office
    # Phones ringing until she switches Mozhi on (two phones, out of step)
    for at in np.arange(0.1, cue["toggle"] / FPS - 0.2, 2.2):
        place(sfx, ring_burst() * 0.07, at)
    for at in np.arange(0.9, cue["toggle"] / FPS - 0.6, 2.6):
        place(sfx, lowpass(ring_burst(), 1400) * 0.05, at)
    ring_stop = int(cue["toggle"] / FPS * SR)
    fade = int(0.05 * SR)
    sfx[ring_stop: ring_stop + fade] *= np.linspace(1, 0.3, fade)
    sfx[ring_stop + fade: int(SHOT_S["firstCall"] * SR)] *= 0.3
    place(sfx, click() * 0.4, cue["toggle"] / FPS)
    # 176 leads dialling: a fast cascade of soft blips
    for i in range(40):
        place(sfx, tick() * (0.05 + 0.03 * rng.random()), cue["dialFrom"] / FPS + i * 0.028 + rng.random() * 0.02)
    place(sfx, whoosh(0.5) * 0.08, SHOT_S["firstCall"] - 0.15)
    place(sfx, buzz() * 0.25, cue["whatsapp"] / FPS)
    place(sfx, ping(1175, 1568) * 0.12, cue["whatsapp"] / FPS + 0.05)
    for c in cue["crm"]:
        place(sfx, tick() * 0.08, c / FPS)
    place(sfx, stamp() * 0.25, cue["day3"] / FPS)
    place(sfx, whoosh(0.4) * 0.06, cue["memory"] / FPS - 0.1)
    place(sfx, ping(1046, 1318) * 0.1, cue["confirm"] / FPS)
    place(sfx, tick() * 0.12, cue["booked"] / FPS)
    place(sfx, tick() * 0.12, cue["salesUp"] / FPS)
    for k in ["support", "recover"]:
        place(sfx, whoosh(0.35) * 0.07, SHOT_S[k] - 0.1)
    place(sfx, tick() * 0.1, cue["logged"] / FPS)
    place(sfx, click() * 0.3, cue["tap"] / FPS)
    place(sfx, ping(1318, 1760, 0.07) * 0.14, cue["paid"] / FPS)
    for c in cue["metrics"]:
        place(sfx, tick() * 0.08, c / FPS)
    place(sfx, whoosh(0.6) * 0.07, SHOT_S["title"] - 0.15)
    for d in cue["drums"]:
        place(sfx, drum() * 0.7, d / FPS)

    meter = pyln.Meter(SR)
    bed = music(cue)
    v_lufs = meter.integrated_loudness(voice)
    m_lufs = meter.integrated_loudness(bed[: int(SHOT_S["endCard"] * SR)])
    bed *= 10 ** (((v_lufs - 18) - m_lufs) / 20)
    hop = int(0.01 * SR)
    frames = np.abs(voice[: N // hop * hop]).reshape(-1, hop).max(axis=1)
    hold = int(0.3 / 0.01)
    spk = np.convolve((frames > 0.02).astype(float), np.ones(2 * hold + 1), mode="same") > 0
    duck = np.repeat(np.where(spk, 1.0, 10 ** (7 / 20)), hop)
    duck = np.concatenate([duck, np.full(N - len(duck), duck[-1])])
    kk = int(0.25 * SR)
    bed *= np.convolve(duck, np.ones(kk) / kk, mode="same")

    mix = voice + calls + sfx + bed
    lufs = lambda x: meter.integrated_loudness(np.stack([x, x], axis=1))
    for _ in range(10):
        mix *= 10 ** ((-14.0 - lufs(mix)) / 20)
        mix = true_peak_limit(mix, 10 ** (-1.2 / 20))
    path = ROOT / "public/audio/mozhi-mix.wav"
    sf.write(path, np.stack([mix, mix], axis=1).astype(np.float32), SR, subtype="PCM_24")
    print(f"mix {lufs(mix):.2f} LUFS, true peak {20 * np.log10(true_peak(mix)):.2f} dBTP -> {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
