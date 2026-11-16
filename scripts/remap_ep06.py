# Re-times episodes/ep06.json from the v1 voice (public/ep06/words_v1.json) onto the v4 voice (words.json), same text, new timings.
# usage: python scripts/remap_ep06.py   (idempotent: always reads episodes/ep06_v1.json)
import json, os, shutil
if not os.path.exists("episodes/ep06_v1.json"):
    shutil.copy("episodes/ep06.json", "episodes/ep06_v1.json")
a = json.load(open("public/ep06/words_v1.json", encoding="utf-8"))
b = json.load(open("public/ep06/words.json", encoding="utf-8"))
old = [0.0] + [w["s"] for w in a] + [a[-1]["e"] + 3.0]
new = [0.0] + [w["s"] for w in b] + [b[-1]["e"] + 3.0]
def T(t):
    for i in range(len(old) - 1):
        if old[i] <= t <= old[i + 1]:
            d = old[i + 1] - old[i]
            return round(new[i] + (new[i + 1] - new[i]) * ((t - old[i]) / d if d else 0), 3)
    return round(t + new[-1] - old[-1], 3)
TK = {"at", "until", "shake", "punch", "flash"}
def walk(o, parent=None):
    if isinstance(o, dict):
        for k, v in list(o.items()):
            if k in TK and isinstance(v, (int, float)): o[k] = T(v)
            elif isinstance(v, (dict, list)): walk(v, k)
    elif isinstance(o, list):
        for x in o: walk(x, parent)
ep = json.load(open("episodes/ep06_v1.json", encoding="utf-8"))
for s in ep["shots"]:
    if "clip" in s:  # keep the playback length of the clip part
        c = s["clip"]; ln = c["until"] - c["at"]
        c["at"] = T(c["at"]); c["until"] = round(c["at"] + ln, 3)
    for k in TK:
        if k in s: s[k] = T(s[k])
    if "clip" in s: pass
    for kk in s.get("keys", []): kk["at"] = T(kk["at"])
    for p in s.get("pops", []): p["at"] = T(p["at"])
    s["at"] = T(s["at"]) if s["at"] != 0 else 0
for p in ep["phone"]:
    p["at"] = T(p["at"]); p["until"] = T(p["until"])
    for m in p["messages"]: m["at"] = T(m["at"])
ep["end"]["at"] = T(ep["end"]["at"]); ep["end"]["follow"]["at"] = T(ep["end"]["follow"]["at"])
for s in ep["sfx"]: s["at"] = T(s["at"])
ep["durationSec"] = round(new[-1], 2)
json.dump(ep, open("episodes/ep06.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("dur", ep["durationSec"], "end.at", ep["end"]["at"], "sfx", [s["at"] for s in ep["sfx"]])
