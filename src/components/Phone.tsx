import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { ChatMsg, Phone as PhoneT } from "../types";

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
          fontSize: 32,
          lineHeight: 1.25,
          color: C.ink,
          boxShadow: "0 2px 3px rgba(0,0,0,0.15)",
          transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
          transformOrigin: me ? "100% 100%" : "0% 100%",
          opacity: Math.min(1, s * 2),
        }}
      >
        {typing ? <Typing f={f} /> : m.img ? <Img src={staticFile(m.img)} style={{ width: 360, borderRadius: 8, display: "block" }} /> : m.text}
      </div>
    </div>
  );
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
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: (1080 - 620) / 2,
          top: (1920 - 1150) / 2,
          width: 620,
          height: 1150,
          boxSizing: "border-box",
          borderRadius: 64,
          background: C.ink,
          padding: 16,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          transform: `scale(${interpolate(s, [0, 1], [0.8, 1]) * interpolate(out, [0, 1], [0.9, 1])}) rotate(${interpolate(s, [0, 1], [-8, 0])}deg)`,
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
            <div style={{ flex: 1, height: 54, borderRadius: 27, background: "#FFFDF7" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
