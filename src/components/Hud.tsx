import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";

export const HUD_FLIP_AT = 24; // frame of the countdown flip (day 2+); the pop SFX goes here

const Pill: React.FC<{ children: React.ReactNode; style: React.CSSProperties; s: number }> = ({ children, style, s }) => (
  <div
    style={{
      position: "absolute",
      top: 160 - 37,
      background: C.hudBg,
      border: `2px solid ${C.hudEdge}`,
      borderRadius: 10,
      padding: "14px 22px",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 34,
      lineHeight: "42px",
      color: C.cream,
      whiteSpace: "nowrap",
      transform: `scale(${s})`,
      opacity: Math.min(1, s * 3),
      ...style,
    }}
  >
    {children}
  </div>
);

const Num: React.FC<{ n: number }> = ({ n }) => <span style={{ color: C.gold }}>{String(n).padStart(2, "0")}</span>;

// Flips the countdown number like a card: old one folds away (rotateX 0 -> 90), new one unfolds (-90 -> 0).
const Flip: React.FC<{ from: number; to: number; f: number }> = ({ from, to, f }) => {
  const p = interpolate(f, [HUD_FLIP_AT, HUD_FLIP_AT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showNew = p >= 0.5;
  const rot = showNew ? -90 + (p - 0.5) * 180 : p * 180;
  return (
    <span style={{ display: "inline-block", transform: `perspective(200px) rotateX(${rot}deg)` }}>
      <Num n={showNew ? to : from} />
    </span>
  );
};

// Always on top, never moves with the camera. Left pill from x 120, right pill ends at x 960.
export const Hud: React.FC<{ day: number; daysLeft: number }> = ({ day, daysLeft }) => {
  const f = useCurrentFrame();
  const pop = (d: number) => spring({ frame: f - d, fps: FPS, config: { damping: 10, stiffness: 220, mass: 0.6 }, durationInFrames: 6 });
  return (
    <AbsoluteFill>
      <Pill style={{ left: 120, transformOrigin: "0% 50%" }} s={pop(0)}>
        DZIEŃ <Num n={day} />
      </Pill>
      <Pill style={{ right: 1080 - 960, transformOrigin: "100% 50%" }} s={pop(4)}>
        {day >= 2 ? <Flip from={daysLeft + 1} to={daysLeft} f={f} /> : <Num n={daysLeft} />} DNI DO WESELA
      </Pill>
    </AbsoluteFill>
  );
};
