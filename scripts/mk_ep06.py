# Builds episodes/ep06.json (shots, rigs) - kept so the numbers can be tweaked and regenerated: py scripts/mk_ep06.py
import json
P = "ep06/"
I = lambda k: f"{P}{k}_2x.jpg"
GYM, SWT, BEN, SLF, BF, MIR = (I(k) for k in ["s61_gym_entrance", "s62_sweaty", "s63_bench_press", "s64_selfie", "s65_boyfriend", "s66_home_mirror"])
WINK, CRY, PHONE, SHOCK = (I(k) for k in ["s65_wink", "s65_cry", "s66_phone", "s66_shock"])
BFV, PHV = P + "s65_boyfriend.mp4", P + "s66_phone_reaction.mp4"
n = 0
def S(at, img, zoom, focus, **kw):
    global n; n += 1
    s = {"at": at, "img": img, "zoom": zoom, "focus": focus, "seed": n}
    s.update(kw); return s
shots = [
 # 1 vote over a slow push on nervous Mirek, then a tilt down to the belly on "pierwszy raz w zyciu"
 S(0, GYM, 1.2, [0.52, 0.40]),
 S(6.44, GYM, 1.3, [0.52, 0.40], move="static"),
 S(7.70, GYM, 1.3, [0.52, 0.40], to=[0.50, 0.67], move="tiltDown", free=True),
 # 2 treadmill: constant light shake, zoom 1.8 on the red face at "defibrylatora"
 S(9.32, SWT, 1.2, [0.44, 0.45], move="static", shake=9.40),
 S(10.40, SWT, 1.2, [0.44, 0.45], move="static", shake=10.45),
 S(11.45, SWT, 1.2, [0.44, 0.45], move="static", shake=11.50),
 S(12.30, SWT, 1.2, [0.44, 0.45], move="static", keys=[{"at": 12.34, "focus": [0.43, 0.40], "zoom": 1.8, "dur": 0.6}]),
 # 3 bench press: up from the shaking hands to the empty bar, empty end, punch on the face
 S(13.53, BEN, 1.5, [0.60, 0.62], to=[0.45, 0.40], move="tiltDown", free=True),
 S(16.30, BEN, 1.8, [0.28, 0.41], cut=True, move="static"),
 S(17.45, BEN, 1.7, [0.70, 0.60], cut=True, punch=17.90, shake=17.96),
 # 4 selfie: pink dumbbells with a pop, water break, whip up to the phone + camera flash
 S(18.86, SLF, 1.15, [0.55, 0.55]),
 S(19.43, SLF, 1.7, [0.62, 0.70], cut=True, pops=[{"at": 19.88, "pos": [0.71, 0.91], "r": 0.10}]),
 S(21.93, SLF, 1.25, [0.55, 0.55], cut=True),
 S(24.39, SLF, 1.3, [0.52, 0.50], cut=True),
 S(24.98, SLF, 1.8, [0.40, 0.35], cut=True, move="static", transition="whip", flash=25.38),
 # 5 boyfriend: tilt up from the legs to the face, the clip lifts the barbell with one hand, wink, Mirek cries
 S(25.78, BF, 1.6, [0.69, 0.68], to=[0.66, 0.31], move="tiltDown", free=True),
 S(29.04, BF, 1.3, [0.55, 0.35], cut=True, move="static"),
 S(30.20, BF, 1.3, [0.55, 0.35], move="static", clip={"src": BFV, "at": 30.20, "from": 0.0, "until": 32.70}),
 S(32.70, WINK, 1.5, [0.68, 0.30]),
 S(36.02, CRY, 1.0, [0.5, 0.5], move="static", clip={"src": BFV, "at": 36.02, "from": 6.0, "until": 37.90}),
 # 6 home mirror: whip in, push on the mirror, biceps clip, belly, beard
 S(37.98, MIR, 1.15, [0.60, 0.50], transition="whip"),
 S(40.55, MIR, 1.0, [0.5, 0.5], cut=True, move="static", clip={"src": PHV, "at": 40.55, "from": 0.0, "until": 43.10}),
 S(43.10, MIR, 1.7, [0.70, 0.56], cut=True),
 S(45.20, MIR, 1.8, [0.72, 0.46], cut=True),
 # 7 phone: clip -> freeze with the chat -> clip into the shocked face (punch + shake on "Chlopak?") -> freeze + end card
 S(47.04, PHONE, 1.0, [0.5, 0.5], zoomTo=1.03, clip={"src": PHV, "at": 47.04, "from": 3.9, "until": 48.24}),
 S(48.24, PHONE, 1.03, [0.5, 0.5], zoomTo=1.06),
 S(51.75, PHONE, 1.06, [0.5, 0.5], zoomTo=1.10, punch=52.12, shake=52.17, clip={"src": PHV, "at": 51.75, "from": 5.1, "until": 54.53}),
 S(54.53, SHOCK, 1.0, [0.5, 0.5], move="bounce"),
]
F = lambda outline, head, neck, feet, facing, seed=1: {"outline": outline, "head": head, "neck": neck, "feet": feet, "facing": facing, "seed": seed}
rigs = {
 GYM: {"figures": [F([[0.30,0.47],[0.78,0.47],[0.80,0.60],[0.72,0.75],[0.70,0.93],[0.28,0.95],[0.27,0.75],[0.28,0.60]], [0.53,0.37,0.12,0.09], [0.53,0.46], 0.96, 0)]},
 SWT: {"figures": [F([[0.22,0.47],[0.66,0.47],[0.70,0.60],[0.72,0.74],[0.60,0.78],[0.58,0.93],[0.28,0.93],[0.25,0.78],[0.20,0.60]], [0.43,0.39,0.14,0.08], [0.43,0.47], 0.94, 0)]},
 SLF: {"figures": [F([[0.30,0.45],[0.80,0.45],[0.80,0.66],[0.66,0.74],[0.52,0.85],[0.10,0.90],[0.05,0.78],[0.20,0.60]], [0.68,0.40,0.12,0.08], [0.62,0.47], 0.95, 0)]},
 BF: {"figures": [F([[0.30,0.50],[0.74,0.50],[0.80,0.68],[0.62,0.80],[0.45,0.92],[0.08,0.92],[0.05,0.78],[0.20,0.60]], [0.50,0.45,0.10,0.08], [0.50,0.52], 0.95, 0),
                   F([[0.58,0.25],[0.99,0.25],[0.99,0.55],[0.93,0.78],[0.62,0.78],[0.60,0.50]], [0.73,0.175,0.075,0.07], [0.73,0.24], 0.78, 0, 2)]},
 MIR: {"figures": [F([[0.20,0.41],[0.68,0.41],[0.70,0.58],[0.66,0.76],[0.62,0.91],[0.22,0.91],[0.18,0.70],[0.16,0.55]], [0.47,0.34,0.13,0.10], [0.47,0.42], 0.90, 1)]},
}
ep = {
 "id": "ep06", "day": 6, "daysLeft": 25, "durationSec": 63.4, "imgSize": [1536, 2752],
 "voice": P + "voice.mp3", "words": P + "words.json", "music": True, "autoSfx": False,
 "highlight": ["czterysta", "siłownię", "defibrylatora", "sztanga", "wygrywa", "Hantle", "różowe", "Instagrama", "Nagle", "samochodem",
               "Uśmiecha", "godzina", "lustrem", "telefon", "Kasia", "chłopak", "Chłopak", "chłopaka"],
 "vote": {"title": "WYNIK GŁOSOWANIA", "sub": "400+ KOMENTARZY", "a": {"label": "SIŁOWNIA", "votes": 82}, "b": {"label": "WĄSY", "votes": 18}, "dur": 3.6, "stamp": "WYGRYWA!"},
 "shots": shots,
 "phone": [{"at": 48.40, "until": 52.00, "name": "Kasia", "subtitle": "online", "y": 1250, "scale": 0.62,
            "messages": [{"at": 48.85, "from": "them", "text": "Mój chłopak mówi, że widział cię dziś na siłowni 😂", "typing": 0.45}]}],
 "end": {"type": "choice", "at": 54.53, "title": "CO DALEJ?", "a": {"label": "ODPISAĆ KASI", "icon": "💌"}, "b": {"label": "ZNÓW SIŁOWNIA", "icon": "🏋️"},
         "cta": "NAPISZ W KOMENTARZU: KASIA albo SIŁOWNIA", "capY": 1640,
         "follow": {"at": 58.1, "count": 5000, "goal": 10000, "label": "OBSERWUJĄCYCH", "button": "OBSERWUJ"}},
 "rigs": rigs,
 "sfx": [{"at": 1.27, "name": "pop"}, {"at": 17.92, "name": "clink"}, {"at": 25.38, "name": "shutter"}, {"at": 49.30, "name": "blip"}, {"at": 52.12, "name": "dun"}],
}
json.dump(ep, open("episodes/ep06.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
