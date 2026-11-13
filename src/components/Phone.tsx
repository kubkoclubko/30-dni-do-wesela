import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { ChatMsg, Draft, Phone as PhoneT } from "../types";

export const isPhoneOn = (phones: PhoneT[] | undefined, f: number) => (phones ?? []).some((p) => f >= sec(p.at) && f < sec(p.until));

const Typing: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ display: "flex", gap: 8, padding: "6px 4px" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: "#8C8577", transform: `translateY(${-6 * Math.max(0, Math.sin(((f - i * 4) / 18) * Math.PI * 2))}px)` }} />
    ))}
  </div>
);

const Bubble: React.FC<{ m: ChatMsg; f: number }> = ({ m, f }) => {
  const shown = sec(m.at);
  const typingFrom = m.typing ? sec(m.at - m.typing) : shown;
  if (f < typingFrom) return null;
  const me = m.from === "me";
  const typing = f < shown;
  const s = spring({ frame: f - (typing ? typingFrom : shown), fps: FPS, config: { damping: 12, stiffness: 220, mass: 0.5 } });
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "78%",
          background: me ? "#CFE3BE" : "#FFFDF7",
          borderRadius: 12,
          borderTopLeftRadius: me ? 12 : 3,
          borderTopRightRadius: me ? 3 : 12,
          padding: m.img && !typing ? 8 : "12px 18px",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: m.text && Array.from(m.text).length <= 2 ? 72 : 32, // a lone emoji is shown big
          lineHeight: 1.25,
          color: C.ink,
          boxShadow: "0 2px 3px rgba(0,0,0,0.15)",
          transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
          transformOrigin: me ? "100% 100%" : "0% 100%",
          opacity: Math.min(1, s * 2),
        }}
      >
        {typing ? <Typing f={f} /> : m.img && m.crop ? <OldPhoto img={m.img} crop={m.crop} fresh={m.fresh} /> : m.img ? <Img src={staticFile(m.img)} style={{ width: 360, borderRadius: 8, display: "block" }} /> : m.text}
      </div>
    </div>
  );
};

// A crop of a 9:16 picture shown as an old, faded print (white border, warm tint).
const OldPhoto: React.FC<{ img: string; crop: [number, number, number]; fresh?: boolean }> = ({ img, crop, fresh }) => {
  const [fx, fy, z] = crop;
  const cw = 360;
  const ch = 300;
  const iw = cw * z;
  const ih = iw * (16 / 9);
  return (
    <div style={fresh ? { borderRadius: 14, overflow: "hidden" } : { background: "#FBF6EA", padding: "10px 10px 26px", transform: "rotate(-2deg)", boxShadow: "0 3px 6px rgba(0,0,0,0.25)" }}>
      <div style={{ position: "relative", width: cw, height: fresh ? 400 : ch, overflow: "hidden" }}>
        <Img src={staticFile(img)} style={{ position: "absolute", width: iw, height: ih, left: cw / 2 - fx * iw, top: (fresh ? 400 : ch) / 2 - fy * ih, filter: fresh ? undefined : "sepia(0.45) saturate(0.8) contrast(0.95) brightness(1.05)" }} />
        {!fresh && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 55%, rgba(90,60,20,0.35))" }} />}
      </div>
    </div>
  );
};

// Text being typed into the input field and deleted again (type, hold, delete), with a blinking caret.
const draftText = (d: Draft[] | undefined, t: number) => {
  for (const x of d ?? []) {
    const chars = Array.from(x.text);
    const ty = x.type ?? Math.max(0.15, chars.length * 0.07);
    const ho = x.hold ?? 0.35;
    const de = x.del ?? Math.max(0.1, chars.length * 0.03);
    const u = t - x.at;
    if (u < 0 || u >= ty + ho + de) continue;
    const n = u < ty ? Math.ceil((u / ty) * chars.length) : u < ty + ho ? chars.length : Math.floor((1 - (u - ty - ho) / de) * chars.length);
    return chars.slice(0, n).join("");
  }
  return null;
};

// 620 x 1150 phone in the centre: spring pop-in (scale 0.8 -> 1, rotate -8 -> 0, ~0.3 s with overshoot),
// messages / photos / typing appear by time; older ones scroll up. Shrinks out over 6 frames at `until`.
export const Phone: React.FC<{ p: PhoneT }> = ({ p }) => {
  const f = useCurrentFrame();
  const a = sec(p.at);
  const b = sec(p.until);
  if (f < a || f >= b) return null;
  const s = spring({ frame: f - a, fps: FPS, config: { damping: 9, stiffness: 200, mass: 0.6 } });
  const out = interpolate(f, [b - 6, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const k = p.shake !== undefined ? f - sec(p.shake) : -1; // buzz: 0.6 s of fast side-to-side jitter
  const buzz = k >= 0 && k < 18 ? 1 - k / 18 : 0;
  const bx = buzz * 14 * Math.sin(k * 2.6);
  const br = buzz * 3 * Math.sin(k * 3.3);
  const sc = p.scale ?? 1;
  const cy = p.y ?? 960;
  const draft = draftText(p.drafts, f / FPS);
  // punch: fast zoom (4 f) onto the header name, held ~1 s, eased back over 10 f
  const pk = p.punch !== undefined ? f - sec(p.punch) : -1;
  const pz = pk < 0 ? 0 : pk < 4 ? Easing.out(Easing.cubic)(pk / 4) : pk < 34 ? 1 : Math.max(0, 1 - Easing.inOut(Easing.cubic)((pk - 34) / 10));
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: (1080 - 620) / 2,
          top: cy - 1150 / 2,
          width: 620,
          height: 1150,
          boxSizing: "border-box",
          borderRadius: 64,
          background: C.ink,
          padding: 16,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          transformOrigin: pz > 0 ? "32% 7%" : undefined,
          transform: `translateX(${bx}px) scale(${sc * (1 + 0.45 * pz) * interpolate(s, [0, 1], [0.8, 1]) * interpolate(out, [0, 1], [0.9, 1])}) rotate(${interpolate(s, [0, 1], [-8, 0]) + br}deg)`,
          opacity: Math.min(1, s * 3) * out,
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", background: C.phoneBg, display: "flex", flexDirection: "column" }}>
          <div style={{ background: C.phoneHead, padding: "44px 26px 22px", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ color: "#fff", fontSize: 40, fontFamily: FONT, fontWeight: 900 }}>‹</span>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: "#C9D8B6", color: C.phoneHead, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 36 }}>
              {p.name[0]}
            </div>
            <div style={{ fontFamily: FONT, color: "#fff" }}>
              <div style={{ fontWeight: 900, fontSize: 36 }}>{p.name}</div>
              {p.subtitle && <div style={{ fontWeight: 800, fontSize: 24, opacity: 0.75 }}>{p.subtitle}</div>}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, padding: "20px 22px", overflow: "hidden" }}>
            {p.messages.map((m, i) => (
              <Bubble key={i} m={m} f={f} />
            ))}
          </div>
          <div style={{ height: 90, background: "#E3D9C0", display: "flex", alignItems: "center", padding: "0 20px" }}>
            <div style={{ flex: 1, height: 54, borderRadius: 27, background: "#FFFDF7", display: "flex", alignItems: "center", padding: "0 22px", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink, overflow: "hidden", whiteSpace: "nowrap" }}>
              {draft !== null && (
                <>
                  {draft}
                  <span style={{ display: "inline-block", width: 3, height: 34, marginLeft: 2, background: C.phoneHead, opacity: Math.floor(f / 8) % 2 ? 0.2 : 1 }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
