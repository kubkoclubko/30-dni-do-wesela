import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Easing, cancelRender, continueRender, delayRender, random, staticFile } from "remotion";
import { FPS, H, W, type Cam } from "../camera";
import type { Rig } from "../types";

// A rigged shot drawn in WebGL: camera crop + a smooth image warp (no cut-out layers, so no holes or double
// outlines) for up to 2 figures, and the eye-region blink, which therefore moves with the head.
//  - breathing: the whole figure rises and sinks on a 3 s sine, 0 at the feet growing to ~5 px at the head
//  - nod: every 2-3 s (deterministic) the head tips 2.5 deg forward around the neck and back in ~0.5 s
// Masks (R = body, G = head, soft) come from scripts/make_rig.py -> public/epXX/rig/<image>_fig<i>.png.

export const maskPath = (img: string, i: number) => img.replace(/([^/]+)\.\w+$/, (_m, base) => `rig/${base}_fig${i}.png`);
export const blinkPath = (img: string) => img.replace(/(\.\w+)$/, "_blink$1");

const VS = `#version 300 es
in vec2 p; out vec2 vPos;
void main(){ vPos = vec2((p.x + 1.0) * 0.5 * ${W}.0, (1.0 - p.y) * 0.5 * ${H}.0); gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uImg, uBlink, uM0, uM1;
uniform vec4 uBox; uniform vec2 uImgPx; uniform float uCover;
uniform vec4 uF0, uN0, uF1, uN1; uniform float uBlinkOn; uniform vec4 uBB;
in vec2 vPos; out vec4 o;
vec2 fig(vec2 p, float body, float head, vec4 F, vec4 N){
  float ramp = clamp((F.x - p.y) / max(1.0, F.x - F.y), 0.0, 1.0);
  p.y += F.z * body * ramp;                       // content rises -> sample from below
  vec2 d = p - N.xy; float c = cos(-N.z), s = sin(-N.z);
  vec2 r = vec2(c * d.x - s * d.y, s * d.x + c * d.y) + N.xy;
  r.y -= N.w;                                     // dip: content moves down -> sample from above
  return mix(p, r, head);
}
void main(){
  vec2 b = (vPos - uBox.xy) / uBox.zw;
  vec2 uv = uCover > 1.0 ? vec2(b.x, 0.5 + (b.y - 0.5) / uCover) : vec2(0.5 + (b.x - 0.5) * uCover, b.y);
  vec4 m0 = texture(uM0, uv); vec4 m1 = texture(uM1, uv);
  vec2 q = fig(uv * uImgPx, m0.r, m0.g, uF0, uN0);
  q = fig(q, m1.r, m1.g, uF1, uN1);
  q /= uImgPx;
  vec4 col = texture(uImg, q);
  if (uBlinkOn > 0.5) {
    vec2 fw = (uBB.zw - uBB.xy) * 0.22;
    float w = smoothstep(uBB.x, uBB.x + fw.x, q.x) * (1.0 - smoothstep(uBB.z - fw.x, uBB.z, q.x))
            * smoothstep(uBB.y, uBB.y + fw.y, q.y) * (1.0 - smoothstep(uBB.w - fw.y, uBB.w, q.y));
    col = mix(col, texture(uBlink, q), w);
  }
  o = vec4(col.rgb, 1.0);
}`;

const loadImg = (url: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error(`image failed: ${url}`));
    i.src = url;
  });

const E = Easing.inOut(Easing.sin);
const breath = (t: number, seed: number) => 0.5 * (1 - Math.cos((2 * Math.PI * t) / 3 + random(`br${seed}`) * 6.28));
// nod envelope 0..1..0 over 0.5 s, every 2-3 s
const nod = (t: number, seed: number) => {
  let s = 0.6 + random(`nd${seed}`) * 1.4;
  for (let i = 0; s <= t; i++) {
    const u = (t - s) / 0.5;
    if (u < 1) return u < 0.5 ? E(u * 2) : E((1 - u) * 2);
    s += 2 + random(`nd${seed}-${i}`);
  }
  return 0;
};

type GLS = { gl: WebGL2RenderingContext; prog: WebGLProgram; tex: WebGLTexture[]; size: [number, number] };

export const ShotGL: React.FC<{ img: string; cam: Cam; t: number; rig: Rig; blinkOn: boolean; blinkBox?: [number, number, number, number] }> = ({ img, cam, t, rig, blinkOn, blinkBox }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [st, setSt] = useState<GLS | null>(null);
  const [handle] = useState(() => delayRender(`gl ${img}`));
  const done = useRef(false);
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false })!;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const n = rig.figures.length;
    const urls = [img, blinkBox ? blinkPath(img) : img, maskPath(img, 0), maskPath(img, n > 1 ? 1 : 0)];
    Promise.all(urls.map((u) => loadImg(staticFile(u))))
      .then((ims) => {
        const tex = ims.map((im, i) => {
          const tx = gl.createTexture()!;
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, tx);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          return tx;
        });
        ["uImg", "uBlink", "uM0", "uM1"].forEach((u, i) => gl.uniform1i(gl.getUniformLocation(prog, u), i));
        setSt({ gl, prog, tex, size: [ims[0].naturalWidth, ims[0].naturalHeight] });
      })
      .catch((e) => cancelRender(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!st) return;
    const { gl, prog, size } = st;
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const [iw, ih] = size;
    const cover = W / H / (iw / ih);
    const scr = cover > 1 ? cam.w / iw : cam.h / ih; // screen px per image px
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform4f(U("uBox"), cam.left, cam.top, cam.w, cam.h);
    gl.uniform2f(U("uImgPx"), iw, ih);
    gl.uniform1f(U("uCover"), cover);
    for (let i = 0; i < 2; i++) {
      const fg = rig.figures[i];
      if (!fg) {
        gl.uniform4f(U(`uF${i}`), 0, 0, 0, 0);
        gl.uniform4f(U(`uN${i}`), 0, 0, 0, 0);
        continue;
      }
      const seed = fg.seed ?? i + 1;
      const headTop = (fg.head[1] - fg.head[3]) * ih;
      const lift = (5 / scr) * breath(t, seed);
      const v = nod(t, seed);
      const neckToTop = fg.neck[1] * ih - headTop;
      gl.uniform4f(U(`uF${i}`), fg.feet * ih, headTop, lift, 0);
      gl.uniform4f(U(`uN${i}`), fg.neck[0] * iw, fg.neck[1] * ih, ((2.5 * Math.PI) / 180) * v * (fg.facing ?? 0), v * neckToTop * 0.045);
    }
    gl.uniform1f(U("uBlinkOn"), blinkOn && blinkBox ? 1 : 0);
    if (blinkBox) gl.uniform4f(U("uBB"), blinkBox[0] / iw, blinkBox[1] / ih, blinkBox[2] / iw, blinkBox[3] / ih);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!done.current) {
      done.current = true;
      continueRender(handle);
    }
  });

  return <canvas ref={ref} width={W * dpr} height={H * dpr} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />;
};
