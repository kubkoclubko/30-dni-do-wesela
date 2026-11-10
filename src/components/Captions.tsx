import { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import type { Word } from "../types";

export const useWords = (path?: string): Word[] => {
  const [words, setWords] = useState<Word[]>([]);
  const [handle] = useState(() => (path ? delayRender(`words ${path}`) : null));
  useEffect(() => {
    if (!path || handle === null) return;
    fetch(staticFile(path))
      .then((r) => (r.ok ? r.json() : []))
      .then((w: Word[]) => {
        setWords(w);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [path, handle]);
  return words;
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

// Groups of 1-4 words: break after sentence punctuation, a pause > 0.3 s, 4 words or ~20 characters.
const group = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (!next || /[.?!,:;]$/.test(w.w) || next.s - w.e > 0.3 || cur.length >= 4 || chars + next.w.length > 20) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
};

// White rounded sans with a 6 px dark outline; words appear as spoken; keywords in gold. y ~ 62 % of the height
// (moved below the phone while a phone is on screen).
export const Captions: React.FC<{ words: Word[]; highlight?: string[]; lowered?: boolean }> = ({ words, highlight = [], lowered }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const hl = new Set(highlight.map(norm));
  const groups = group(words);
  const gi = groups.findIndex((g, i) => t >= g[0].s && t < (groups[i + 1]?.[0].s ?? g[g.length - 1].e + 0.4));
  if (gi < 0) return null;
  const g = groups[gi];
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: lowered ? 1600 : 1190,
          left: 90,
          right: 90,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 18px",
          transform: "translateY(-50%)",
        }}
      >
        {g.map((w, i) => {
          const sf = Math.round(w.s * FPS);
          if (f < sf) return null;
          const pop = interpolate(f - sf, [0, 3], [1.12, 1], { extrapolateRight: "clamp" });
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 58,
                lineHeight: "76px",
                color: hl.has(norm(w.w)) ? C.capGold : "#fff",
                WebkitTextStroke: `12px ${C.ink}`,
                paintOrder: "stroke fill",
                textShadow: "0 4px 0 rgba(30,27,34,0.6)",
                display: "inline-block",
                transform: `scale(${pop})`,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
