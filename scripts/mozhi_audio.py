#!/usr/bin/env python3
"""Voice, score and mix the Mozhi 30s film.

One message per shot: your team can't call every lead -> meet Mozhi, an AI voice agent that
makes your calls -> every lead called in minutes -> in your customer's language -> one agent
for every kind of call -> the outcome -> The Vertical AI.

Single source of timing for picture and sound: this script voices every line (Kokoro), lays
the lines end to end, derives each shot from its first line, then builds the sound around it:

  src/Mozhi/timeline.json        shots, voice clips and cues, in frames
  public/audio/mozhi-mix.wav     voice + ambience + SFX + music, -14 LUFS, true peak <= -1 dBTP

Voices: narrator af_heart (Kokoro's best-rated voice) at natural pace, each line voiced as one
whole sentence so it keeps its intonation; where picture must land on a phrase inside a line
(the use cases, the three outcomes, the sign-off), each phrase start is timed by voicing the
line up to that phrase. Mozhi
is hf_alpha and Priya hf_beta; their English lines are written in Devanagari and voiced with
the Hindi phonemiser, which gives Indian English. Priya is heard down a phone line.
"Mozhi" is pronounced "mo-lee", so the narrator's text spells it that way.

Usage: python3 scripts/mozhi_audio.py
"""
import json
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from kokoro_onnx import Kokoro
from scipy.signal import butter, resample_poly, sosfilt

from revenue_os_sound import drum, env, lowpass, place, rng, stamp, tick, true_peak, true_peak_limit, whoosh

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
DUR = 30.0
N = int(SR * DUR)
t_all = np.arange(N) / SR

# (id, speaker, voice, lang, speed, gap before in s (or (absolute start,)), spoken text, shown text)
LINES = [
    ("vo1", "narrator", "af_heart", "en-us", 0.98, (0.3,), "Your team can't call every lead. Most never hear back.", None),
    ("vo2", "narrator", "af_heart", "en-us", 0.98, 0.35, "Meet Mo-lee: an AI voice agent that makes your calls for you.", "Meet Mozhi: an AI voice agent that makes your calls for you."),
    ("vo3", "narrator", "af_heart", "en-us", 0.98, 0.3, "Every lead, called in minutes.", None),
    ("mozhiOpen", "mozhi", "hf_alpha", "hi", 1.1, 0.35, "हाय प्रिया, इज़ नाउ अ गुड टाइम?", "Hi Priya, is now a good time?"),
    ("priyaEn", "priya", "hf_beta", "hi", 1.1, 0.2, "श्योर, बट", "Sure, but"),
    ("priyaHi", "priya", "hf_beta", "hi", 1.1, 0.02, "पहले डिटेल्स भेज दीजिए।", None),
    ("mozhiHi", "mozhi", "hf_alpha", "hi", 1.15, 0.22, "ज़रूर, अभी व्हाट्सऐप पर भेजती हूँ।", None),
    ("uses", "narrator", "af_heart", "en-us", 0.98, 0.4, "Follow-ups, bookings, support, payment reminders. One agent, for every call.", None),
    ("outcome", "narrator", "af_heart", "en-us", 0.98, 0.35, "Sell more. Spend less. Grow without growing the team.", None),
    ("brand", "narrator", "af_heart", "en-us", 0.98, 0.45, "Mo-lee, by The Vertical AI.", "Mozhi, by The Vertical AI."),
]
# Phrases inside a line that picture lands on; their starts are timed by voicing each prefix
MARKS = {
    "uses": ["Follow-ups,", "bookings,", "support,", "payment reminders.", "One agent, for every call."],
    "outcome": ["Sell more.", "Spend less.", "Grow without growing the team."],
}


# Each shot starts LEAD seconds before its first line; the first shot starts at 0
SHOTS = [("pain", "vo1"), ("meet", "vo2"), ("scale", "vo3"), ("call", "mozhiOpen"), ("uses", "uses"), ("outcome", "outcome"), ("end", "brand")]
LEAD = 0.25


def f(t: float) -> int:
    return round(t * FPS)


