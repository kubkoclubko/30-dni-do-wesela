import { Img, random, staticFile } from "remotion";
import { FPS } from "../theme";
import type { Shot } from "../types";

// Layers drawn INSIDE the camera container, so they move/zoom with the picture.
// Coordinates are fractions of the image box (w x h px at the current zoom).

export const blinkImg = (img: string) => img.replace(/(\.\w+)$/, "_blink$1");

// Blink: 3 frames every 2-4 s, deterministic per shot seed. f = frame inside the shot.
export const isBlinking = (f: number, seed: number) => {
  let t = Math.round((0.6 + random(`b${seed}`) * 1.2) * FPS);
  for (let i = 0; t <= f; i++) {
    if (f < t + 3) return true;
    t += Math.round((2 + random(`b${seed}-${i}`) * 2) * FPS);
  }
  return false;
};

// Only the eye region of the _blink image is pasted over the shot (AI re-generations differ everywhere else),
// with a soft feathered mask edge. box = [x0, y0, x1, y1] in source pixels, src = source image size.
const FEATHER = "black 22%, black 78%, transparent";
export const BlinkLayer: React.FC<{ shot: Shot; f: number; seed: number; src: [number, number] }> = ({ shot, f, seed, src }) => {
  if (!isBlinking(f, seed)) return null;
  const img = <Img src={staticFile(blinkImg(shot.img))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
  if (!shot.blinkBox) return img;
  const [x0, y0, x1, y1] = shot.blinkBox;
  const mask = `linear-gradient(to right, transparent, ${FEATHER}), linear-gradient(to bottom, transparent, ${FEATHER})`;
  return (
    <div
      style={{
        position: "absolute",
        left: `${(x0 / src[0]) * 100}%`,
        top: `${(y0 / src[1]) * 100}%`,
        width: `${((x1 - x0) / src[0]) * 100}%`,
        height: `${((y1 - y0) / src[1]) * 100}%`,
        overflow: "hidden",
        maskImage: mask,
        WebkitMaskImage: mask,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <div style={{ position: "absolute", left: `${(-x0 / (x1 - x0)) * 100}%`, top: `${(-y0 / (y1 - y0)) * 100}%`, width: `${(src[0] / (x1 - x0)) * 100}%`, height: `${(src[1] / (y1 - y0)) * 100}%` }}>
        {img}
      </div>
    </div>
  );
};

const Fly: React.FC<{ x: number; y: number; size: number; up: boolean; flip: boolean }> = ({ x, y, size, up, flip }) => (
  <svg
    width={size}
    height={size}
    viewBox="-20 -20 40 40"
    style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: flip ? "scaleX(-1)" : undefined }}
  >
    <ellipse cx={-4} cy={up ? -11 : -6} rx={9} ry={up ? 4 : 6} fill="rgba(235,240,245,0.75)" stroke="#1E1B22" strokeWidth={1.5} transform={up ? "rotate(-25 -4 -11)" : undefined} />
    <ellipse cx={5} cy={up ? -11 : -6} rx={9} ry={up ? 4 : 6} fill="rgba(235,240,245,0.75)" stroke="#1E1B22" strokeWidth={1.5} transform={up ? "rotate(25 5 -11)" : undefined} />
    <ellipse cx={0} cy={2} rx={11} ry={7} fill="#1E1B22" />
    <circle cx={10} cy={0} r={5} fill="#1E1B22" />
    <circle cx={12} cy={-1} r={2} fill="#B8332E" />
  </svg>
);

export const Flies: React.FC<{ f: number; seed: number; head: [number, number]; w: number; h: number }> = ({ f, seed, head, w, h }) => {
  const n = 2 + Math.floor(random(`fn${seed}`) * 3); // 2-4
  const t = f / FPS;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: string) => random(`f${seed}-${i}-${k}`);
        const dir = r("d") < 0.5 ? -1 : 1;
        const a = r("p") * Math.PI * 2 + dir * t * (2.2 + r("s") * 1.6);
        const rx = (0.07 + r("rx") * 0.05) * w;
        const ry = (0.025 + r("ry") * 0.02) * h;
        const jx = Math.sin(t * 7.3 + i * 2) * 0.006 * w + Math.sin(t * 13.1 + i) * 0.003 * w;
        const jy = Math.cos(t * 6.1 + i * 3) * 0.004 * h + Math.sin(t * 11.7 + i) * 0.002 * h;
        const x = head[0] * w + Math.cos(a) * rx + jx;
        const y = (head[1] - 0.05) * h + Math.sin(a) * ry + jy;
        const flip = dir * -Math.sin(a) < 0;
        return <Fly key={i} x={x} y={y} size={w * 0.05} up={(f + i) % 4 < 2} flip={flip} />;
      })}
    </>
  );
};

// Stink (green) / steam (white): 3 wavy lines rising and fading over 2 s, looped and staggered.
export const Wisps: React.FC<{ f: number; at: [number, number]; w: number; h: number; kind: "stink" | "steam" }> = ({ f, at, w, h, kind }) => {
  const col = kind === "stink" ? "#9DBF5A" : "rgba(255,255,255,0.9)";
  const period = 2 * FPS;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = ((f + (i * period) / 3) % period) / period;
        const op = Math.min(1, p * 4) * (1 - p);
        const lw = w * 0.05;
        const lh = h * 0.06;
        const x = at[0] * w + (i - 1) * w * 0.06 + Math.sin(p * Math.PI * 2 + i) * w * 0.01;
        const y = at[1] * h - p * h * 0.12;
        return (
          <svg key={i} width={lw} height={lh} viewBox="0 0 40 100" style={{ position: "absolute", left: x - lw / 2, top: y - lh, opacity: op, overflow: "visible" }}>
            <path d="M20 100 C 0 80, 40 65, 20 50 S 0 20, 20 0" fill="none" stroke="#1E1B22" strokeWidth={11} strokeLinecap="round" opacity={kind === "stink" ? 0.8 : 0.25} />
            <path d="M20 100 C 0 80, 40 65, 20 50 S 0 20, 20 0" fill="none" stroke={col} strokeWidth={6} strokeLinecap="round" />
          </svg>
        );
      })}
    </>
  );
};

// Breathing: scaleY 1 -> 1.015 on a 2 s sine, pivot at the bottom (feet).
export const breathScale = (f: number) => 1 + 0.0075 * (1 - Math.cos((2 * Math.PI * f) / (2 * FPS)));
