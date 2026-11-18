# Builds episodes/ep08.json (kept so the numbers can be tweaked: py scripts/mk_ep08.py). Times from public/ep08/words.json
# (voice = ElevenLabs take sped up with atempo 1.085, original in voice_v1.mp3).
import json
P = "ep08/"
I = lambda k: f"{P}{k}_2x.jpg"
COOL, REPLY, STR, STAIR, STUCK, ELEV, DOOR = (I(k) for k in ["s81_cool_text", "s82_reply", "s83_stretch", "s84_stairs", "s85_stuck", "s86_elevator", "s87_boyfriend_door"])
CL = lambda k: f"{P}{k}.mp4"
n = 0
def S(at, img, zoom, focus, **kw):
    global n; n += 1
    s = {"at": at, "img": img, "zoom": zoom, "focus": focus, "seed": n}
    s.update(kw); return s
Q = {"?!": "?!"}
shots = [
 # 1 hook: cold open on the stuck chin (punch + shake + "?!"), hard cut to Mirek in sunglasses (punch + "?!")
 S(0.00, STUCK, 1.5, [0.72, 0.54], move="static", punch=0.10, shake=0.12, tag={"at": 0.15, "text": "?!", "pos": [0.70, 0.30]}),
 S(0.80, COOL, 1.4, [0.42, 0.44], move="tiltDown", free=True, to=[0.45, 0.46], zoomTo=1.7, punch=0.86, tag={"at": 0.95, "text": "?!", "pos": [0.33, 0.20]}),
 S(3.00, COOL, 1.9, [0.45, 0.46], cut=True),
 # 2 selfie: slow push on the glasses, flash on "selfie", glint on "luz"
 S(8.16, COOL, 1.25, [0.40, 0.44], cut=True, flash=9.50, sparkle=[{"at": 11.60, "pos": [0.33, 0.375]}]),
 # 3 Kasia replies: push, then a big zoom onto the face on "czwarte piętro"
 S(12.08, REPLY, 1.0, [0.45, 0.42]),
 S(17.50, REPLY, 1.08, [0.45, 0.45], move="tiltDown", free=True, to=[0.44, 0.38], zoomTo=1.8),
 # 4 glasses slide off (clip)
 S(18.50, REPLY, 1.0, [0.5, 0.5], cut=True, clip={"src": CL("s82_reply"), "at": 18.50, "from": 0.9, "until": 20.20}),
 # 5 stretching: whip, pose zoom on "olimpiadę", pan to the wardrobe on "nie rozciąga"
 S(20.20, STR, 1.0, [0.5, 0.5], transition="whip"),
 S(22.90, STR, 1.08, [0.5, 0.5], move="static",
   keys=[{"at": 23.30, "focus": [0.60, 0.52], "zoom": 1.7, "dur": 0.5}, {"at": 24.70, "focus": [0.20, 0.50], "zoom": 0.762, "dur": 0.9}],
   tag={"at": 25.10, "text": "…", "pos": [0.20, 0.36]}),
 # 6 stairs: floor labels, clip from "szafa niesie Mirka", zoom to Kasia with the flower
 S(26.06, STAIR, 1.0, [0.55, 0.5], tag={"at": 26.30, "text": "1", "pos": [0.10, 0.10]}),
 S(28.40, STAIR, 1.0, [0.55, 0.5], tag={"at": 28.68, "text": "2", "pos": [0.10, 0.10]}),
 S(29.40, STAIR, 1.08, [0.55, 0.5], move="static", tag={"at": 28.68, "text": "2", "pos": [0.10, 0.10]},
   clip={"src": CL("s84_stairs"), "at": 29.40, "from": 0.0, "until": 32.40},
   keys=[{"at": 30.95, "focus": [0.76, 0.36], "zoom": 1.7, "dur": 0.5}]),
 # 7 stuck: shake on "zaklinowała", long zoom to the beard
 S(32.50, STUCK, 1.0, [0.6, 0.5], shake=33.76),
 S(35.85, STUCK, 1.08, [0.62, 0.50], move="tiltDown", free=True, to=[0.73, 0.56], zoomTo=1.8),
 # 8 elevator: "4", punch when he drops, clip (neighbour walks out, close-up of the eye)
 S(36.77, ELEV, 1.0, [0.5, 0.55], tag={"at": 37.26, "text": "4", "pos": [0.10, 0.10]}, punch=38.54),
 S(40.00, ELEV, 1.23, [0.5, 0.55], cut=True),
 S(41.17, ELEV, 1.08, [0.5, 0.55], clip={"src": CL("s86_elevator"), "at": 41.17, "from": 0.0, "until": 44.16}),
 # 9 boyfriend: lunge to his feet, tilt up to the face, phone, selfie mock with red circle on the mess, red face
 S(44.16, DOOR, 1.0, [0.35, 0.5], cut=True, move="tiltDown", free=True, to=[0.29, 0.71], zoomTo=1.7),
 S(45.00, DOOR, 1.7, [0.29, 0.71], move="tiltDown", free=True, to=[0.29, 0.30], zoomTo=1.7),
 S(47.30, DOOR, 1.7, [0.29, 0.30], move="tiltDown", free=True, to=[0.46, 0.50], zoomTo=1.8),
 S(48.20, DOOR, 1.8, [0.46, 0.50]),
 S(51.50, DOOR, 1.6, [0.64, 0.63], cut=True, blush={"at": 51.50, "pos": [[0.60, 0.645], [0.68, 0.64]], "r": 0.05, "dur": 0.8}),
 # 10 end card over the bounce
 S(52.00, DOOR, 1.0, [0.5, 0.5], cut=True, move="bounce"),
]
F = lambda outline, head, neck, feet, facing, seed=1: {"outline": outline, "head": head, "neck": neck, "feet": feet, "facing": facing, "seed": seed}
rigs = {
 COOL: {"figures": [F([[0.12,0.34],[0.55,0.40],[0.72,0.60],[0.72,0.78],[0.40,0.74],[0.08,0.55]], [0.34,0.39,0.10,0.06], [0.40,0.45], 0.76, 1)]},
 REPLY: {"figures": [F([[0.22,0.34],[0.62,0.40],[0.80,0.60],[0.80,0.78],[0.50,0.74],[0.18,0.55]], [0.44,0.38,0.10,0.06], [0.50,0.45], 0.76, 1)]},
 STR: {"figures": [F([[0.40,0.50],[0.75,0.50],[0.85,0.65],[0.80,0.85],[0.40,0.88],[0.30,0.70]], [0.62,0.52,0.09,0.06], [0.60,0.58], 0.88, 1)]},
 STAIR: {"figures": [F([[0.28,0.54],[0.72,0.54],[0.78,0.70],[0.68,0.88],[0.35,0.90],[0.25,0.72]], [0.62,0.55,0.10,0.06], [0.58,0.60], 0.90, 0)]},
 STUCK: {"figures": [F([[0.40,0.56],[0.86,0.52],[0.88,0.70],[0.80,0.90],[0.35,0.92],[0.30,0.72]], [0.72,0.50,0.08,0.05], [0.70,0.58], 0.92, 0)]},
 ELEV: {"figures": [F([[0.30,0.68],[0.78,0.62],[0.85,0.78],[0.60,0.95],[0.25,0.90],[0.18,0.78]], [0.61,0.62,0.07,0.05], [0.60,0.68], 0.92, 0)]},
 DOOR: {"figures": [F([[0.10,0.40],[0.38,0.40],[0.38,0.62],[0.34,0.76],[0.12,0.76],[0.08,0.60]], [0.24,0.35,0.06,0.04], [0.24,0.40], 0.76, 0, 1),
                     F([[0.45,0.66],[0.72,0.60],[0.78,0.72],[0.70,0.82],[0.35,0.88],[0.12,0.84]], [0.63,0.62,0.08,0.045], [0.62,0.66], 0.88, 0, 2)]},
}
ep = {
 "id": "ep08", "day": 8, "daysLeft": 23, "durationSec": 61.87, "imgSize": [1536, 2752],
 "voice": P + "voice.mp3", "words": P + "words.json", "music": True, "autoSfx": False,
 "highlight": ["selfie", "Wysłane", "luz", "szafę", "szafa", "szafę", "broda", "podłogę", "winda", "chlew", "Pokazuje", "telefon", "Napiszcie", "komentarzach", "Treningi", "Sadkowskiego"],
 "intro": {"comment": {"at": 3.00, "until": 8.90, "user": "@_sadkowskii_", "text": "Hej, byłem zajęty. Wiesz, treningi i tak dalej 😎", "likes": 214,
                       "title": "WYGRAŁ KOMENTARZ", "typeAt": 5.24, "typeDur": 2.5, "stamp": "WYGRYWA!", "stampAt": 7.95}},
 "shots": shots,
 "phone": [{"at": 10.20, "until": 18.50, "name": "Kasia", "subtitle": "online", "y": 1250, "scale": 0.62,
            "messages": [{"at": 10.30, "from": "me", "img": COOL, "crop": [0.45, 0.58, 1.3], "fresh": True},
                         {"at": 10.70, "from": "me", "text": "Hej, byłem zajęty. Wiesz, treningi i tak dalej 😎"},
                         {"at": 13.95, "from": "them", "text": "Treningi? Super! 💪 To jutro pomożesz mi wnieść szafę. 4 piętro 😇", "typing": 0.55}]}],
 "mocks": [{"at": 47.74, "until": 51.50, "img": P + "selfie_phone.png", "from": [540, 900], "w": 520, "y": 900,
            "circle": {"at": 50.55, "pos": [0.5, 0.69], "rx": 0.44, "ry": 0.10},
            "keys": [{"at": 50.80, "focus": [0.5, 0.69], "zoom": 1.8, "dur": 0.35}]}],
 "end": {"type": "choice", "at": 52.00, "title": "CO DALEJ?", "capY": 1640,
         "a": {"label": "POSPRZĄTAĆ POKÓJ", "icon": "🧹"}, "b": {"label": "„TO NIE MÓJ POKÓJ, TYLKO…|", "icon": "🤥"},
         "cta": "NAPISZ W KOMENTARZU: SPRZĄTAĆ albo DOKOŃCZ KŁAMSTWO 👇",
         "follow": {"at": 57.00, "count": 0, "goal": 0, "label": "", "button": "OBSERWUJ"}},
 "rigs": rigs,
 "sfx": [{"at": 0.10, "name": "thud"}, {"at": 9.50, "name": "shutter"}, {"at": 28.70, "name": "creak"},
         {"at": 40.78, "name": "ping"}, {"at": 50.80, "name": "dun"}],
}
json.dump(ep, open("episodes/ep08.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
