# usage: python scripts/fix_words.py public/epXX [cutoff seconds]   (<dir>/words_raw.json + <dir>/voice.wav -> <dir>/words.json)
# Optional <dir>/fix.json: {"fix": {"whisper": "script"}, "hand": [["word", approx_start, new_start]]}  (no code change per episode)
# cutoff: drop words starting at/after it (a garbled TTS tail you cut from voice.wav). Spellings go in <dir>/fix.json.
# Hand fixes: script spelling, hyphenated names merged, garbled TTS tail dropped; starts that follow a pause are
# snapped to the energy onset (10 ms envelope), ends that run into a pause are snapped to the energy fall.
import json, sys, wave
import numpy as np
V = sys.argv[1].rstrip("/\\") + "/"
CUT = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9
raw = json.load(open(V + "words_raw.json", encoding="utf-8"))
w = wave.open(V + "voice.wav"); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
hop = sr // 100
env = np.array([np.sqrt((a[i:i + hop] ** 2).mean()) for i in range(0, len(a) - hop, hop)])
quiet = 20 * np.log10(env + 1e-9) < -38
dur = len(a) / sr
out = []
for x in raw:
    if x["s"] >= CUT: continue  # garbled TTS tail (cut from voice.wav)
    if x["w"].startswith("-") and out:
        out[-1]["w"] += x["w"]; out[-1]["e"] = x["e"]; continue
    out.append(dict(x))
import os
CFG = json.load(open(V + "fix.json", encoding="utf-8")) if os.path.exists(V + "fix.json") else {}
FIX = CFG.get("fix", {})  # whisper -> script spelling
for x in out: x["w"] = FIX.get(x["w"].lower(), x["w"])
def onset(s):
    i = int(s * 100); lo = max(0, i - 15); seg = quiet[lo:i + 8]
    if not seg.any(): return s
    return round(min(lo + int(np.where(seg)[0][-1]) + 1, i + 8) / 100, 2)
def fall(e):
    i = int(e * 100); seg = quiet[i - 8:i + 15]
    if not seg.any(): return e
    return round((i - 8 + int(np.where(seg)[0][0])) / 100, 2)
for k, x in enumerate(out):
    if k == 0 or x["s"] - out[k - 1]["e"] > 0.08: x["s"] = onset(x["s"])
    if k == len(out) - 1 or out[k + 1]["s"] - x["e"] > 0.08: x["e"] = max(x["s"] + 0.05, fall(x["e"]))
    x.pop("p", None)
# hand fixes from the energy envelope (2026-11-09): (word, approx start) -> new start; previous word ends 0.06 s before
HAND = CFG.get("hand", [])
for w_, s0, s1 in HAND:
    for k, x in enumerate(out):
        if x["w"] == w_ and abs(x["s"] - s0) < 0.05:
            x["s"] = s1; out[k - 1]["e"] = min(out[k - 1]["e"], round(s1 - 0.06, 2))
json.dump(out, open(V + "words.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(len(out), "words, last ends", out[-1]["e"], "audio", round(dur, 2))
print(" ".join(f"{x['w']}[{x['s']:.2f}]" for x in out))
