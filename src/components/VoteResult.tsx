import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { C, FONT, FPS, sec } from "../theme";
import type { Vote, VoteOption } from "../types";

// Timeline (frames): cards spring in from the left (2nd 6 later), bars fill 0 -> % over 20 frames (ease out) while the
// percentages count up, the winner bounces 1 -> 1.06 -> 1, the gold "WYGRYWA!" stamp lands (-8 deg, sparks), the
// loser greys out; the whole thing fades over the last 8 frames of `dur` (default 4 s).
export const VOTE_IN = 4;
export const VOTE_FILL = 20;
export const VOTE_STAMP_AT = VOTE_IN + 6 + 6 + VOTE_FILL + 2; // pop SFX here

const Card: React.FC<{ o: VoteOption; pct: number; win: boolean; enterAt: number; f: number; y: number }> = ({ o, pct, win, enterAt, f, y }) => {
  const s = spring({ frame: f - enterAt, fps: FPS, config: { damping: 13, stiffness: 170, mass: 0.7 } });
  const fillAt = enterAt + 6;
  const fill = interpolate(f, [fillAt, fillAt + VOTE_FILL], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const done = fillAt + VOTE_FILL;
  const bounce = win ? 1 + 0.06 * Math.sin(Math.PI * interpolate(f, [done, done + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 1;
  const grey = win ? 0 : interpolate(f, [done + 2, done + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        top: y,
        width: 820,
        height: 120,
        boxSizing: "border-box",
        borderRadius: 14,
        border: `2px solid ${win ? C.gold : C.ink}`,
        background: win ? C.voteWin : C.voteLose,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px 8px",
        opacity: Math.min(1, s * 2) * (1 - grey * 0.35),
        filter: grey ? `grayscale(${grey}) brightness(${1 - grey * 0.25})` : undefined,
        transform: `translateX(${(1 - s) * -1100}px) scale(${bounce})`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * pct}%`, background: win ? "rgba(232,176,74,0.22)" : "rgba(138,135,144,0.2)" }} />
      <span style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 44, color: "#fff", letterSpacing: "0.04em" }}>{o.label.toUpperCase()}</span>
      <span style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: win ? C.gold : "#B9B5BF" }}>{Math.round(pct * fill)} %</span>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: `${fill * pct}%`, background: win ? C.gold : "#8A8790" }} />
    </div>
  );
};

const Spark: React.FC<{ a: number; p: number }> = ({ a, p }) => {
  const d = 40 + 90 * Easing.out(Easing.cubic)(p);
  const sz = 26 * (1 - p * 0.6);
  return (
    <svg width={sz} height={sz} viewBox="-10 -10 20 20" style={{ position: "absolute", left: Math.cos(a) * d - sz / 2, top: Math.sin(a) * d - sz / 2, opacity: 1 - p }}>
      <path d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z" fill="#FFD66B" stroke={C.ink} strokeWidth={1} />
    </svg>
  );
};

export const Stamp: React.FC<{ text: string; f: number; at?: number; left?: number; top?: number }> = ({ text, f, at = VOTE_STAMP_AT, left = 574, top = 398 }) => {
  const g = f - at;
  if (g < 0) return null;
  const s = spring({ frame: g, fps: FPS, config: { damping: 9, stiffness: 260, mass: 0.6 } });
  const sp = Math.min(1, g / 16);
  return (
    <div style={{ position: "absolute", left, top, width: 0, height: 0 }}>
      {g < 16 && Array.from({ length: 9 }, (_, i) => <Spark key={i} a={(i / 9) * Math.PI * 2 + 0.3} p={sp} />)}
      <div
        style={{
          position: "absolute",
          transform: `translate(-50%, -50%) rotate(-8deg) scale(${interpolate(s, [0, 1], [2.2, 1])})`,
          opacity: Math.min(1, s * 3),
          padding: "8px 22px",
          border: `5px double ${C.gold}`,
          borderRadius: 12,
          background: "rgba(30,27,34,0.88)",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: "0.05em",
          color: "#FFD66B",
          whiteSpace: "nowrap",
          textShadow: "0 2px 0 #7A5418",
          boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const VoteResult: React.FC<{ vote: Vote }> = ({ vote }) => {
  const f = useCurrentFrame();
  const end = sec(vote.dur ?? 4);
  if (f >= end) return null;
  const [w, l] = vote.a.votes >= vote.b.votes ? [vote.a, vote.b] : [vote.b, vote.a];
  const tot = Math.max(1, w.votes + l.votes);
  const op = interpolate(f, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <div
        style={{
          position: "absolute",
          top: 268,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 34,
          letterSpacing: "0.22em",
          color: C.cream,
          textShadow: "0 3px 8px rgba(0,0,0,0.75)",
          opacity: interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {(vote.title ?? "WYNIK GŁOSOWANIA").toUpperCase()}
      </div>
      <Card o={w} win pct={(w.votes / tot) * 100} enterAt={VOTE_IN} f={f} y={340} />
      <Card o={l} win={false} pct={(l.votes / tot) * 100} enterAt={VOTE_IN + 6} f={f} y={480} />
      <Stamp text={vote.stamp ?? "WYGRYWA!"} f={f} />
    </AbsoluteFill>
  );
};
