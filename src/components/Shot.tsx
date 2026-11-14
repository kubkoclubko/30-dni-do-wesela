import { useMemo } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
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
  // spin: slow rotation around the frame centre, overscanned so the corners never show
  const sp = shot.spin ? shot.spin[0] + (shot.spin[1] - shot.spin[0]) * Math.min(1, f / Math.max(1, plan.b - plan.a)) : 0;
  const rad = (Math.abs(sp) * Math.PI) / 180;
  const over = sp ? Math.cos(rad) + (H / W) * Math.sin(rad) : 1;
  const tf = sp
    ? `rotate(${(cam.rot + sp).toFixed(3)}deg) scale(${(over * (cam.rot ? 1.13 : 1)).toFixed(4)})`
    : cam.rot
      ? `rotate(${cam.rot}deg) scale(1.13)`
      : cam.dx || cam.dy
        ? "scale(1.03)"
        : undefined;
  const t = shot.at + f / FPS;
  const clip = shot.clip;
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: tf, filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined }}>
      {rig && (
        <ShotGL
          img={shot.img}
          cam={cam}
          t={f / FPS}
          rig={rig}
          blinkOn={L.includes("blink") && isBlinking(f, seed)}
          blinkBox={shot.blinkBox}
          lids={shot.lids}
          skin={shot.skin}
          lidOn={!!shot.lids && isBlinking(f, seed) && !(clip && t >= clip.at && t < clip.until)}
        />
      )}
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
        {clip && (
          <Sequence from={sec(clip.at)} durationInFrames={sec(clip.until) - sec(clip.at)} layout="none">
            <OffthreadVideo src={staticFile(clip.src)} muted trimBefore={Math.round(clip.from * FPS)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
        )}
        {shot.fog && <Fog fog={shot.fog} t={t} />}
        {L.includes("stink") && <Wisps f={f} at={body} w={w} h={h} kind="stink" />}
        {L.includes("steam") && <Wisps f={f} at={body} w={w} h={h} kind="steam" />}
        {L.includes("flies") && <Flies f={f} seed={seed} head={head} w={w} h={h} />}
        {(shot.sparkle ?? []).map((g, i) => <Sparkle key={i} g={g} t={t} w={w} h={h} />)}
        {shot.tag && <Tag tag={shot.tag} t={t} w={w} h={h} />}
      </div>
      {L.includes("vapor") && <Vapor t={t} />}
      {L.includes("hair") && <Hair t={t} />}
      {L.includes("buttons") && <Buttons t={t - (shot.punch ?? shot.at)} />}
      {shot.transition === "flash" && f < 10 && <AbsoluteFill style={{ background: "#fff", opacity: 1 - f / 10 }} />}
      {shot.flash !== undefined && t >= shot.flash && t < shot.flash + 8 / FPS && <AbsoluteFill style={{ background: "#fff", opacity: 1 - ((t - shot.flash) * FPS) / 8 }} />}
    </AbsoluteFill>
  );
};

