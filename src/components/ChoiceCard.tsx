import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { ChoiceEnd } from "../types";
import { Icon } from "./Icons";

export const CHOICE_B_AT = 1.4; // right card pops in 1.4 s after the end card starts (left at 0.1 s)

const outline = { WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" } as const;

const Card: React.FC<{ label: string; icon: string; x: number; t0: number; f: number; phase: number }> = ({ label, icon, x, t0, f, phase }) => {
  const s = spring({ frame: f - sec(t0), fps: FPS, config: { damping: 10, stiffness: 180, mass: 0.6 } });
  if (s <= 0.001) return null;
  const t = f / FPS;
  const pulse = 1 + 0.02 * (1 + Math.sin(((t / 1.2) * 2 + phase) * Math.PI)); // alternating 1 <-> 1.04
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 780,
        width: 300,
        height: 260,
        boxSizing: "border-box",
        background: C.cream,
        border: `2px solid ${C.cardEdge}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        boxShadow: "0 14px 30px rgba(0,0,0,0.4)",
        transform: `scale(${s * pulse})`,
      }}
    >
      <div style={{ transform: `rotate(${4 * Math.sin(t * 3.9 + phase * 2)}deg) translateY(${3 * Math.sin(t * 2.7 + phase)}px)` }}>
        <Icon name={icon} size={150} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.navy, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
};

// Binary choice end card: camera bounces out to the wide (scale 1.15 -> 1), title typed word by word, two cards,
// then "NAPISZ W KOMENTARZU: X albo Y".
export const ChoiceCard: React.FC<{ end: ChoiceEnd }> = ({ end }) => {
  const frame = useCurrentFrame();
  const f = frame - sec(end.at);
  if (f < 0) return null;
  const bounce = spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 120 } });
  const [fx, fy] = end.focus ?? [0.5, 0.5];
  const words = end.title.split(" ");
  const ctaOn = interpolate(f, [sec(CHOICE_B_AT + 0.4), sec(CHOICE_B_AT + 0.7)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden", background: end.img ? C.ink : undefined }}>
        {end.img && <Img
          src={staticFile(end.img)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `scale(${interpolate(bounce, [0, 1], [1.15, 1])})` }}
        />}
        <AbsoluteFill style={{ background: "linear-gradient(rgba(20,18,24,0.15), rgba(20,18,24,0.55) 30%, rgba(20,18,24,0.55) 60%, rgba(20,18,24,0.1))" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 600, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px" }}>
        {words.map((w, i) => {
          const wf = f - (3 + i * 5);
          if (wf < 0) return null;
          return (
            <span key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color: C.cream, ...outline, display: "inline-block", transform: `scale(${interpolate(wf, [0, 4], [1.25, 1], { extrapolateRight: "clamp" })})` }}>
              {w}
            </span>
          );
        })}
      </div>
      <Card label={end.a.label} icon={end.a.icon} x={540 - 30 - 300} t0={0.1} f={f} phase={0} />
      <Card label={end.b.label} icon={end.b.icon} x={540 + 30} t0={CHOICE_B_AT} f={f} phase={1} />
      <div style={{ position: "absolute", top: 1430, left: 30, right: 30, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.cream, ...outline, opacity: ctaOn, transform: `translateY(${(1 - ctaOn) * 20}px)` }}>
        {end.cta ?? (
          <>
            NAPISZ W KOMENTARZU: <span style={{ color: C.gold }}>{end.a.label.toUpperCase()}</span> albo <span style={{ color: C.gold }}>{end.b.label.toUpperCase()}</span>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
