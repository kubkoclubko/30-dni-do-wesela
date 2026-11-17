import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
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

// Empty reply bubble of Mirek with a blinking caret ("what should he write?").
const OpenBubble: React.FC<{ f: number }> = ({ f }) => {
  const s = spring({ frame: f - sec(0.45), fps: FPS, config: { damping: 11, stiffness: 190, mass: 0.6 } });
  if (s <= 0.001) return null;
  return (
    <div style={{ position: "absolute", top: 930, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 640, height: 120, boxSizing: "border-box", background: "#CFE3BE", border: `5px solid ${C.ink}`, borderRadius: 30, borderBottomRightRadius: 6, display: "flex", alignItems: "center", padding: "0 34px", transform: `scale(${s})`, transformOrigin: "100% 100%", boxShadow: "0 12px 0 rgba(0,0,0,0.3)" }}>
        <span style={{ display: "inline-block", width: 7, height: 66, background: C.ink, opacity: Math.floor(f / 10) % 2 ? 0.1 : 1 }} />
      </div>
    </div>
  );
};

const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Follower goal under the cards: "count / goal LABEL" counting up while the bar fills, plus a pulsing follow button
// with a bouncing arrow pointing at it.
const Follow: React.FC<{ fo: NonNullable<ChoiceEnd["follow"]>; f: number }> = ({ fo, f }) => {
  if (f < 0) return null;
  const inn = spring({ frame: f, fps: FPS, config: { damping: 14, stiffness: 160 } });
  const fill = interpolate(f, [6, 6 + sec(1.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const bf = f - sec(1.0);
  const bs = spring({ frame: bf, fps: FPS, config: { damping: 9, stiffness: 200, mass: 0.6 } });
  const pulse = 1 + 0.06 * Math.max(0, Math.sin((bf / FPS) * Math.PI * 2.4));
  const arrow = 14 * Math.abs(Math.sin((bf / FPS) * Math.PI * 2.4));
  const pct = fo.goal ? (fo.count / fo.goal) * fill : 0;
  return (
    <div style={{ position: "absolute", top: fo.top ?? 1080, left: 60, right: 60, opacity: inn, transform: `translateY(${(1 - inn) * 40}px)` }}>
      {fo.goal > 0 && <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.cream, ...outline }}>
        <span style={{ color: C.gold }}>{fmt(fo.count * fill)}</span> / {fmt(fo.goal)} {fo.label}
      </div>}
      {fo.goal > 0 && <div style={{ position: "relative", marginTop: 14, height: 46, borderRadius: 23, background: "rgba(20,18,24,0.75)", border: `5px solid ${C.ink}`, boxShadow: `0 0 0 3px ${C.cream}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: `linear-gradient(${C.gold}, #D08A2A)` }} />
      </div>}
      {bs > 0.001 && (
        <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 24 }}>
          <svg width={110} height={70} viewBox="0 0 110 70" style={{ transform: `translateX(${arrow}px)`, opacity: bs }}>
            <path d="M5 35 H75 M55 12 L82 35 L55 58" stroke={C.ink} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M5 35 H75 M55 12 L82 35 L55 58" stroke={C.gold} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <div style={{ transform: `scale(${(bs * pulse).toFixed(3)})`, padding: "14px 46px", background: "#E8344E", border: `6px solid ${C.ink}`, borderRadius: 999, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#fff", boxShadow: `0 8px 0 ${C.ink}, 0 0 ${30 * (pulse - 1) / 0.06}px rgba(232,52,78,0.8)` }}>
            {fo.button}
          </div>
        </div>
      )}
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
  const openCta = interpolate(f, [sec(1.3), sec(1.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
      <div style={{ position: "absolute", top: end.open ? 760 : 600, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px" }}>
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
      {!end.open && end.a && <Card label={end.a.label} icon={end.a.icon} x={540 - 30 - 300} t0={0.1} f={f} phase={0} />}
      {!end.open && end.b && <Card label={end.b.label} icon={end.b.icon} x={540 + 30} t0={CHOICE_B_AT} f={f} phase={1} />}
      {end.open && <OpenBubble f={f} />}
      {end.follow && <Follow fo={end.follow} f={frame - sec(end.follow.at)} />}
      {end.open && (
        <div style={{ position: "absolute", top: 1150, left: 30, right: 30, textAlign: "center", fontFamily: FONT, fontWeight: 900, color: C.cream, ...outline, opacity: openCta, transform: `translateY(${(1 - openCta) * 20}px)` }}>
          <div style={{ fontSize: 50 }}>{end.open.cta}</div>
          {end.open.cta2 && <div style={{ fontSize: 36, color: C.gold, marginTop: 10 }}>{end.open.cta2}</div>}
        </div>
      )}
      {!end.open && <div style={{ position: "absolute", top: 1430, left: 30, right: 30, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.cream, ...outline, opacity: ctaOn, transform: `translateY(${(1 - ctaOn) * 20}px)` }}>
        {end.cta ?? (
          <>
            NAPISZ W KOMENTARZU: <span style={{ color: C.gold }}>{end.a.label.toUpperCase()}</span> albo <span style={{ color: C.gold }}>{end.b.label.toUpperCase()}</span>
          </>
        )}
      </div>}
    </AbsoluteFill>
  );
};
