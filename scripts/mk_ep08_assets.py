# ep08 assets: selfie "phone screen" for the boyfriend's phone mock + a wood creak SFX (appended to sfx.json)
import json, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
src = Image.open("public/ep08/s81_cool_text_2x.jpg").convert("RGB")
W, H = src.size
ph = int(H * 0.744)
y0 = int(H * 0.24)
photo = src.crop((0, y0, W, y0 + ph)).resize((580, 773), Image.LANCZOS)
im = Image.new("RGB", (580, 1257), (16, 16, 20))
d = ImageDraw.Draw(im)
fnt = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 30)
small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)
d.ellipse((24, 150, 84, 210), fill=(90, 111, 216)); d.text((40, 160), "M", fill="white", font=fnt)
d.text((100, 158), "mirek_bez_stresu", fill="white", font=fnt); d.text((100, 192), "Wysłano przed chwilą", fill=(160, 160, 170), font=small)
d.text((24, 60), "Wiadomości", fill="white", font=fnt)
im.paste(photo, (0, 235))
d.text((24, 1030), "Hej, byłem zajęty. Wiesz, treningi 😎"[:36], fill="white", font=small)
d.text((24, 1080), "♡   ◯   ➤", fill="white", font=fnt)
im.save("public/ep08/selfie_phone.png")
# creak: rough wood creak = sawtooth-ish pulses, pitch wobble, band-limited
SR = 48000; n = int(1.1 * SR); t = np.arange(n) / SR
rng = np.random.default_rng(8)
f = 140 + 60 * np.sin(2 * np.pi * 3.1 * t) + 90 * t + rng.standard_normal(n).cumsum() * 0.02
ph_ = np.cumsum(f) / SR
x = (ph_ % 1.0) * 2 - 1
x *= (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * t + 3 * np.sin(2 * np.pi * 2.3 * t)))) * 0.8 + 0.2
a = 0.85; y = np.empty_like(x); s = 0.0
for i, v in enumerate(x): s = a * s + (1 - a) * v; y[i] = s
env = np.minimum(1, t / 0.08) * np.minimum(1, (1.1 - t) / 0.35)
y = y * env; y = y / np.abs(y).max() * 0.89
w = wave.open("public/shared/sfx/creak.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes()); w.close()
c = json.load(open("public/shared/sfx/sfx.json", encoding="utf-8")); c["creak"] = {"file": "creak.wav", "db": -11}
json.dump(c, open("public/shared/sfx/sfx.json", "w", encoding="utf-8"), indent=1)