def trim(a: np.ndarray, thr: float = 0.004) -> np.ndarray:
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 1200] if len(idx) else a


def voice_lines():
    k = Kokoro(str(ROOT / "models/kokoro/kokoro-v1.0.onnx"), str(ROOT / "models/kokoro/voices-v1.0.bin"))
    clips, t = [], 0.0
    for cid, who, voice, lang, speed, gap, text, shown in LINES:
        a, sr = k.create(text, voice=voice, lang=lang, speed=speed)
        a = resample_poly(trim(a), SR, sr)
        start = gap[0] if isinstance(gap, tuple) else t + gap
        clip = {"id": cid, "who": who, "text": shown or text, "start": start, "end": start + len(a) / SR, "audio": a}
        if cid in MARKS:
            phrases = MARKS[cid]
            assert " ".join(phrases) == text, cid
            clip["marks"] = [start]
            for n in range(1, len(phrases)):
                p, psr = k.create(" ".join(phrases[:n]), voice=voice, lang=lang, speed=speed)
                clip["marks"].append(start + len(trim(p)) / psr)
        clips.append(clip)
        t = start + len(a) / SR
    return clips


def narrator_chain(x: np.ndarray) -> np.ndarray:
    """Clean up the low end only; anything more makes the voice sound processed."""
    return sosfilt(butter(2, 80, btype="highpass", fs=SR, output="sos"), x)


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


def room(level: float) -> np.ndarray:
    return lowpass(rng.standard_normal(N), 700) * level


def home_noise(a: float, b: float) -> np.ndarray:
    """Everyday noise behind Priya: a far-off TV murmur, band-limited like the call."""
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


def music(on: float, lift: float, cut: float, logo: float) -> np.ndarray:
    out = np.zeros(N)
    minor = chord([55.0, 110.0, 130.81, 164.81], [1.0, 0.7, 0.35, 0.4])
    calm = chord([65.41, 130.81, 196.0, 261.63], [0.8, 1.0, 0.6, 0.35])
    bright = chord([65.41, 130.81, 196.0, 261.63, 329.63, 392.0], [0.8, 1.0, 0.7, 0.5, 0.4, 0.3])
    a = np.clip((t_all - on) / 0.6, 0, 1)
    b = np.clip((t_all - lift) / 0.8, 0, 1)
    pad = (1 - a) * minor + a * (1 - b) * calm + b * bright * 1.4
    out += 0.08 * pad * (1 + 0.05 * np.sin(2 * np.pi * 0.25 * t_all))
    # A low pulse from the moment Mozhi arrives; hats join; it lifts for the outcome
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * np.cumsum(50 + 18 * np.exp(-t / 0.04)) / SR) * env(n, 0.004, 0.11)
    hn = int(0.03 * SR)
    hat = rng.standard_normal(hn) * env(hn, 0.0005, 0.006)
    hat = hat - lowpass(hat, 6000)
    at = on + 0.1
    while at < cut:
        place(out, thump * (0.5 + 0.4 * (at > lift)), at)
        if at > on + 2:
            place(out, hat * (0.1 + 0.08 * (at > lift)), at + 0.3)
        at += 0.6
    c = int(cut * SR)
    out[c:] = 0
    out[c - 240: c] *= np.linspace(1, 0, 240)
    lg = int(logo * SR)
    out[lg:] += bright[lg:] * env(N - lg, 0.3, 2.0) * 0.07
    return out


