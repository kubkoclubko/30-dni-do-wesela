# Builds episodes/ep04.json (shots, lids, rigs) - kept so the numbers can be tweaked and regenerated: py scripts/mk_ep04.py
import json
P = "ep04/"
I = {k: f"{P}{k}_2x.jpg" for k in ["s24_wardrobe","s25_mama_money","s26_buttons_pop","s27_new_outfit","s28_kasia_escalator","s29_mannequin","s30_sms_evening"]}
LIDS = {
 "s24_wardrobe": ([[0.7075,0.35,0.0165,0.0155]], "#eab394"),
 "s25_mama_money": ([[0.71,0.3645,0.0165,0.010],[0.77,0.372,0.0195,0.0125]], "#eeb79d"),
 "s26_buttons_pop": ([[0.40,0.34,0.0255,0.015],[0.477,0.341,0.021,0.0145]], "#eaa889"),
 "s27_new_outfit": ([[0.247,0.36,0.0195,0.0075],[0.304,0.358,0.015,0.0075]], "#f6b896"),
 "s28_kasia_escalator": ([[0.68,0.4908,0.0165,0.010],[0.748,0.493,0.0195,0.011]], "#f4b89b"),
 "s30_sms_evening": ([[0.4068,0.4007,0.0175,0.0068],[0.465,0.4067,0.015,0.007]], "#f29f88"),
}
n = 0
def S(at, img, zoom, focus, **kw):
    global n; n += 1
    s = {"at": at, "img": I[img], "zoom": zoom, "focus": focus, "seed": n}
    if img in LIDS: s["lids"], s["skin"] = LIDS[img]
    s.update(kw); return s
