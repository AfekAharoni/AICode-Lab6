# TCP vs UDP: an explainer video

A ~2:17 explainer about the two ways to send data over the internet:
**TCP** makes sure every packet arrives, in order, by waiting for acknowledgments and
retransmitting lost ones; **UDP** just sends packets without checking, so it's faster and
used for video calls and games, while TCP is used for web pages and file downloads.

Made for AICODE 67723 (Agentic Programming), Week 6 lab, with Claude Code.

## Stack
- **Remotion**: every visual is drawn in code (React divs + SVG); no generated images
- **Kokoro** (`kokoro-onnx`, voice `af_heart`): narration, one WAV per scene
- **ffmpeg**: final compression and loudness normalization

## Layout
| Path | What |
|---|---|
| `SCRIPT.md` | scene-by-scene plan: visuals + narration |
| `src/theme.ts` | shared colors, layout, animation helpers |
| `src/components/` | shared building blocks: Sender/Receiver, wire, Packet, ACK, timer ring |
| `src/scenes/S0N*.tsx` | one file per scene, so scenes can be built in parallel |
| `src/Root.tsx` | chains the scenes into the `Main` composition |
| `narration/tts.py` | Kokoro text-to-speech |
| `public/narration/` | generated narration + `durations.md` |

## Commands
```bash
npm run dev                                   # preview in Remotion Studio
.venv/bin/python narration/tts.py "text" public/narration/s01.wav af_heart 1.0
npx remotion render Main out/render-NN.mp4    # full render (new number every time)
scripts/finalize.sh out/render-NN.mp4         # → out/final-NN.mp4 for upload
```
The Kokoro model files (`narration/models/`) are not in git (115 MB). Download
`kokoro-v1.0.int8.onnx` and `voices-v1.0.bin` from the kokoro-onnx releases.