def main() -> None:
    clips = voice_lines()
    by = {c["id"]: c for c in clips}
    for c in clips:
        print(f"{c['id']:10s} {c['start']:6.2f}-{c['end']:6.2f}  {c['text']}")
    if clips[-1]["end"] > DUR - 0.1:
        print(f"WARNING: the last line ends at {clips[-1]['end']:.2f}s; tighten the script")

    starts = [0.0] + [by[first]["start"] - LEAD for _, first in SHOTS[1:]]
    shots = [{"id": sid, "start": f(a), "end": f(b)} for (sid, _), a, b in zip(SHOTS, starts, starts[1:] + [DUR])]
    s = {x["id"]: x["start"] for x in shots}
    mid = lambda c: f(c["start"] + 0.55 * (c["end"] - c["start"]))
    cue = {
        "ringUntil": s["meet"],
        "reveal": s["meet"] + 1,
        "dialFrom": s["scale"] + 4,
        "langSwitch": f(by["priyaHi"]["start"]),
        "whatsapp": mid(by["mozhiHi"]),
        "uses": [f(m) - 2 for m in by["uses"]["marks"][:4]],
        "oneAgent": f(by["uses"]["marks"][4]),
        "metrics": [f(m) for m in by["outcome"]["marks"]],
        "logo": f(by["brand"]["start"]) - 4,
    }
    tl = {
        "fps": FPS,
        "duration": int(DUR * FPS),
        "shots": shots,
        "clips": [{"id": c["id"], "who": c["who"], "text": c["text"], "start": f(c["start"]), "end": f(c["end"])} for c in clips],
        "cues": cue,
    }
    out = ROOT / "src/Mozhi/timeline.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(tl, indent=1, ensure_ascii=False))
    for x in shots:
        print(f"shot {x['id']:8s} {x['start'] / FPS:5.2f}-{x['end'] / FPS:5.2f}s")

    # ---------- mix ----------
    voice = np.zeros(N)
    for c in clips:
        a = c["audio"]
        if c["who"] == "narrator":
            a = narrator_chain(a)
        elif c["who"] == "priya":
            a = phone_line(a) * 0.9
        else:
            a = a * 0.9
        place(voice, a, c["start"])
    calls = phone_line(home_noise(by["priyaEn"]["start"] - 0.3, by["priyaHi"]["end"] + 0.3)) * 0.05

    sec = lambda frame: frame / FPS
    sfx = np.zeros(N)
    office = room(0.02)
    office[int(sec(s["meet"]) * SR):] = 0
    o0, o1 = int(sec(s["outcome"]) * SR), int(sec(s["end"]) * SR)
    office[o0:o1] = room(0.02)[o0:o1]
    sfx += office
    # Phones ringing until Mozhi arrives
    for at in np.arange(0.1, sec(cue["ringUntil"]) - 0.4, 2.2):
        place(sfx, ring_burst() * 0.07, at)
    for at in np.arange(0.9, sec(cue["ringUntil"]) - 0.8, 2.6):
        place(sfx, lowpass(ring_burst(), 1400) * 0.05, at)
    r = int(sec(cue["ringUntil"]) * SR)
    sfx[r - 2400: r] *= np.linspace(1, 0, 2400)
    sfx[r: int(sec(s["scale"]) * SR)] *= 0
    place(sfx, whoosh(0.8) * 0.1, sec(cue["reveal"]) - 0.3)
    place(sfx, ping(880, 1318, 0.12) * 0.1, sec(cue["reveal"]))
    for i in range(40):
        place(sfx, tick() * (0.05 + 0.03 * rng.random()), sec(cue["dialFrom"]) + i * 0.028 + rng.random() * 0.02)
    place(sfx, whoosh(0.5) * 0.08, sec(s["call"]) - 0.15)
    place(sfx, stamp() * 0.12, sec(cue["langSwitch"]))
    place(sfx, ping(1175, 1568) * 0.08, sec(cue["whatsapp"]))
    place(sfx, whoosh(0.5) * 0.07, sec(s["uses"]) - 0.15)
    for c in cue["uses"]:
        place(sfx, tick() * 0.12, sec(c))
    place(sfx, ping(1046, 1318) * 0.08, sec(cue["oneAgent"]))
    for c in cue["metrics"]:
        place(sfx, tick() * 0.1, sec(c))
    place(sfx, drum() * 0.45, sec(cue["logo"]))

    meter = pyln.Meter(SR)
    bed = music(sec(cue["reveal"]), sec(s["outcome"]), sec(s["end"]), sec(cue["logo"]))
    v_lufs = meter.integrated_loudness(voice)
    m_lufs = meter.integrated_loudness(bed[: int(sec(s["end"]) * SR)])
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
