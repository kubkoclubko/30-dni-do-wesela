# Builds episodes/ep05.json (shots, lids, rigs) - kept so the numbers can be tweaked and regenerated: py scripts/mk_ep05.py
import json
P = "ep05/"
I = {k: f"{P}{k}_2x.jpg" for k in ["s31_waiting_room", "s32_dermatologist", "s33_prescription", "s34_supermarket", "s35_kasia_checkout", "s36_home_mirror"]}
LIDS = {
 "s31_waiting_room": ([[0.5095, 0.4015, 0.016, 0.009], [0.569, 0.402, 0.023, 0.009]], "#e3a98f"),
 "s33_prescription": ([[0.5325, 0.3725, 0.016, 0.0125], [0.581, 0.3735, 0.016, 0.0125]], "#f2bfa0"),
 "s34_supermarket": ([[0.463, 0.337, 0.020, 0.012], [0.534, 0.338, 0.021, 0.012]], "#d8a28d"),
 "s35_kasia_checkout": ([[0.554, 0.346, 0.026, 0.013], [0.6235, 0.3455, 0.011, 0.0125]], "#d8a690"),
 "s36_home_mirror": ([[0.555, 0.556, 0.020, 0.008]], "#f0b496"),
}
n = 0
def S(at, img, zoom, focus, **kw):
    global n; n += 1
    s = {"at": at, "img": I[img], "zoom": zoom, "focus": focus, "seed": n}
    if img in LIDS: s["lids"], s["skin"] = LIDS[img]
    s.update(kw); return s
