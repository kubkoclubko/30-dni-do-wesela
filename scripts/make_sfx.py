# usage: python scripts/make_sfx.py   -> public/shared/sfx/{water,gurgle,buzz}.wav (48 kHz mono, synthesised in numpy,
# our own sounds, free for commercial use). Levels are set in public/shared/sfx/sfx.json.
import wave
import numpy as np
SR = 48000
rng = np.random.default_rng(7)
def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    w = wave.open(f"public/shared/sfx/{name}.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
def lp(x, a):  # one-pole low-pass, a = 0..1 (higher = darker)
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = a * s + (1 - a) * v; y[i] = s
    return y
def fade(x, i, o):
    n = len(x); e = np.ones(n); e[: int(i * SR)] = np.linspace(0, 1, int(i * SR)); e[n - int(o * SR):] = np.linspace(1, 0, int(o * SR)); return x * e
# water: 9.5 s of shower hiss (band-limited noise, slow swell) + sparse droplets
n = int(9.5 * SR); t = np.arange(n) / SR
hiss = lp(rng.standard_normal(n), 0.55) - lp(rng.standard_normal(n), 0.97) * 0.6
hiss *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.31 * t) * np.sin(2 * np.pi * 0.17 * t + 1)
for k in rng.uniform(0, 9.4, 70):
    i = int(k * SR); L = int(0.03 * SR); f0 = rng.uniform(900, 2400)
    tt = np.arange(L) / SR; hiss[i:i + L] += 0.9 * np.sin(2 * np.pi * f0 * (1 + 3 * tt) * tt) * np.exp(-tt * 140)
save("water", fade(hiss, 0.5, 0.6))
# gurgle: ~0.9 s of low bubbly blips (rising pitch), filtered noise underneath
n = int(0.9 * SR); x = lp(rng.standard_normal(n), 0.985) * 3
for j, k in enumerate(np.sort(rng.uniform(0, 0.7, 9))):
    i = int(k * SR); L = int(0.09 * SR); tt = np.arange(L) / SR; f0 = rng.uniform(110, 210)
    x[i:i + L] += np.sin(2 * np.pi * (f0 * tt + 900 * tt * tt)) * np.exp(-tt * 38) * (1.2 if j % 3 == 0 else 0.7)
save("gurgle", fade(x, 0.01, 0.25))
# buzz: phone vibration, two 0.22 s pulses of a 170 Hz motor (odd harmonics, slight wobble)
n = int(0.62 * SR); t = np.arange(n) / SR
motor = np.sign(np.sin(2 * np.pi * 170 * t + 0.4 * np.sin(2 * np.pi * 9 * t))) * 0.6 + np.sin(2 * np.pi * 170 * t)
env = ((t < 0.22) | ((t > 0.36) & (t < 0.58))).astype(float)
env = np.convolve(env, np.ones(240) / 240, "same")
save("buzz", lp(motor * env, 0.6))
