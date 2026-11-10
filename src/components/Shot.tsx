import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, H, W, sec } from "../theme";
import type { Insert, Shot } from "../types";
import { BlinkLayer, Flies, Wisps, breathScale } from "./Overlays";

const WHIP = 6; // frames

type Cam = { z: number; fx: number; fy: number; rot: number; dx: number; dy: number };

// p = 0..1 through the shot, f = frame inside the shot (keys / punch / shake are absolute episode seconds).
const camAt = (s: Shot, p: number, f: number): Cam => {
  const move = s.move ?? "push";
  let [fx, fy] = s.focus ?? (move === "tiltDown" ? [0.5, 0.3] : [0.5, 0.5]);
  const z0 = s.zoom ?? (move === "tiltDown" ? 1.6 : move === "panX" ? 1.2 : 1);
  const ease = Easing.inOut(Easing.sin)(p);
  let z = z0;
  let rot = 0;
  switch (move) {
    case "push":
      z = z0 + ((s.zoomTo ?? z0 * 1.08) - z0) * p;
      break;
    case "pull":
      z = (s.zoomTo ?? z0 * 1.08) + (z0 - (s.zoomTo ?? z0 * 1.08)) * p;
      break;
    case "panX":
    case "tiltDown": {
      const [tx, ty] = s.to ?? (move === "panX" ? [fx + 0.2, fy] : [fx, 0.8]);
      fx += (tx - fx) * ease;
      fy += (ty - fy) * ease;
      if (s.zoomTo) z = z0 + (s.zoomTo - z0) * ease;
      break;
    }
    case "dutch":
      z = z0 * (1 + 0.04 * p);
      rot = 4;
      break;
    case "bounce": // spring out to the wide: 1.15 -> 1
      z = z0 * interpolate(spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 120 } }), [0, 1], [1.15, 1]);
      break;
  }
  const t = s.at + f / FPS;
  for (const k of s.keys ?? []) {
    // a quick re-frame starting at k.at (default 0.4 s, ease in-out)
    const q = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - k.at) / (k.dur ?? 0.4))));
    if (q <= 0) continue;
    fx += (k.focus[0] - fx) * q;
    fy += (k.focus[1] - fy) * q;
    if (k.zoom) z += (z * (k.zoom / z0) - z) * q; // relative, so the base push keeps going after the key
  }
  if (s.punch !== undefined && t >= s.punch) z *= 1 + 0.14 * Easing.out(Easing.cubic)(Math.min(1, ((t - s.punch) * FPS) / 4));
  let dx = 0;
  let dy = 0;
  if (s.shake !== undefined && t >= s.shake && t < s.shake + 0.5) {
    const k = (t - s.shake) * FPS;
    const amp = 14 * (1 - k / 15);
    dx = amp * Math.sin(k * 2.9);
    dy = amp * Math.cos(k * 3.7);
  }
  return { z, fx, fy, rot, dx, dy };
};

// One shot: the image (cover, 9:16) inside a camera box w x h; the focus point is centred, clamped to the image.
export const ShotView: React.FC<{ shot: Shot; f: number; dur: number; seed: number; src: [number, number] }> = ({ shot, f, dur, seed, src }) => {
  const cam = camAt(shot, Math.min(1, Math.max(0, f / Math.max(1, dur))), f);
  const w = W * cam.z;
  const h = H * cam.z;
  const left = Math.min(0, Math.max(W - w, W / 2 - cam.fx * w)) + cam.dx;
  const top = Math.min(0, Math.max(H - h, H / 2 - cam.fy * h)) + cam.dy;
  const L = shot.layers ?? [];
  const head = shot.head ?? [0.5, 0.35];
  const body = shot.body ?? [0.5, 0.55];
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: cam.rot ? `rotate(${cam.rot}deg) scale(1.13)` : cam.dx || cam.dy ? "scale(1.03)" : undefined }}>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: w,
          height: h,
          transformOrigin: "50% 100%",
          transform: L.includes("breath") ? `scaleY(${breathScale(f)})` : undefined,
        }}
      >
        <Img src={staticFile(shot.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {L.includes("blink") && <BlinkLayer shot={shot} f={f} seed={seed} src={src} />}
        {L.includes("stink") && <Wisps f={f} at={body} w={w} h={h} kind="stink" />}
        {L.includes("steam") && <Wisps f={f} at={body} w={w} h={h} kind="steam" />}
        {L.includes("flies") && <Flies f={f} seed={seed} head={head} w={w} h={h} />}
      </div>
    </AbsoluteFill>
  );
};

// All shots of an episode: hard cuts by default; "whip" slides the new shot in from the left over 6 frames
// while the old one leaves to the right, with a horizontal motion blur.
export const ShotTrack: React.FC<{ shots: Shot[]; total: number; src?: [number, number] }> = ({ shots, total, src = [2160, 3840] }) => {
  const frame = useCurrentFrame();
  const starts = shots.map((s) => sec(s.at));
  const ends = shots.map((_, i) => (i + 1 < shots.length ? starts[i + 1] : total));
  const out: React.ReactNode[] = [];
  shots.forEach((s, i) => {
    const a = starts[i];
    const nextWhip = shots[i + 1]?.transition === "whip";
    const b = ends[i] + (nextWhip ? WHIP : 0);
    if (frame < a || frame >= b) return;
    const f = frame - a;
    let x = 0;
    let blur = 0;
    if (s.transition === "whip" && f < WHIP) {
      const p = Easing.out(Easing.cubic)(f / WHIP);
      x = -W * (1 - p);
      blur = 40 * (1 - p);
    }
    if (nextWhip && frame >= ends[i]) {
      const p = Easing.out(Easing.cubic)((frame - ends[i]) / WHIP);
      x = W * p;
      blur = 40 * (1 - p);
    }
    out.push(
      <AbsoluteFill key={i} style={{ transform: `translateX(${x}px)`, filter: blur > 0.5 ? `url(#whipblur${Math.round(blur)})` : undefined }}>
        {blur > 0.5 && (
          <svg width={0} height={0} style={{ position: "absolute" }}>
            <filter id={`whipblur${Math.round(blur)}`}>
              <feGaussianBlur stdDeviation={`${Math.round(blur)} 0`} />
            </filter>
          </svg>
        )}
        <ShotView shot={s} f={f} dur={ends[i] - a} seed={s.seed ?? i} src={src} />
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
