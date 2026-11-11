import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { CommentEnd } from "../types";

// Open call to action: small gold kicker, big cream question, two pills, the character full-body at the bottom.
export const CommentCard: React.FC<{ end: CommentEnd }> = ({ end }) => {
  const frame = useCurrentFrame();
  const f = frame - sec(end.at);
  if (f < 0) return null;
  const inn = (d: number) => spring({ frame: f - d, fps: FPS, config: { damping: 12, stiffness: 160, mass: 0.6 } });
  const up = (d: number): React.CSSProperties => {
    const s = inn(d);
    return { opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px) scale(${interpolate(s, [0, 1], [0.9, 1])})` };
  };
  const pill: React.CSSProperties = { display: "inline-block", fontFamily: FONT, fontWeight: 900, borderRadius: 999 };
  // once in, the pills breathe gently (1.0 <-> 1.04, 1 s cycle, the second half a cycle later)
  const pulse = (d: number, ph: number) => (f < d + 14 ? undefined : `scale(${1 + 0.04 * (0.5 - 0.5 * Math.cos(((f - d - 14) / FPS) * Math.PI * 2 + ph))})`);
  return (
    <AbsoluteFill style={{ background: "#2A2530" }}>
      {end.img && <Img src={staticFile(end.img)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.8)" }} />}
      {end.character && (
        <Img
          src={staticFile(end.character)}
          style={{ position: "absolute", bottom: 0, left: "50%", height: 960, transform: `translateX(-50%) translateY(${(1 - inn(2)) * 200}px)`, filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.5))" }}
        />
      )}
      <div style={{ position: "absolute", top: 300, left: 70, right: 70, textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: "0.2em", color: C.gold, ...up(0) }}>{end.kicker}</div>
        <div style={{ marginTop: 22, fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: C.cream, textShadow: "0 6px 0 #1E1B22, 0 12px 30px rgba(0,0,0,0.6)", ...up(6) }}>
          {end.title}
        </div>
        {end.pill1 && (
          <div style={{ marginTop: 44, ...up(12) }}>
            <span style={{ ...pill, transform: pulse(12, 0), background: C.cream, color: C.ink, fontSize: 40, padding: "18px 36px", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>💬 {end.pill1}</span>
          </div>
        )}
        {end.pill2 && (
          <div style={{ marginTop: 22, ...up(18) }}>
            <span style={{ ...pill, transform: pulse(18, Math.PI), background: C.hudBg, border: `2px solid ${C.hudEdge}`, color: C.cream, fontSize: 30, padding: "14px 30px" }}>{end.pill2}</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
