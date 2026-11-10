# usage: python scripts/make_rig.py episodes/epXX.json
# For every image in ep["rigs"], writes public/<dir>/rig/<image>_fig<i>.png (1/4 resolution, RGB):
#   R = body weight (the outline polygon, soft-edged), G = head weight (head ellipse, soft-edged).
# The shader in src/components/ShotGL.tsx warps the picture with these (breathing + nods), so the soft edges
# give a smooth transition into the room instead of a cut-out layer.
import json, os, sys
from PIL import Image, ImageDraw, ImageFilter
ep = json.load(open(sys.argv[1], encoding="utf-8"))
for img, rig in ep.get("rigs", {}).items():
    w0, h0 = Image.open(os.path.join("public", img)).size
    w, h = w0 // 4, h0 // 4
    d, base = os.path.split(img)
    os.makedirs(os.path.join("public", d, "rig"), exist_ok=True)
    for i, f in enumerate(rig["figures"]):
        body = Image.new("L", (w, h), 0)
        ImageDraw.Draw(body).polygon([(x * w, y * h) for x, y in f["outline"]], fill=255)
        body = body.filter(ImageFilter.GaussianBlur(w * 0.025))
        cx, cy, rx, ry = f["head"]
        head = Image.new("L", (w, h), 0)
        ImageDraw.Draw(head).ellipse([(cx - rx * 1.05) * w, (cy - ry * 1.15) * h, (cx + rx * 1.05) * w, (cy + ry * 1.05) * h], fill=255)
        head = head.filter(ImageFilter.GaussianBlur(w * 0.03))
        out = Image.merge("RGB", (body, head, Image.new("L", (w, h), 0)))
        dst = os.path.join("public", d, "rig", os.path.splitext(base)[0] + f"_fig{i}.png")
        out.save(dst)
        print(dst, out.size)
