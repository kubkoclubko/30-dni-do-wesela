# Placeholder art for component tests only (public/test/). Real episode art comes from the AI images.
from PIL import Image, ImageDraw
W, H = 1080, 1920
INK = (30, 27, 34)
def guy(d, cx, top, s=1.0, eyes_closed=False):
    k = lambda v: int(v * s)
    d.ellipse([cx - k(230), top + k(520), cx + k(230), top + k(1000)], fill=(86, 128, 84), outline=INK, width=k(10))  # shirt/belly
    d.rectangle([cx - k(170), top + k(950), cx + k(170), top + k(1150)], fill=(130, 130, 135), outline=INK, width=k(10))  # shorts
    for dx in (-90, 90):
        d.rectangle([cx + k(dx) - k(40), top + k(1150), cx + k(dx) + k(40), top + k(1330)], fill=(240, 205, 175), outline=INK, width=k(8))
        d.ellipse([cx + k(dx) - k(70), top + k(1310), cx + k(dx) + k(70), top + k(1370)], fill=(120, 80, 50), outline=INK, width=k(8))
    d.ellipse([cx - k(150), top + k(170), cx + k(150), top + k(560)], fill=(240, 205, 175), outline=INK, width=k(10))  # head
    d.polygon([(cx - k(165), top + k(330)), (cx - k(150), top + k(150)), (cx + k(150), top + k(150)), (cx + k(165), top + k(330)), (cx + k(120), top + k(220)), (cx - k(120), top + k(220))], fill=(110, 80, 40), outline=INK)  # hair
    d.ellipse([cx - k(110), top + k(420), cx + k(110), top + k(580)], fill=(190, 100, 50), outline=INK, width=k(6))  # beard
    d.ellipse([cx - k(30), top + k(370), cx + k(30), top + k(430)], fill=(220, 90, 80), outline=INK, width=k(6))  # nose
    for dx in (-60, 60):
        if eyes_closed:
            d.arc([cx + k(dx) - k(30), top + k(310), cx + k(dx) + k(30), top + k(350)], 0, 180, fill=INK, width=k(8))
        else:
            d.ellipse([cx + k(dx) - k(28), top + k(300), cx + k(dx) + k(28), top + k(356)], fill="white", outline=INK, width=k(6))
            d.ellipse([cx + k(dx) - k(10), top + k(318), cx + k(dx) + k(10), top + k(338)], fill=INK)
def room(blink):
    im = Image.new("RGB", (W, H), (120, 98, 84)); d = ImageDraw.Draw(im)
    d.rectangle([0, 1250, W, H], fill=(92, 70, 58))  # floor
    d.rectangle([80, 260, 480, 700], fill=(70, 90, 120), outline=INK, width=8)  # poster/window
    d.rectangle([640, 980, 1080, 1360], fill=(150, 60, 60), outline=INK, width=8)  # bed
    for i in range(14): d.ellipse([30 + i * 70, 1500 + (i % 3) * 60, 90 + i * 70, 1540 + (i % 3) * 60], fill=(200, 190, 150), outline=INK, width=4)  # junk
    guy(d, 520, 330, 1.0, blink)
    return im
room(False).save("public/test/room.png"); room(True).save("public/test/room_blink.png")
im = Image.new("RGBA", (900, 1400), (0, 0, 0, 0)); guy(ImageDraw.Draw(im), 450, 0, 1.0); im.save("public/test/mirek_full.png")
ph = Image.new("RGB", (800, 600), (200, 170, 140)); d = ImageDraw.Draw(ph)
d.rectangle([0, 380, 800, 600], fill=(150, 120, 100)); d.ellipse([300, 120, 500, 320], fill=(240, 200, 180), outline=INK, width=8); ph.save("public/test/photo.png")
