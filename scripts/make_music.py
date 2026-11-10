# usage: python scripts/make_music.py   -> public/shared/music.mid + public/shared/music.mp3 (stereo, 44.1 kHz, -16 LUFS)
# Original playful "ironic documentary" piano: 95 BPM, C major, left hand C - Am - F - G (bass + off-beat chords),
# right hand short staccato melody; 8 bars, then 8 bars again with small variations, a 2-bar tag and a final
# C chord ringing out (~48 s). No fluidsynth on this PC, so the MIDI is rendered by a small numpy piano model
# (fundamental + 4 harmonics, fast attack, exponential decay, light convolution reverb). No samples, no soundfont.
import os, struct, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve

BPM, SR = 95, 44100
BEAT = 60 / BPM
OUT = "public/shared"
N = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def m(s):  # "E5" -> MIDI number
    return 12 * (int(s[-1]) + 1) + N[s[:-1]]

CHORDS = [("C3", ["E3", "G3", "C4"]), ("A2", ["E3", "A3", "C4"]), ("F2", ["F3", "A3", "C4"]), ("G2", ["G3", "B3", "D4"])]
# right hand per bar: 8 eighths, "." = rest, "x+y" = grace x then y on the same eighth
A = [
    "E5 . G5 . E5 D5 C5 .", "C5 . E5 . A5 . G5 E5", "F5 . A5 . C6 . A5 F5", "G5 . B5 . D6 . B5 .",
    "E5 G5 . E5 . C5 D5 .", "E5 . C5 . A4 . C5 E5", "F5 A5 . F5 . C5 A4 .", "D5 E5 F5 G5 . . B4 .",
]
A2 = [  # the repeat, with small variations (grace notes, an octave lift, a new turn at the end)
    "D#5+E5 . G5 . E5 D5 C5 .", "C5 . E5 . A5 . B5 A5", "F5 . A5 . C6 D6 C6 A5", "G5 . B5 . D6 . F6 .",
    "E5 G5 . E5 . C5 D5 .", "E5 . C5 . A4 . C5 E5", "F5 A5 . F5 . A5 C6 .", "B5 . G5 . D5 . G4 .",
]
TAG = ["C6 . G5 . E5 . C5 .", "D5 . B4 . G4 . . ."]

notes = []  # (start s, dur s, midi, velocity)
def bar(i, rh, chord, last=False):
    t0 = i * 4 * BEAT
    bass, ch = chord
    notes.append((t0, 0.45, m(bass), 0.75))
    notes.append((t0 + 2 * BEAT, 0.35, m(bass) + 7, 0.55))
    for b in (1, 3):
        for c in ch:
            notes.append((t0 + b * BEAT, 0.22, m(c), 0.42))
    for k, tok in enumerate(rh.split()):
        if tok == ".":
            continue
        t = t0 + k * BEAT / 2
        if "+" in tok:
            g, tok = tok.split("+")
            notes.append((t - 0.05, 0.05, m(g), 0.45))
        notes.append((t, 0.16, m(tok), 0.7 + 0.08 * ((k % 4) == 0)))

i = 0
for part in (A, A2):
    for k, rh in enumerate(part):
        bar(i, rh, CHORDS[k % 4]); i += 1
for k, rh in enumerate(TAG):
    bar(i, rh, CHORDS[0] if k == 0 else CHORDS[3]); i += 1
end = i * 4 * BEAT
for c, v in (("C3", 0.7), ("G3", 0.5), ("C4", 0.5), ("E4", 0.5), ("G4", 0.45), ("C5", 0.55)):
    notes.append((end, 4.5, m(c), v))  # final C chord, left to ring out

# ---- MIDI file (type 0, 480 ppq) ----
def vlq(n):
    b = [n & 0x7F]
    while n > 127:
        n >>= 7; b.insert(0, (n & 0x7F) | 0x80)
    return bytes(b)
PPQ = 480
ev = []
for s, d, n, v in notes:
    ev.append((round(s / BEAT * PPQ), 0x90, n, int(v * 110)))
    ev.append((round((s + d) / BEAT * PPQ), 0x80, n, 0))
ev.sort(key=lambda e: (e[0], e[1] == 0x90))
trk, last = bytearray(), 0
trk += b"\x00\xff\x51\x03" + struct.pack(">I", round(60e6 / BPM))[1:]
trk += b"\x00\xc0\x00"  # program 0: acoustic grand piano
for t, st, n, v in ev:
    trk += vlq(max(0, t - last)) + bytes([st, n, v]); last = t
trk += b"\x00\xff\x2f\x00"
os.makedirs(OUT, exist_ok=True)
open(f"{OUT}/music.mid", "wb").write(b"MThd" + struct.pack(">IHHH", 6, 0, 1, PPQ) + b"MTrk" + struct.pack(">I", len(trk)) + trk)

# ---- numpy piano ----
total = end + 5.0
L = np.zeros(int(total * SR)); R = np.zeros_like(L)
H = [1.0, 0.45, 0.28, 0.16, 0.09]
for s, d, n, v in notes:
    f0 = 440 * 2 ** ((n - 69) / 12)
    ring = d + 0.08 if d < 1 else d
    tt = np.arange(int((ring + 0.12) * SR)) / SR
    decay = np.exp(-tt * (1.2 + f0 / 260))  # higher notes die faster
    y = sum(a * np.sin(2 * np.pi * f0 * (k + 1) * (1 + 0.0004 * k * k) * tt) * np.exp(-tt * k * 1.5) for k, a in enumerate(H))
    env = np.minimum(1, tt / 0.004) * decay
    env *= np.clip((ring + 0.12 - tt) / 0.12, 0, 1)  # release (staccato)
    y = y * env * v
    i0 = int(s * SR)
    pan = np.clip((n - 60) / 40, -0.5, 0.5)  # low notes a bit left, high a bit right
    L[i0:i0 + len(y)] += y * (1 - pan) * 0.5
    R[i0:i0 + len(y)] += y * (1 + pan) * 0.5
rng = np.random.default_rng(7)
it = np.arange(int(1.4 * SR)) / SR
irL = rng.standard_normal(len(it)) * np.exp(-it * 4.5); irR = rng.standard_normal(len(it)) * np.exp(-it * 4.5)
irL[0] = irR[0] = 0
wetL = fftconvolve(L, irL)[: len(L)]; wetR = fftconvolve(R, irR)[: len(R)]
g = np.sqrt((L ** 2).mean() / max(1e-12, (wetL ** 2).mean()))
L, R = L + 0.22 * g * wetL, R + 0.22 * g * wetR
peak = max(np.abs(L).max(), np.abs(R).max())
pcm = (np.stack([L, R], 1) / peak * 0.8 * 32767).astype(np.int16)
import wave
with wave.open(f"{OUT}/music_raw.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/music_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ar", "44100", "-ac", "2", "-b:a", "192k", f"{OUT}/music.mp3"], check=True)
os.remove(f"{OUT}/music_raw.wav")
print(f"{len(notes)} notes, {i} bars + final chord, {total:.1f} s")
