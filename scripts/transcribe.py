# usage: python scripts/transcribe.py <voice.mp3|wav> <words_raw.json> [lang=pl] [model=medium]   (needs: python -m pip install faster-whisper; ffmpeg on PATH)
# decodes with ffmpeg to 16 kHz mono (PyAV's decoder fails on this machine), then word-timestamps with faster-whisper
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
LANG = sys.argv[3] if len(sys.argv) > 3 else "pl"
MODEL = sys.argv[4] if len(sys.argv) > 4 else "medium"  # multilingual; large-v3 is better but ~3x slower on CPU
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
model = WhisperModel(MODEL, device="cpu", compute_type="int8")
segs, info = model.transcribe(audio, language=LANG, word_timestamps=True, beam_size=5, vad_filter=False)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
json.dump(words, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(len(words), "words", round(len(audio) / 16000, 2), "s")