CLOCKS = [{"pos": [0.33, 0.105], "r": 0.035, "until": 5.4}, {"pos": [0.675, 0.143], "r": 0.038, "rps": 1.2, "until": 5.4}]
shots = [
 # vote result over a slow push on bored Mirek
 S(0, "s31_waiting_room", 1.2, [0.555, 0.41]),
 # timelapse clocks, then a slow re-frame onto his face, then the grandmas
 S(3.20, "s31_waiting_room", 1.45, [0.50, 0.27], cut=True, move="static", clocks=CLOCKS, keys=[{"at": 4.30, "focus": [0.555, 0.40], "zoom": 1.8, "dur": 0.9}]),
 S(5.46, "s31_waiting_room", 1.7, [0.255, 0.43], cut=True, move="static", clocks=CLOCKS, keys=[{"at": 6.62, "focus": [0.86, 0.47], "zoom": 1.7, "dur": 0.35}]),
 # HOOK: big zoom onto the magnifier with the giant pimples
 S(8.12, "s32_dermatologist", 1.0, [0.47, 0.42], to=[0.47, 0.40], zoomTo=1.8, free=True),
 # hair stands up (clip), punch + shake on "dęba"
 S(10.48, "s32_dermatologist", 1.3, [0.40, 0.42], cut=True, punch=12.02, shake=12.06,
   clip={"src": P + "s32_dermatologist.mp4", "at": 11.25, "from": 1.22, "until": 12.84}),
 # tilt down the endless prescription, the three icons pop on their words
 S(12.84, "s33_prescription", 1.6, [0.47, 0.40], to=[0.36, 0.80], move="tiltDown", free=True,
   pops=[{"at": 15.80, "pos": [0.52, 0.50], "r": 0.065}, {"at": 16.84, "pos": [0.51, 0.585], "r": 0.055}, {"at": 17.46, "pos": [0.495, 0.665], "r": 0.06}]),
 S(19.14, "s34_supermarket", 1.2, [0.52, 0.40], transition="whip"),
 S(21.61, "s34_supermarket", 1.3, [0.52, 0.40], to=[0.50, 0.35], zoomTo=1.8, move="tiltDown", free=True, cut=True),
 S(23.68, "s35_kasia_checkout", 1.15, [0.60, 0.42]),
 S(25.45, "s35_kasia_checkout", 1.65, [0.775, 0.385], cut=True, punch=25.55),
 S(28.80, "s35_kasia_checkout", 1.6, [0.57, 0.37], cut=True,
   clip={"src": P + "s35_kasia_checkout.mp4", "at": 29.30, "from": 0.75, "until": 31.36}),
 # SMS from Kasia, cheeks blush while he reads
 S(31.36, "s36_home_mirror", 1.4, [0.60, 0.64], blush={"at": 34.30, "pos": [[0.60, 0.58]], "r": 0.06, "dur": 1.0}),
 S(35.57, "s36_home_mirror", 1.0, [0.50, 0.50], cut=True, move="bounce"),
]
F = lambda outline, head, neck, feet, facing, seed=1: {"outline": outline, "head": head, "neck": neck, "feet": feet, "facing": facing, "seed": seed}
rigs = {
 I["s31_waiting_room"]: {"figures": [F([[0.50,0.31],[0.66,0.31],[0.70,0.42],[0.76,0.50],[0.78,0.66],[0.62,0.70],[0.40,0.70],[0.33,0.62],[0.38,0.50],[0.48,0.44]], [0.56,0.40,0.09,0.08], [0.56,0.47], 0.92, 0),
                                     F([[0.81,0.41],[0.97,0.41],[1.0,0.55],[0.99,0.80],[0.74,0.82],[0.72,0.62],[0.78,0.52]], [0.87,0.47,0.07,0.06], [0.87,0.53], 0.95, -1, 2)]},
 I["s32_dermatologist"]: {"figures": [F([[0.10,0.27],[0.36,0.27],[0.37,0.45],[0.30,0.52],[0.30,0.62],[0.15,0.75],[0.0,0.78],[0.0,0.45]], [0.25,0.40,0.10,0.08], [0.22,0.48], 0.92, 1)]},
 I["s33_prescription"]: {"figures": [F([[0.15,0.24],[0.38,0.24],[0.40,0.40],[0.30,0.50],[0.25,0.65],[0.22,0.82],[0.03,0.82],[0.02,0.55],[0.08,0.40]], [0.29,0.33,0.11,0.09], [0.28,0.41], 0.83, 1),
                                     F([[0.55,0.28],[0.75,0.28],[0.80,0.45],[0.84,0.60],[0.75,0.68],[0.63,0.68],[0.56,0.45]], [0.64,0.38,0.10,0.08], [0.63,0.45], 0.92, -1, 2)]},
 I["s34_supermarket"]: {"figures": [F([[0.42,0.24],[0.68,0.24],[0.72,0.40],[0.84,0.50],[0.86,0.70],[0.72,0.90],[0.30,0.92],[0.24,0.70],[0.25,0.55],[0.40,0.42]], [0.55,0.34,0.11,0.10], [0.55,0.45], 0.94, 0)]},
 I["s35_kasia_checkout"]: {"figures": [F([[0.42,0.24],[0.64,0.24],[0.68,0.40],[0.74,0.48],[0.80,0.62],[0.72,0.90],[0.30,0.92],[0.28,0.70],[0.27,0.55],[0.40,0.42]], [0.54,0.35,0.10,0.09], [0.54,0.44], 0.94, -1),
                                       F([[0.71,0.32],[0.86,0.32],[0.90,0.45],[0.93,0.62],[0.84,0.66],[0.77,0.52],[0.70,0.44]], [0.78,0.38,0.07,0.06], [0.78,0.44], 0.70, -1, 2)]},
 I["s36_home_mirror"]: {"figures": [F([[0.46,0.40],[0.78,0.40],[0.80,0.58],[0.92,0.66],[0.99,0.80],[0.97,1.0],[0.45,1.0],[0.30,0.80],[0.28,0.70],[0.46,0.62]], [0.62,0.53,0.14,0.10], [0.66,0.62], 1.2, -1)]},
}
ep = {
 "id": "ep05", "day": 5, "daysLeft": 26, "durationSec": 46.7, "imgSize": [1536, 2752],
 "voice": P + "voice.mp3", "words": P + "words.json", "music": True, "autoSfx": False,
 "highlight": ["Dermatolog", "osiemdziesiąt", "procent", "trzy", "godziny", "złodzieja", "lupę", "dęba", "Recepta", "hot-dogów", "wody", "maść",
               "Biedronki", "maścią", "Kasię", "maseczka", "SMS", "maseczką", "Siłownia", "wąsy", "dziesięciu", "tysięcy", "pięć"],
 "vote": {"title": "WYNIK GŁOSOWANIA", "a": {"label": "DERMATOLOG", "votes": 80}, "b": {"label": "OGOLIĆ SIĘ", "votes": 20}, "dur": 3.1, "stamp": "WYGRYWA!"},
 "shots": shots,
 "phone": [{"at": 31.9, "until": 35.4, "name": "Kasia", "subtitle": "online", "y": 1250, "scale": 0.62,
            "messages": [{"at": 32.5, "from": "them", "text": "Ładnie wyglądałeś. Nawet z tą maseczką 😉", "typing": 0.45}]}],
 "end": {"type": "choice", "at": 35.57, "title": "CO DALEJ?", "a": {"label": "SIŁOWNIA", "icon": "🏋️"}, "b": {"label": "WĄSY", "icon": "🥸"},
         "cta": "NAPISZ W KOMENTARZU: SIŁOWNIA albo WĄSY", "capY": 1640,
         "follow": {"at": 39.22, "count": 5000, "goal": 10000, "label": "OBSERWUJĄCYCH", "button": "OBSERWUJ"}},
 "rigs": rigs,
 "sfx": [{"at": 1.27, "name": "pop"}, {"at": 3.25, "name": "tick"}, {"at": 11.55, "name": "boing"}, {"at": 32.95, "name": "blip"}, {"at": 40.25, "name": "pop"}],
}
json.dump(ep, open("episodes/ep05.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
