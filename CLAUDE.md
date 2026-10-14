# Video Ad Studio

This folder is a video ad studio. Follow these rules for every ad.

## Stack

- **Video = Remotion** (TypeScript, React). Compositions live in `src/` and are registered in `src/Root.tsx`. Use the Remotion skills in `.claude/skills/` (start with `remotion-best-practices`).
- **Voice = edge-tts**, with word-boundary timestamps saved as JSON next to the audio:
  ```bash
  python3 scripts/tts.py "Line to speak" public/audio/<name>.mp3 --voice en-US-AriaNeural
  # -> public/audio/<name>.mp3 + public/audio/<name>.words.json  ([{text, start, end}] in seconds)
  ```
  Drive captions and word-synced animation from the `.words.json` file. Add the frame the voice `<Sequence>` starts on to each word's time.
  If the network blocks edge-tts (e.g. a sandboxed cloud container), add `--offline` to use espeak-ng with estimated timings in the same JSON format. Use this only for drafts and tests.
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

- Node 18+ (Remotion 4), ffmpeg, Python 3 + edge-tts.
- `npm run dev` opens Remotion Studio. `npm run lint` type-checks.
