import { useMemo } from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { camAt, planCamera, type Cam, type Plan } from "../camera";
import { C, FONT, FPS, H, W, sec } from "../theme";
import type { Insert, Rig, Shot } from "../types";
import { BlinkLayer, Flies, Wisps, breathScale, isBlinking } from "./Overlays";
import { ShotGL } from "./ShotGL";

const WHIP = 8; // frames

// One shot. Rigged images (ep.rigs) are drawn by ShotGL (warp + blink in a shader); others as a plain image.
// Flies / stink / steam stay DOM layers on top, inside the camera box so they move with the picture.
export const ShotView: React.FC<{ shot: Shot; plan: Plan; f: number; seed: number; src: [number, number]; rig?: Rig }> = ({ shot, plan, f, seed, src, rig }) => {
  const cam: Cam = camAt(shot, plan, f);
  const prev: Cam = camAt(shot, plan, Math.max(0, f - 1));
  const speed = Math.max(Math.abs(cam.left - prev.left), Math.abs(cam.top - prev.top), Math.abs(cam.w - prev.w) / 2);
  const blur = cam.fast ? Math.min(24, speed / 3) : 0; // motion blur only on the deliberate fast moves
  const L = shot.layers ?? [];
  const head = shot.head ?? [0.5, 0.35];
  const body = shot.body ?? [0.5, 0.55];
  const { w, h, left, top } = cam;
  const tf = cam.rot ? `rotate(${cam.rot}deg) scale(1.13)` : cam.dx || cam.dy ? "scale(1.03)" : undefined;
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: tf, filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
      {rig && <ShotGL img={shot.img} cam={cam} t={f / FPS} rig={rig} blinkOn={L.includes("blink") && isBlinking(f, seed)} blinkBox={shot.blinkBox} />}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: w,
          height: h,
          transformOrigin: "50% 100%",
          transform: !rig && L.includes("breath") ? `scaleY(${breathScale(f)})` : undefined,
        }}
      >
        {!rig && <Img src={staticFile(shot.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        {!rig && L.includes("blink") && <BlinkLayer shot={shot} f={f} seed={seed} src={src} />}
        {L.includes("stink") && <Wisps f={f} at={body} w={w} h={h} kind="stink" />}
        {L.includes("steam") && <Wisps f={f} at={body} w={w} h={h} kind="steam" />}
        {L.includes("flies") && <Flies f={f} seed={seed} head={head} w={w} h={h} />}
      </div>
    </AbsoluteFill>
  );
};

// All shots: hard cuts by default; "whip" slides the new shot in from the left over 8 frames (ease in-out) while
// the old one leaves to the right, with a horizontal motion blur sized to the per-frame travel.
export const ShotTrack: React.FC<{ shots: Shot[]; total: number; src?: [number, number]; rigs?: Record<string, Rig> }> = ({ shots, total, src = [2160, 3840], rigs = {} }) => {
  const frame = useCurrentFrame();
  const plans = useMemo(() => planCamera(shots, total), [shots, total]);
  const E = Easing.inOut(Easing.cubic);
  const out: React.ReactNode[] = [];
  shots.forEach((s, i) => {
    const { a, b: end } = plans[i];
    const nextWhip = shots[i + 1]?.transition === "whip";
    const b = end + (nextWhip ? WHIP : 0);
    if (frame < a || frame >= b) return;
    const f = frame - a;
    let x = 0;
    let blur = 0;
    if (s.transition === "whip" && f < WHIP) {
      x = -W * (1 - E(f / WHIP));
      blur = Math.abs(W * (E(f / WHIP) - E(Math.max(0, f - 1) / WHIP))) / 2.5;
    }
    if (nextWhip && frame >= end) {
      const g = frame - end;
      x = W * E(g / WHIP);
      blur = Math.abs(W * (E(g / WHIP) - E(Math.max(0, g - 1) / WHIP))) / 2.5;
    }
    blur = Math.min(70, blur);
    const id = `whipblur${i}-${Math.round(blur)}`;
    out.push(
      <AbsoluteFill key={i} style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
        {blur > 0.5 && (
          <svg width={0} height={0} style={{ position: "absolute" }}>
            <filter id={id} x="-10%" width="120%">
              <feGaussianBlur stdDeviation={`${Math.round(blur)} 0`} edgeMode="duplicate" />
            </filter>
          </svg>
        )}
        <ShotView shot={s} plan={plans[i]} f={f} seed={s.seed ?? i} src={src} rig={rigs[s.img]} />
      </AbsoluteFill>,
    );
  });
  return <AbsoluteFill style={{ background: C.ink }}>{out}</AbsoluteFill>;
};

// Polaroid insert with a caption: springs in with -4 deg rotation, shrinks out over the last 6 frames.
export const Polaroid: React.FC<{ ins: Insert }> = ({ ins }) => {
  const frame = useCurrentFrame();
  const a = sec(ins.at);
  const b = sec(ins.at + ins.dur);
  if (frame < a || frame >= b) return null;
  const s = spring({ frame: frame - a, fps: FPS, config: { damping: 11, stiffness: 170, mass: 0.7 } });
  const outP = interpolate(frame, [b - 6, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(s, [0, 1], [0.55, 1]) * interpolate(outP, [0, 1], [0.85, 1]);
  const rot = interpolate(s, [0, 1], [-14, -4]);
  const [fx, fy] = ins.focus ?? [0.5, 0.5];
  const y = ins.y ?? 760;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: W / 2 - 330,
          top: y - 400,
          width: 660,
          padding: "30px 30px 0",
          background: "#FBF8F0",
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
          transform: `rotate(${rot}deg) scale(${scale})`,
          opacity: Math.min(1, s * 2) * outP,
        }}
      >
        <div style={{ width: 600, height: 620, overflow: "hidden", background: "#222" }}>
          <Img src={staticFile(ins.img)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${fx * 100}% ${fy * 100}%` }} />
        </div>
        <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#2A2530", letterSpacing: "0.04em" }}>
          {ins.caption ?? ""}
        </div>
      </div>
    </AbsoluteFill>
  );
};
