import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, sec } from "../theme";
import type { Vote, VoteOption } from "../types";

export const VOTE_BAR_AT = 6; // first bar starts filling (pop SFX), the second one 6 frames later

const Card: React.FC<{ o: VoteOption; win: boolean; ratio: number; start: number; f: number; y: number }> = ({ o, win, ratio, start, f, y }) => {
  const fill = interpolate(f, [start, start + 18], [0, ratio], { easing: Easing.out(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const enter = interpolate(f, [start - 6, start], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
        border: `2px solid ${C.ink}`,
        background: win ? C.voteWin : C.voteLose,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px 8px",
        opacity: enter,
        transform: `translateY(${(1 - enter) * 20}px)`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff" }}>{o.label}</span>
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.gold }}>{Math.round((o.votes * fill) / Math.max(ratio, 1e-6))}</span>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, width: `${fill * 100}%`, background: win ? C.gold : "#8A8790" }} />
    </div>
  );
};

// Day 2+: "WYNIK GŁOSOWANIA" with two cards (winner on top) for the first ~4 s, then an 8-frame fade.
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
          top: 290,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: "0.25em",
          color: "rgba(244,230,196,0.85)",
          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
          opacity: interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {(vote.title ?? "WYNIK GŁOSOWANIA").toUpperCase()}
      </div>
      <Card o={w} win ratio={w.votes / tot} start={VOTE_BAR_AT} f={f} y={340} />
      <Card o={l} win={false} ratio={l.votes / tot} start={VOTE_BAR_AT + 6} f={f} y={480} />
    </AbsoluteFill>
  );
};