// Misted mirror: a milky, blurred pane over `box`; at `wipe` a soft-edged band clears it left -> right in 15 frames.
const Fog: React.FC<{ fog: NonNullable<Shot["fog"]>; t: number }> = ({ fog, t }) => {
  const p = interpolate((t - fog.wipe) * FPS, [0, 15], [0, 1], { easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p >= 1) return null;
  const [x0, y0, x1, y1] = fog.box;
  const e = p * 125 - 12; // wipe edge in % of the box width, 12 % soft
  const wipe = p > 0 ? `linear-gradient(to right, transparent ${e}%, black ${e + 12}%)` : "linear-gradient(black, black)";
  const feather = "linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)";
  return (
    <div
      style={{
        position: "absolute",
        left: `${x0 * 100}%`,
        top: `${y0 * 100}%`,
        width: `${(x1 - x0) * 100}%`,
        height: `${(y1 - y0) * 100}%`,
        backdropFilter: "blur(18px)",
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(ellipse at 70% 75%, rgba(255,255,255,0.4), transparent 55%), rgba(236,242,240,0.62)",
        maskImage: `${wipe}, ${feather}`,
        WebkitMaskImage: `${wipe}, ${feather}`,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    />
  );
};

// Shower vapour over the whole frame: big soft white puffs drifting slowly upward (screen space, ~6 s cycle).
// Cut hair: dark curly strands flung across the frame (on top of the picture, outside the camera box).
const Hair: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 16 }, (_, i) => {
      const r = (k: string) => random(`hair${i}${k}`);
      const per = 0.7 + r("p") * 0.6;
      const ph = ((t + r("o") * per) % per) / per;
      const fromL = r("d") < 0.5;
      const x = fromL ? -300 + ph * 1700 : 1380 - ph * 1700;
      const y = 200 + r("y") * 1500 + (ph - 0.5) * (r("v") - 0.5) * 900 + ph * ph * 300;
      const size = 90 + r("s") * 220;
      const rot = r("r") * 360 + ph * (fromL ? 540 : -540);
      const k = 30 + r("c") * 40;
      return (
        <svg key={i} width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, filter: "blur(1px)", opacity: 0.92 }}>
          <path d={`M5 50 C 25 ${50 - k}, 40 ${50 + k}, 55 50 S 85 ${50 - k}, 95 ${45 + k / 3}`} stroke="#2A1E16" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M10 58 C 30 ${58 - k / 2}, 48 ${58 + k / 2}, 70 56 S 88 ${50 - k / 2}, 96 60`} stroke="#3B2A1E" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={`M15 44 C 35 ${44 + k / 2}, 55 ${44 - k / 2}, 80 42`} stroke="#1C140F" strokeWidth={3} fill="none" strokeLinecap="round" />
        </svg>
      );
    })}
  </AbsoluteFill>
);

// Shirt buttons: two bursts from the frame centre at t = 0 and 0.35 s, spinning outward with gravity (screen space).
const Buttons: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 14 }, (_, i) => {
      const r = (k: string) => random(`btn${i}${k}`);
      const tt = t - (i % 2) * 0.35 - r("d") * 0.08;
      if (tt < 0 || tt > 1.6) return null;
      const a = r("a") * Math.PI * 2;
      const v = 1400 + r("v") * 1200;
      const x = 540 + Math.cos(a) * v * tt;
      const y = 900 + Math.sin(a) * v * tt + 1600 * tt * tt;
      const size = 70 + r("s") * 60;
      const rot = r("r") * 360 + tt * (r("w") < 0.5 ? -900 : 900);
      return (
        <svg key={i} width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `rotate(${rot}deg) scaleX(${Math.cos(tt * 9 + i).toFixed(3)})` }}>
          <circle r={44} fill="#3A3330" stroke="#15110F" strokeWidth={7} />
          <circle r={30} fill="none" stroke="#5B514C" strokeWidth={4} />
          {[[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={6} fill="#15110F" />)}
        </svg>
      );
    })}
  </AbsoluteFill>
);

// Glint: a white 4-point star scaling up with a quarter turn, then fading (0.7 s), plus two small twinkles.
const Sparkle: React.FC<{ g: { at: number; pos: [number, number] }; t: number; w: number; h: number }> = ({ g, t, w, h }) => {
  const p = (t - g.at) / 0.7;
  if (p < 0 || p >= 1) return null;
  const star = (dx: number, dy: number, size: number, q: number, k: number) => {
    if (q <= 0 || q >= 1) return null;
    const s = Math.sin(q * Math.PI);
    return (
      <svg key={k} width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: g.pos[0] * w + dx - size / 2, top: g.pos[1] * h + dy - size / 2, transform: `scale(${s.toFixed(3)}) rotate(${(q * 90).toFixed(1)}deg)`, filter: "drop-shadow(0 0 12px rgba(255,240,170,0.95))" }}>
        <path d="M0 -50 Q6 -6 50 0 Q6 6 0 50 Q-6 6 -50 0 Q-6 -6 0 -50 Z" fill="#FFFDF2" />
      </svg>
    );
  };
  return (
    <>
      {star(0, 0, w * 0.16, p, 0)}
      {star(w * 0.07, -h * 0.03, w * 0.06, p * 1.4 - 0.2, 1)}
      {star(-w * 0.05, h * 0.04, w * 0.05, p * 1.5 - 0.45, 2)}
    </>
  );
};

// Sticker label on the picture: springs in with a tilt at `at`, then stays.
const Tag: React.FC<{ tag: NonNullable<Shot["tag"]>; t: number; w: number; h: number }> = ({ tag, t, w, h }) => {
  const g = Math.round((t - tag.at) * FPS);
  if (g < 0) return null;
  const s = spring({ frame: g, fps: FPS, config: { damping: 9, stiffness: 240, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: tag.pos[0] * w, top: tag.pos[1] * h, transform: `translate(-50%, -50%) rotate(-7deg) scale(${(s * w) / 2400})`, transformOrigin: "50% 50%", padding: "10px 30px", background: C.gold, border: `6px solid ${C.ink}`, borderRadius: 18, fontFamily: FONT, fontWeight: 900, fontSize: 84, color: C.ink, whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(0,0,0,0.35)" }}>
      {tag.text}
    </div>
  );
};

const Vapor: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 7 }, (_, i) => {
      const r = (k: string) => random(`vap${i}${k}`);
      const per = 5 + r("p") * 3;
      const ph = ((t + r("o") * per) % per) / per;
      const size = 520 + r("s") * 420;
      const x = r("x") * W + Math.sin(t * 0.5 + i) * 40 - size / 2;
      const y = H * (1.05 - ph * 1.1) - size / 2;
      const op = Math.sin(ph * Math.PI) * (0.22 + r("a") * 0.16);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 68%)", opacity: op, filter: "blur(20px)" }} />;
    })}
    <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)" }} />
  </AbsoluteFill>
);

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
