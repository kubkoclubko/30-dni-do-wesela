import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { Mock as MockT } from "../types";

const E = Easing.inOut(Easing.cubic);

// Phone mockup with an app screenshot: grows out of `from` (the phone in the picture) with a soft gold glow over a
// dim scrim, can zoom into a line of the screenshot (keys), gold sticker under it, small corner badge; at `until`
// it slides out to the right in 8 frames (in sync with a whip cut).
export const Mock: React.FC<{ m: MockT }> = ({ m }) => {
  const f = useCurrentFrame();
  const a = sec(m.at);
  const b = sec(m.until);
  if (f < a || f >= b + 8) return null;
  const w = m.w ?? 560;
  const iw = w;
  const ih = (w * 1257) / 580;
  const h = ih + 28;
  const cy = m.y ?? 930;
  const grow = spring({ frame: f - a, fps: FPS, config: { damping: 13, stiffness: 150, mass: 0.7 } });
  const slideOut = f >= b ? E((f - b) / 8) : 0;
  const t = f / FPS;
  let z = 1, fx = 0.5, fy = 0.5;
  for (const k of m.keys ?? []) {
    const q = E(Math.min(1, Math.max(0, (t - k.at) / (k.dur ?? 0.45))));
    if (q <= 0) continue;
    z += (k.zoom - z) * q;
    fx += (k.focus[0] - fx) * q;
    fy += (k.focus[1] - fy) * q;
  }
  const tx = -(fx - 0.5) * iw * z;
  const ty = -(fy - 0.5) * ih * z;
  const ox = m.from[0] - 540;
  const oy = m.from[1] - cy;
  const gx = (1 - grow) * ox + slideOut * 1200;
  const gy = (1 - grow) * oy;
  const sc = interpolate(grow, [0, 1], [0.12, 1]);
  const scrim = Math.min(1, grow) * (1 - slideOut) * 0.5;
  const tagS = m.tag ? spring({ frame: f - sec(m.tag.at), fps: FPS, config: { damping: 9, stiffness: 240, mass: 0.6 } }) : 0;
  const bp = Math.min(1, (f - a) / 8);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#0B0A10", opacity: scrim }} />
      <div style={{ position: "absolute", left: 540 - w / 2 - 14, top: cy - h / 2, width: w + 28, height: h, transform: `translate(${gx + tx}px, ${gy + ty}px) scale(${sc * z})`, opacity: Math.min(1, grow * 3) }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 66, background: "#0E0D12", border: "4px solid #2A2830", boxShadow: "0 0 70px rgba(232,176,74,0.45), 0 0 18px rgba(232,176,74,0.5), 0 34px 60px rgba(0,0,0,0.6)" }} />
        <div style={{ position: "absolute", left: 14, top: 14, width: w, height: ih, borderRadius: 52, overflow: "hidden" }}>
          <Img src={staticFile(m.img)} style={{ width: iw, height: ih, display: "block", }} />
          {m.circle && f >= sec(m.circle.at) && (() => {
            const q = Math.min(1, (f - sec(m.circle!.at)) / 10);
            const cx = m.circle!.pos[0] * iw, cy2 = m.circle!.pos[1] * ih, rx = m.circle!.rx * iw, ry = m.circle!.ry * ih;
            const len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
            return (
              <svg width={iw} height={ih} style={{ position: "absolute", left: 0, top: 0 }}>
                <ellipse cx={cx} cy={cy2} rx={rx} ry={ry} fill="none" stroke="#E5252A" strokeWidth={9} strokeLinecap="round" strokeDasharray={`${len * q} ${len}`} transform={`rotate(-4 ${cx} ${cy2})`} />
              </svg>
            );
          })()}
        </div>
      </div>
      {m.tag && tagS > 0.001 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: cy + h / 2 + 10, display: "flex", justifyContent: "center", opacity: Math.max(0, 1 - (z - 1) * 4), transform: `translateX(${slideOut * 1200}px)` }}>
          <div style={{ transform: `rotate(-3deg) scale(${tagS})`, padding: "12px 30px", background: C.gold, border: `6px solid ${C.ink}`, borderRadius: 18, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink, whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(0,0,0,0.4), 0 0 40px rgba(232,176,74,0.7)" }}>
            {m.tag.text}
          </div>
        </div>
      )}
      {m.badge && (
        <div style={{ position: "absolute", left: 50, top: 235, opacity: bp * (1 - slideOut), transform: `scale(${0.8 + 0.2 * bp})`, transformOrigin: "0% 50%", padding: "6px 16px", background: "rgba(28,26,34,0.9)", border: `2px solid ${C.hudEdge}`, borderRadius: 8, fontFamily: FONT, fontWeight: 900, fontSize: 24, letterSpacing: "0.14em", color: C.cream }}>
          {m.badge}
        </div>
      )}
    </AbsoluteFill>
  );
};
