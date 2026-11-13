import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { Intro as IntroT } from "../types";
import { Stamp } from "./VoteResult";

// Opening overlays from ep.intro: follower milestone (count-up + confetti) and the winning Instagram comment
// (card springs up from below, heart pulses, likes count up, gold stamp lands above it).
const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const count = (f: number, a: number, dur: number, n: number) => n * Easing.out(Easing.cubic)(Math.min(1, Math.max(0, (f - a) / dur)));
const fadeOut = (f: number, b: number) => interpolate(f, [b - 6, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const CONF = ["#F2B544", "#E8505B", "#4FB3E8", "#6CCB5F", "#B07CE8", "#FFFFFF"];
const Confetti: React.FC<{ g: number }> = ({ g }) => (
  <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
    {Array.from({ length: 70 }, (_, i) => {
      const r = (k: string) => random(`conf${i}${k}`);
      const t = g / FPS - r("d") * 0.6;
      if (t < 0) return null;
      const y = -60 + t * (420 + r("v") * 380);
      const x = r("x") * 1080 + Math.sin(t * (2 + r("w") * 3) + r("p") * 6) * 50;
      const rot = r("r") * 360 + t * (200 + r("s") * 400);
      const flip = Math.cos(t * (5 + r("f") * 6));
      const w = 16 + r("z") * 14;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: w * 0.45, background: CONF[i % CONF.length], borderRadius: 3, transform: `rotate(${rot}deg) scaleY(${flip.toFixed(3)})` }} />;
    })}
  </AbsoluteFill>
);

const Followers: React.FC<{ d: NonNullable<IntroT["followers"]>; f: number }> = ({ d, f }) => {
  const a = sec(d.at);
  const b = sec(d.until);
  if (f < a || f >= b) return null;
  const g = f - a;
  const s = spring({ frame: g, fps: FPS, config: { damping: 8, stiffness: 180, mass: 0.7 } });
  const s2 = spring({ frame: g - 10, fps: FPS, config: { damping: 7, stiffness: 220, mass: 0.6 } });
  const o = fadeOut(f, b);
  const big = { fontFamily: FONT, fontWeight: 900, color: "#fff", textAlign: "center" as const, WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill" as const, textShadow: "0 10px 0 rgba(0,0,0,0.35)" };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(20,16,26,0.55), rgba(20,16,26,0.15) 70%)" }} />
      <Confetti g={g} />
      <div style={{ position: "absolute", top: 560, width: 1080, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${interpolate(s, [0, 1], [0.3, 1])}) rotate(${interpolate(s, [0, 1], [-10, -3])}deg)`, opacity: Math.min(1, s * 3) }}>
        <div style={{ ...big, fontSize: 210, lineHeight: 1, color: C.capGold }}>{fmt(count(f, a + 4, 30, d.count))}</div>
        <div style={{ ...big, fontSize: 78, lineHeight: 1.1, WebkitTextStroke: `8px ${C.ink}` }}>{d.label}</div>
      </div>
      {d.sub && (
        <div style={{ position: "absolute", top: 960, width: 1080, textAlign: "center", transform: `scale(${interpolate(s2, [0, 1], [0, 1])}) rotate(4deg)` }}>
          <span style={{ ...big, fontSize: 150, color: "#FF6B7A" }}>{d.sub}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Heart: React.FC<{ beat: number }> = ({ beat }) => (
  <svg width={64} height={58} viewBox="0 0 24 22" style={{ transform: `scale(${beat})` }}>
    <path d="M12 21 C 5 15, 1 11.5, 1 7 A 5.5 5.5 0 0 1 12 4.5 A 5.5 5.5 0 0 1 23 7 C 23 11.5, 19 15, 12 21 Z" fill="#ED4956" />
  </svg>
);

const Comment: React.FC<{ d: NonNullable<IntroT["comment"]>; f: number }> = ({ d, f }) => {
  const a = sec(d.at);
  const b = sec(d.until);
  if (f < a || f >= b) return null;
  const g = f - a;
  const s = spring({ frame: g, fps: FPS, config: { damping: 11, stiffness: 150, mass: 0.8 } });
  const beat = 1 + 0.14 * Math.max(0, Math.sin((g / FPS) * Math.PI * 2.4)) ** 3;
  const o = fadeOut(f, b);
  const cardTop = 470;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(20,16,26,0.1), rgba(20,16,26,0.5) 45%, rgba(20,16,26,0.1))" }} />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: cardTop,
          width: 960,
          boxSizing: "border-box",
          padding: "34px 34px 30px",
          borderRadius: 34,
          background: "#fff",
          boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          gap: 26,
          transform: `translateY(${interpolate(s, [0, 1], [900, 0])}px) rotate(${interpolate(s, [0, 1], [6, -1.5])}deg)`,
          fontFamily: FONT,
        }}
      >
        <div style={{ width: 120, height: 120, borderRadius: 60, padding: 6, background: "conic-gradient(#F9CE34, #EE2A7B, #6228D7, #F9CE34)", flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "5px solid #fff", boxSizing: "border-box", background: "linear-gradient(135deg, #8EC5FC, #5A6FD8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 52 }}>
            {d.user.replace("@", "")[0].toUpperCase()}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 40, color: "#262626" }}>
            {d.user} <span style={{ fontWeight: 800, fontSize: 30, color: "#8E8E8E" }}>2 d</span>
          </div>
          <div style={{ fontWeight: 900, fontSize: 64, color: "#111", marginTop: 4 }}>{d.text}</div>
          <div style={{ fontWeight: 800, fontSize: 28, color: "#8E8E8E", marginTop: 6 }}>Odpowiedz</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 120 }}>
          <Heart beat={beat} />
          <div style={{ fontWeight: 900, fontSize: 40, color: "#262626", marginTop: 4 }}>{fmt(count(f, a + 8, 36, d.likes))}</div>
        </div>
      </div>
      {d.stamp && (
        <div style={{ position: "absolute", inset: 0, transform: "scale(1.7)", transformOrigin: "540px 420px" }}>
          <Stamp text={d.stamp} f={f} at={sec(d.stampAt ?? d.at + 0.5)} left={540} top={420} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Intro: React.FC<{ intro: IntroT }> = ({ intro }) => {
  const f = useCurrentFrame();
  return (
    <>
      {intro.followers && <Followers d={intro.followers} f={f} />}
      {intro.comment && <Comment d={intro.comment} f={f} />}
    </>
  );
};
