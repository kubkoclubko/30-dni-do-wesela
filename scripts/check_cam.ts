// usage: node scripts/check_cam.ts episodes/epXX.json
// Max frame-to-frame camera jump (px at 1080x1920) of the image points under the frame corners/centre, per shot,
// using the exact camera code (src/camera.ts). Deliberate effects (punch, shake, fast keys) are reported apart.
// Boundaries between shots of the same image are checked too (must be continuous).
import { readFileSync } from "node:fs";
import { FPS, camAt, jump, planCamera } from "../src/camera.ts";

const ep = JSON.parse(readFileSync(process.argv[2], "utf-8"));
const end = ep.end && (ep.end.type === "comment" || ep.end.img) ? ep.end.at : ep.durationSec;
const total = Math.round(end * FPS);
const plans = planCamera(ep.shots, total);
let bad = 0;
ep.shots.forEach((s: any, i: number) => {
  const p = plans[i];
  let worst = 0, at = 0, fx = 0;
  for (let f = 1; f < p.b - p.a; f++) {
    const a = camAt(s, p, f - 1), b = camAt(s, p, f);
    const shaking = s.shake !== undefined && Math.abs(s.at + f / FPS - s.shake - 0.25) < 0.3;
    const j = jump(a, b) + Math.hypot(b.dx - a.dx, b.dy - a.dy);
    if (a.fast || b.fast || shaking) { fx = Math.max(fx, j); continue; }
    if (j > worst) { worst = j; at = p.a + f; }
  }
  let seam = "";
  if (i > 0 && plans[i].cont) {
    const prev = camAt(ep.shots[i - 1], plans[i - 1], plans[i - 1].b - plans[i - 1].a);
    const now = camAt(s, p, 0);
    seam = ` seam ${jump(prev, now).toFixed(2)} px`;
  }
  const ok = worst <= 2;
  if (!ok) bad++;
  console.log(`${String(i + 1).padStart(2)} ${s.img.split("/").pop()?.padEnd(26)} ${s.move ?? "push"} max ${worst.toFixed(2)} px @f${at}${fx ? ` (fx ${fx.toFixed(0)} px)` : ""}${seam}${ok ? "" : "  <-- OVER 2 px"}`);
});
console.log(bad ? `FAIL: ${bad} shot(s) over 2 px` : "OK: no camera jump over 2 px inside a shot");
