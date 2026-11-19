"""Text-to-speech with Kokoro.
Usage: .venv/bin/python narration/tts.py "Text to speak" public/out.wav [voice] [speed]
Voices: af_heart, af_bella, am_michael, bm_george, ... (see voices list in kokoro-onnx docs)
"""
import sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

here = Path(__file__).resolve().parent
text = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "public/narration.wav"
voice = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0

kokoro = Kokoro(str(here / "models/kokoro-v1.0.int8.onnx"), str(here / "models/voices-v1.0.bin"))
samples, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
Path(out).parent.mkdir(parents=True, exist_ok=True)
sf.write(out, samples, sr)
print(f"Wrote {out} ({len(samples)/sr:.2f}s)")
