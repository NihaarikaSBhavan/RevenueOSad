# Video Ad Studio

This folder is a video ad studio. Follow these rules for every ad.

## Stack

- **Video = Remotion** (TypeScript, React). Compositions live in `src/` and are registered in `src/Root.tsx`. Use the Remotion skills in `.claude/skills/` (start with `remotion-best-practices`).
- **Voice = edge-tts**, with word-boundary timestamps saved as JSON next to the audio:
  ```bash
  python3 scripts/tts.py "Line to speak" public/audio/<name>.mp3
  # -> public/audio/<name>.mp3 + public/audio/<name>.words.json  ([{text, start, end}] in seconds)
  ```
  Drive captions and word-synced animation from the `.words.json` file. Add the frame the voice `<Sequence>` starts on to each word's time.
  - `--engine auto` (default): edge-tts, falling back to **Kokoro** (free, local, Apache 2.0) when the network blocks edge-tts (as in sandboxed cloud containers).
  - `--engine kokoro --voice af_heart` forces Kokoro. Good voices: `af_heart`, `af_bella`, `af_nicole`, `am_michael`, `am_fenrir`, `bf_emma`, `bm_george`. Its word timings are estimated (phoneme counts, snapped to real pauses), so check caption sync in a still.
  - `--engine espeak` is robotic; drafts only. `--rate +10%` speeds up any engine.
  - First-time Kokoro setup (~350 MB model, git-ignored): `bash scripts/setup-kokoro.sh`
- **Sound = SFX from `/public/sfx`** (or generated with ffmpeg, e.g. filtered noise for whooshes) **plus a soft music bed** (keep it low, around volume 0.1–0.15, under the voice).

## Assets

- All assets live in `/public`: `public/audio`, `public/sfx`, `public/images`.
- Always load them with `staticFile()`, e.g. `staticFile("sfx/whoosh.mp3")`. Never use absolute paths or imports for media.

## Workflow

1. Write the script, then generate the voice and timestamps.
2. Build each scene. **Always render a still per scene before animating** and check the layout:
   ```bash
   npx remotion still <CompositionId> out/<scene>.png --frame=<n>
   ```
3. Animate once the stills look right.
4. **Render final MP4s to `/out`**:
   ```bash
   npx remotion render <CompositionId> out/<name>.mp4
   ```

## Tools

- Node 18+ (Remotion 4), ffmpeg, Python 3 (`pip install -r requirements.txt`): edge-tts, kokoro-onnx.
- `npm run dev` opens Remotion Studio. `npm run lint` type-checks.
