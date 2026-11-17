# Builds episodes/ep07.json (shots, rigs, overlays), kept so the numbers can be tweaked: py scripts/mk_ep07.py
# Times come from public/ep07/words.json (voice = main take + ending line spliced with a 0.35 s gap).
import json
P = "ep07/"
I = lambda k: f"{P}{k}_2x.jpg"
APP, WRP, BAG, ROPE, YAWN, PAD, LOCK = (I(k) for k in ["s71_app_entrance", "s72_wraps", "s73_heavy_bag", "s74_jump_rope", "s75_coach_yawn", "s76_pad_hit", "s77_locker_phone"])
LIE = I("s73_lying")
BAGV, PADV = P + "s73_heavy_bag.mp4", P + "s76_pad_hit.mp4"
n = 0
def S(at, img, zoom, focus, **kw):
    global n; n += 1
    s = {"at": at, "img": img, "zoom": zoom, "focus": focus, "seed": n}
    s.update(kw); return s
BLUSH = {"at": 37.7, "pos": [[0.43, 0.425], [0.545, 0.425]], "r": 0.05, "dur": 1.2}
shots = [
 # 1 cold open: the bag hits Mirek (clip 3.05 s on, hit at 0.28 s), zoom punch to ~1.6x + shake; whip + rewind into the app entrance
 S(0.00, BAG, 1.4, [0.45, 0.45], move="static", punch=0.28, shake=0.30, clip={"src": BAGV, "at": 0.0, "from": 3.05, "until": 1.15}),
 S(0.80, APP, 1.0, [0.5, 0.5], transition="whip", rewind=0.5, shake=3.42),
 # 2 push onto the phone in Mirek's hand (free eased zoom), then the app mockup grows out of it (ep.mocks)
 S(4.42, APP, 1.0, [0.5, 0.5], move="tiltDown", free=True, to=[0.47, 0.57], zoomTo=2.2),
 S(5.50, APP, 1.0, [0.47, 0.57]),
 # 3 whip back to Mirek on "boks", zoom to the shocked face
 S(13.50, APP, 1.0, [0.5, 0.5], cut=True, transition="whip", move="static", keys=[{"at": 13.66, "focus": [0.45, 0.40], "zoom": 1.8, "dur": 0.45}]),
 # 4 wraps: tilt chin -> belly, then the boxing glove on the foot
 S(14.16, WRP, 1.6, [0.40, 0.45], move="tiltDown", free=True, to=[0.42, 0.60], zoomTo=1.6),
 S(16.78, WRP, 1.0, [0.50, 0.70], keys=[{"at": 18.0, "focus": [0.73, 0.86], "zoom": 1.15, "dur": 0.5}]),
 # 5 heavy bag: jpg, the clip when the bag hits back (hit at 20.98), lying frame with punch + shake on "Mirek leży"
 S(18.75, BAG, 1.15, [0.40, 0.45]),
 S(20.40, BAG, 1.0, [0.40, 0.45], clip={"src": BAGV, "at": 20.40, "from": 2.75, "until": 22.09}),
 S(22.09, LIE, 1.5, [0.42, 0.72], punch=22.09, shake=22.12),
 # 6 jump rope: three hops, zoom 1.8 on the tangled beard
 S(23.30, ROPE, 1.0, [0.5, 0.5], hops=[24.06, 24.44, 24.82]),
 S(26.06, ROPE, 1.08, [0.5, 0.5], keys=[{"at": 26.18, "focus": [0.40, 0.43], "zoom": 1.8, "dur": 0.5}]),
 # 7 pads: three micro shakes on "powietrze", slow zoom onto the yawning coach
 S(26.71, YAWN, 1.0, [0.45, 0.5]),
 S(28.55, YAWN, 1.0, [0.45, 0.5], shake=28.58),
 S(28.78, YAWN, 1.0, [0.45, 0.5], shake=28.80),
 S(29.00, YAWN, 1.0, [0.45, 0.5], shake=29.02),
 S(29.22, YAWN, 1.0, [0.45, 0.5], free=True, zoomTo=1.8, to=[0.83, 0.34], move="tiltDown"),
 # 8 deep breath push on the face (jpg), left/right clip, hit + 2-frame white flash on "Trafione"
 S(30.51, PAD, 1.2, [0.42, 0.45], move="tiltDown", free=True, to=[0.30, 0.40], zoomTo=1.7),
 S(32.92, PAD, 1.0, [0.5, 0.5], cut=True, move="static", punch=34.0, flash=33.99, flashFrames=2, shake=34.03, clip={"src": PADV, "at": 32.92, "from": 0.1, "until": 35.13}),
 # 9 locker room: chat with Kasia over Mirek, blush
 S(35.13, LOCK, 1.25, [0.5, 0.52]),
 S(37.50, LOCK, 1.25, [0.5, 0.52], blush=BLUSH),
 S(41.32, LOCK, 1.3, [0.5, 0.615], cut=True, blush=BLUSH),
]
F = lambda outline, head, neck, feet, facing, seed=1: {"outline": outline, "head": head, "neck": neck, "feet": feet, "facing": facing, "seed": seed}
rigs = {
 APP: {"figures": [F([[0.20,0.34],[0.62,0.34],[0.64,0.50],[0.60,0.72],[0.62,0.96],[0.28,0.96],[0.30,0.72],[0.18,0.52]], [0.46,0.41,0.14,0.08], [0.45,0.48], 0.95, 0)]},
 WRP: {"figures": [F([[0.18,0.46],[0.62,0.46],[0.66,0.60],[0.64,0.78],[0.50,0.86],[0.20,0.86],[0.16,0.62]], [0.40,0.38,0.13,0.08], [0.40,0.46], 0.84, 0)]},
 ROPE: {"figures": [F([[0.20,0.46],[0.65,0.46],[0.67,0.65],[0.62,0.82],[0.60,0.95],[0.25,0.95],[0.22,0.80],[0.18,0.62]], [0.42,0.38,0.13,0.08], [0.42,0.46], 0.93, 0)]},
 YAWN: {"figures": [F([[0.08,0.46],[0.52,0.46],[0.60,0.62],[0.55,0.80],[0.50,0.95],[0.08,0.95],[0.05,0.75]], [0.33,0.38,0.13,0.08], [0.33,0.46], 0.94, 1),
                    F([[0.68,0.45],[0.98,0.45],[0.99,0.66],[0.96,0.94],[0.72,0.94],[0.68,0.70]], [0.83,0.34,0.075,0.07], [0.83,0.42], 0.93, -1, 2)]},
 PAD: {"figures": [F([[0.05,0.46],[0.50,0.46],[0.55,0.60],[0.50,0.78],[0.45,0.95],[0.05,0.95],[0.04,0.70]], [0.30,0.38,0.12,0.08], [0.30,0.46], 0.94, 1)]},
 LOCK: {"figures": [F([[0.28,0.44],[0.74,0.44],[0.78,0.62],[0.72,0.80],[0.65,0.94],[0.28,0.94],[0.22,0.70]], [0.50,0.40,0.14,0.08], [0.50,0.47], 0.94, 0)]},
}
ep = {
 "id": "ep07", "day": 7, "daysLeft": 24, "durationSec": 48.86, "imgSize": [1536, 2752],
 "voice": P + "voice.mp3", "words": P + "words.json", "music": True, "autoSfx": False,
 "highlight": ["siłownia", "twistem", "glowup.pl", "dziesięć", "procent", "Pewność", "boks", "Bandaże", "worek", "leży", "Skakanka", "brodę",
               "powietrze", "ziewa", "Trafione", "Kasia", "kasuje", "odpisać", "Napiszcie", "komentarz", "wygrywa"],
 "voteStamp": {"title": "WYNIK GŁOSOWANIA", "dur": 4.42, "win": {"at": 2.04, "text": "WYGRYWA! SIŁOWNIA 💪"},
               "twist": {"strike": 3.2, "at": 3.40, "text": "TWIST! 🥊 BOKS"}},
 "mocks": [{"at": 5.0, "until": 13.5, "img": P + "app_glowup_2x.png", "from": [540, 990], "w": 520, "y": 880,
            "badge": "WSPÓŁPRACA", "tag": {"at": 7.36, "text": "glowup.pl · kod MIREK10 = -10%"},
            "keys": [{"at": 11.45, "focus": [0.5, 0.555], "zoom": 2.0, "dur": 0.45}, {"at": 12.75, "focus": [0.5, 0.5], "zoom": 1.0, "dur": 0.4}]}],
 "shots": shots,
 "phone": [{"at": 36.2, "until": 41.28, "name": "Kasia", "subtitle": "online", "y": 1250, "scale": 0.62,
            "messages": [{"at": 36.3, "from": "them", "text": "Mój chłopak mówi, że widział cię dziś na siłowni 😂"},
                         {"at": 36.73, "from": "them", "text": "Hej, ignorujesz mnie? 🙈", "typing": 0.4},
                         {"at": 39.15, "from": "me", "ghost": True, "typing": 0.65},
                         {"at": 41.2, "from": "me", "ghost": True, "typing": 1.1}],
            "drafts": [{"at": 38.6, "text": "Hej Kas…", "type": 0.55, "hold": 0.1, "del": 0.4}]}],
 "end": {"type": "choice", "at": 41.32, "title": "CO MA ODPISAĆ?", "capY": 1690,
         "open": {"cta": "NAPISZ W KOMENTARZU 👇", "cta2": "NAJBARDZIEJ POLUBIONY KOMENTARZ WYGRYWA"},
         "follow": {"at": 43.4, "count": 0, "goal": 0, "label": "", "button": "OBSERWUJ", "top": 1280}},
 "rigs": rigs,
 "sfx": [{"at": 0.28, "name": "gong"}, {"at": 3.40, "name": "gong"}, {"at": 20.98, "name": "thud"},
         {"at": 24.06, "name": "boing"}, {"at": 24.44, "name": "boing"}, {"at": 24.82, "name": "boing"},
         {"at": 33.99, "name": "dun"}, {"at": 36.30, "name": "blip"}, {"at": 36.73, "name": "blip"}],
}
json.dump(ep, open("episodes/ep07.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
