import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, sec } from "../theme";
import type { VoteStamp as VoteStampT } from "../types";
import { Stamp } from "./VoteResult";

// Vote result without bars (the percentages are not known): title, a big winner stamp "WYGRYWA! SIŁOWNIA 💪",
// then at the twist a red slash strikes it out and the same stamp lands again with "TWIST! 🥊 BOKS".
export const VoteStampView: React.FC<{ v: VoteStampT }> = ({ v }) => {
  const f = useCurrentFrame();
  const end = sec(v.dur);
  if (f >= end) return null;
  const op = interpolate(f, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slash = v.twist ? interpolate(f, [sec(v.twist.strike), sec(v.twist.strike) + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }) : 0;
  const struck = !!v.twist && f >= sec(v.twist.strike);
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <div style={{ position: "absolute", top: 268, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: "0.2em", color: C.cream, textShadow: "0 3px 8px rgba(0,0,0,0.8)", opacity: interpolate(f, [sec(v.win.at) - 36, sec(v.win.at) - 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {(v.title ?? "WYNIK GŁOSOWANIA").toUpperCase()}
      </div>
      <div style={{ opacity: struck ? 0.75 : 1 }}>
        <Stamp text={v.win.text} f={f} at={sec(v.win.at)} left={540} top={470} size={58} />
      </div>
      {slash > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={90} y1={500} x2={90 + 900 * slash} y2={440} stroke={C.ink} strokeWidth={26} strokeLinecap="round" />
          <line x1={90} y1={500} x2={90 + 900 * slash} y2={440} stroke="#E8344E" strokeWidth={14} strokeLinecap="round" />
        </svg>
      )}
      {v.twist && <Stamp text={v.twist.text} f={f} at={sec(v.twist.at)} left={540} top={720} size={78} />}
    </AbsoluteFill>
  );
};