shots = [
 S(0, "s24_wardrobe", 1.1, [0.74, 0.38]),
 S(4.92, "s24_wardrobe", 1.19, [0.72, 0.38], to=[0.40, 0.42], zoomTo=1.8, free=True, cut=True, layers=["stink", "flies"], head=[0.40, 0.36], body=[0.40, 0.52]),
 S(7.68, "s24_wardrobe", 1.8, [0.40, 0.42], cut=True, move="static", punch=7.70, layers=["stink", "flies"], head=[0.40, 0.36], body=[0.40, 0.52]),
 S(8.68, "s24_wardrobe", 1.7, [0.74, 0.37], cut=True),
 S(9.72, "s25_mama_money", 1.6, [0.32, 0.37], move="static", keys=[{"at": 10.30, "focus": [0.58, 0.49], "zoom": 1.8, "dur": 0.3}, {"at": 11.34, "focus": [0.80, 0.42], "zoom": 1.333, "dur": 0.22}], shake=11.42, tag={"at": 10.40, "text": "200 zł", "pos": [0.58, 0.43]}),
 S(12.61, "s26_buttons_pop", 1.15, [0.45, 0.45]),
 S(14.14, "s26_buttons_pop", 1.7, [0.43, 0.35], cut=True),
 S(15.26, "s26_buttons_pop", 1.1, [0.45, 0.42], cut=True, punch=15.70, layers=["buttons"], clip={"src": P + "s26_buttons_pop.mp4", "at": 15.26, "from": 1.0, "until": 16.9}),
 S(16.9, "s26_buttons_pop", 1.4, [0.45, 0.40], cut=True, layers=["buttons"]),
 S(17.20, "s27_new_outfit", 1.15, [0.45, 0.45]),
 S(18.94, "s27_new_outfit", 1.5, [0.30, 0.47], cut=True, sparkle=[{"at": 19.70, "pos": [0.17, 0.45]}, {"at": 20.0, "pos": [0.36, 0.52]}]),
 S(20.26, "s27_new_outfit", 1.8, [0.28, 0.36], cut=True),
 S(22.74, "s28_kasia_escalator", 1.1, [0.60, 0.50]),
 S(23.39, "s28_kasia_escalator", 1.1, [0.60, 0.50], clip={"src": P + "s28_kasia_escalator.mp4", "at": 23.39, "from": 0.85, "until": 24.76}),
 S(24.76, "s28_kasia_escalator", 1.5, [0.47, 0.37], cut=True, keys=[{"at": 25.08, "focus": [0.455, 0.34], "zoom": 1.7, "dur": 0.2}], punch=25.20),
 S(25.84, "s29_mannequin", 1.1, [0.50, 0.45]),
 S(27.42, "s29_mannequin", 1.5, [0.34, 0.40], cut=True),
 S(28.62, "s29_mannequin", 1.2, [0.55, 0.45], cut=True, keys=[{"at": 29.66, "focus": [0.82, 0.41], "zoom": 1.8, "dur": 0.3}, {"at": 30.98, "focus": [0.33, 0.38], "zoom": 1.067, "dur": 0.4}]),
 S(32.04, "s30_sms_evening", 1.2, [0.42, 0.45]),
 S(36.83, "s30_sms_evening", 1.6, [0.43, 0.41], cut=True, keys=[{"at": 38.66, "focus": [0.435, 0.40], "zoom": 1.8, "dur": 0.3}]),
 S(40.33, "s30_sms_evening", 1.0, [0.45, 0.50], cut=True, move="bounce"),
]
F = lambda outline, head, neck, feet, facing, seed=1: {"outline": outline, "head": head, "neck": neck, "feet": feet, "facing": facing, "seed": seed}
rigs = {
 I["s24_wardrobe"]: {"figures": [F([[0.66,0.25],[0.80,0.24],[0.90,0.36],[0.99,0.45],[0.99,0.62],[0.95,0.85],[0.66,0.87],[0.62,0.62],[0.62,0.45],[0.66,0.36]], [0.77,0.34,0.08,0.06], [0.80,0.40], 0.86, -1)]},
 I["s25_mama_money"]: {"figures": [F([[0.66,0.29],[0.86,0.29],[0.88,0.45],[0.96,0.58],[0.95,0.78],[0.47,0.78],[0.50,0.55],[0.52,0.45],[0.66,0.40]], [0.76,0.36,0.09,0.07], [0.76,0.44], 0.78, -1),
                                   F([[0.15,0.27],[0.38,0.27],[0.42,0.40],[0.40,0.55],[0.38,0.68],[0.42,0.75],[0.12,0.75],[0.10,0.55],[0.12,0.40]], [0.30,0.33,0.08,0.05], [0.30,0.38], 0.74, 1, 2)]},
 I["s26_buttons_pop"]: {"figures": [F([[0.28,0.25],[0.50,0.25],[0.62,0.40],[0.72,0.55],[0.70,0.75],[0.62,0.92],[0.22,0.92],[0.20,0.70],[0.12,0.55],[0.20,0.40]], [0.42,0.34,0.11,0.08], [0.42,0.45], 0.94, 0),
                                    F([[0.78,0.33],[0.97,0.33],[0.99,0.65],[0.92,0.84],[0.80,0.84],[0.75,0.55]], [0.86,0.39,0.06,0.05], [0.86,0.44], 0.83, -1, 2)]},
 I["s27_new_outfit"]: {"figures": [F([[0.55,0.26],[0.68,0.26],[0.80,0.40],[0.86,0.55],[0.82,0.90],[0.70,0.94],[0.50,0.94],[0.46,0.62],[0.48,0.42]], [0.62,0.33,0.07,0.06], [0.62,0.40], 0.94, -1),
                                   F([[0.15,0.28],[0.32,0.28],[0.42,0.43],[0.44,0.60],[0.38,0.80],[0.15,0.82],[0.10,0.60],[0.10,0.43]], [0.27,0.35,0.07,0.06], [0.27,0.41], 0.80, 1)]},
 I["s28_kasia_escalator"]: {"figures": [F([[0.66,0.40],[0.84,0.40],[0.92,0.55],[0.99,0.70],[0.96,0.90],[0.88,0.98],[0.54,0.98],[0.48,0.80],[0.53,0.62],[0.60,0.55]], [0.72,0.48,0.09,0.07], [0.72,0.55], 0.98, 0),
                                        F([[0.40,0.29],[0.52,0.29],[0.56,0.40],[0.55,0.52],[0.47,0.54],[0.40,0.48],[0.39,0.38]], [0.455,0.33,0.04,0.035], [0.455,0.37], 0.53, 0, 2)]},
 I["s29_mannequin"]: {"figures": [F([[0.24,0.31],[0.42,0.31],[0.52,0.40],[0.53,0.50],[0.45,0.60],[0.46,0.66],[0.27,0.67],[0.20,0.55],[0.21,0.42]], [0.33,0.36,0.08,0.06], [0.33,0.42], 0.66, 1),
                                  F([[0.75,0.37],[0.90,0.37],[0.94,0.55],[0.99,0.70],[0.92,0.78],[0.74,0.78],[0.68,0.62],[0.74,0.50]], [0.82,0.41,0.06,0.05], [0.82,0.47], 0.77, -1, 2)]},
 I["s30_sms_evening"]: {"figures": [F([[0.30,0.32],[0.50,0.32],[0.55,0.45],[0.55,0.58],[0.62,0.72],[0.40,0.75],[0.18,0.68],[0.16,0.50],[0.22,0.42]], [0.43,0.39,0.09,0.07], [0.42,0.46], 0.75, 1)]},
}
ep = {
 "id": "ep04", "day": 4, "daysLeft": 27, "durationSec": 47.35, "imgSize": [1536, 2752],
 "voice": P + "voice.mp3", "words": P + "words.json", "music": True, "autoSfx": False,
 "highlight": ["komentarz", "ciuchy", "szafę", "sama", "dwieście", "złotych", "wypchnęła", "wystrzeliły", "procy", "kurtka", "człowiek", "Kasię", "manekina", "Popatrzyła", "SMS", "broda", "pryszcze", "Ogolić", "dermatologa"],
 "intro": {"comment": {"at": 0, "until": 4.9, "user": "@s.szymanskiii", "text": "Najlepiej jakby ogarnął sobie nowe ciuchy", "likes": 695, "stamp": "WYGRYWA!", "stampAt": 0.64}},
 "shots": shots,
 "phone": [{"at": 32.92, "until": 36.75, "name": "Kasia", "subtitle": "online", "y": 1130, "scale": 0.82,
            "messages": [{"at": 33.6, "from": "them", "text": "Widziałam dziś w galerii manekina z twoją brodą 😂", "typing": 0.45}]}],
 "end": {"type": "choice", "at": 40.33, "title": "CO DALEJ?", "a": {"label": "OGOLIĆ SIĘ", "icon": "🪒"}, "b": {"label": "DERMATOLOG", "icon": "🧴"},
         "cta": "NAPISZ W KOMENTARZU: OGOLIĆ albo DERMATOLOG"},
 "rigs": rigs,
 "sfx": [{"at": 0.64, "name": "pop"}, {"at": 10.36, "name": "whoosh"}, {"at": 15.70, "name": "ping"}, {"at": 19.70, "name": "cling"}, {"at": 33.6, "name": "blip"}],
}
json.dump(ep, open("episodes/ep04.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
