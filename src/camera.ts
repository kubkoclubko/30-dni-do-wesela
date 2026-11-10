import { Easing } from "remotion";
import type { Shot } from "./types";

// Pure camera math (no React), shared by Shot.tsx and scripts/check_cam.ts.
// Rules: every move eases in (bezier 0.45,0,0.55,1) but never eases out, so it is still moving at the cut;
// a push is at most x1.08 per shot; consecutive shots of the same image continue from where the previous one
// ended (no jump); every planned move is scaled down until no image point moves more than MAX_JUMP px per frame.
// Exempt (deliberate): punch, shake, keys (fast re-frame with motion blur), whip.

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const MAX_JUMP = 1.8;
const E = Easing.bezier(0.45, 0, 0.55, 1);
const STRETCH = 1.6; // the ease curve is laid over 1.6x the shot, so at the cut it is still at speed
const ease = (p: number) => E(Math.min(1, p / STRETCH)) / E(1 / STRETCH);

type St = { z: number; fx: number; fy: number };
export type Plan = { a: number; b: number; s0: St; s1: St; cont: boolean; rot: number };
export type Cam = { z: number; fx: number; fy: number; rot: number; dx: number; dy: number; left: number; top: number; w: number; h: number; fast: number };

const lerp = (a: St, b: St, k: number): St => ({ z: a.z + (b.z - a.z) * k, fx: a.fx + (b.fx - a.fx) * k, fy: a.fy + (b.fy - a.fy) * k });

export const box = (s: St) => {
  const w = W * s.z;
  const h = H * s.z;
  return { w, h, left: Math.min(0, Math.max(W - w, W / 2 - s.fx * w)), top: Math.min(0, Math.max(H - h, H / 2 - s.fy * h)) };
};

// largest per-frame screen movement of the image points under the frame corners and centre
export const jump = (a: St, b: St) => {
  const A = box(a);
  const B = box(b);
  let m = 0;
  for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H], [W / 2, H / 2]]) {
    const u = (x - A.left) / A.w;
    const v = (y - A.top) / A.h;
    m = Math.max(m, Math.hypot(B.left + u * B.w - x, B.top + v * B.h - y));
  }
  return m;
};

const stateAt = (p: Plan, f: number) => lerp(p.s0, p.s1, p.cont ? f / Math.max(1, p.b - p.a) : ease(f / Math.max(1, p.b - p.a)));

const target = (s: Shot, s0: St): { s1: St; rot: number } => {
  const move = s.move ?? "push";
  const [fx, fy] = s.focus ?? [s0.fx, s0.fy];
  const cap = (z: number) => Math.min(z, s0.z * 1.08);
  switch (move) {
    case "pull":
      return { s1: { z: s0.z / 1.08, fx, fy }, rot: 0 };
    case "panX":
    case "tiltDown": {
      const [tx, ty] = s.to ?? (move === "panX" ? [fx + 0.1, fy] : [fx, fy + 0.1]);
      return { s1: { z: cap(s.zoomTo ?? s0.z * 1.02), fx: tx, fy: ty }, rot: 0 };
    }
    case "dutch":
      return { s1: { z: s0.z * 1.04, fx, fy }, rot: 4 };
    case "static":
      return { s1: { z: s0.z * 1.02, fx, fy }, rot: 0 };
    case "bounce": // softened to a gentle pull back to the wide (the old spring broke the 2 px rule)
      return { s1: { z: Math.max(1, s0.z / 1.08), fx, fy }, rot: 0 };
    default:
      return { s1: { z: cap(s.zoomTo ?? s0.z * 1.08), fx, fy }, rot: 0 };
  }
};

export const planCamera = (shots: Shot[], total: number): Plan[] => {
  const plans: Plan[] = [];
  shots.forEach((s, i) => {
    const a = Math.round(s.at * FPS);
    const b = i + 1 < shots.length ? Math.round(shots[i + 1].at * FPS) : total;
    const prev = plans[i - 1];
    const cont = !!prev && shots[i - 1].img === s.img && s.transition !== "whip";
    const move = s.move ?? "push";
    let s0: St;
    if (cont) s0 = { ...prev.s1 };
    else {
      const z = s.zoom ?? 1;
      const [fx, fy] = s.focus ?? [0.5, 0.5];
      s0 = move === "pull" || move === "bounce" ? { z: z * 1.08, fx, fy } : { z, fx, fy };
    }
    const t = target(s, s0);
    const plan: Plan = { a, b, s0, s1: t.s1, cont, rot: t.rot };
    // speed limit: scale the move until the worst frame-to-frame jump is under MAX_JUMP
    for (let it = 0; it < 4; it++) {
      let worst = 0;
      for (let f = 0; f < b - a; f++) worst = Math.max(worst, jump(stateAt(plan, f), stateAt(plan, f + 1)));
      if (worst <= MAX_JUMP) break;
      plan.s1 = lerp(plan.s0, plan.s1, (MAX_JUMP / worst) * 0.98);
    }
    plans.push(plan);
  });
  return plans;
};

// Full camera for frame f inside shot s (plan p), including the exempt effects.
export const camAt = (s: Shot, p: Plan, f: number): Cam => {
  let { z, fx, fy } = stateAt(p, f);
  const t = s.at + f / FPS;
  let fast = 0;
  for (const k of s.keys ?? []) {
    const q = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - k.at) / (k.dur ?? 0.4))));
    if (q <= 0) continue;
    if (q < 1) fast = 1;
    fx += (k.focus[0] - fx) * q;
    fy += (k.focus[1] - fy) * q;
    if (k.zoom) z += (z * (k.zoom / (s.zoom ?? 1)) - z) * q;
  }
  if (s.punch !== undefined && t >= s.punch) {
    const q = Math.min(1, ((t - s.punch) * FPS) / 4);
    if (q < 1) fast = 1;
    z *= 1 + 0.14 * Easing.out(Easing.cubic)(q);
  }
  let dx = 0;
  let dy = 0;
  if (s.shake !== undefined && t >= s.shake && t < s.shake + 0.5) {
    const k = (t - s.shake) * FPS;
    const amp = 14 * (1 - k / 15);
    dx = amp * Math.sin(k * 2.9);
    dy = amp * Math.cos(k * 3.7);
  }
  const bx = box({ z, fx, fy });
  return { z, fx, fy, rot: p.rot, dx, dy, left: bx.left + dx, top: bx.top + dy, w: bx.w, h: bx.h, fast };
};
