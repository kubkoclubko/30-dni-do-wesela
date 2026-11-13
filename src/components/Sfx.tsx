import { useEffect, useState } from "react";
import { Audio, Sequence, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { CHOICE_B_AT } from "./ChoiceCard";
import { HUD_FLIP_AT } from "./Hud";
import { VOTE_STAMP_AT } from "./VoteResult";
import { FPS, sec } from "../theme";
import type { Episode, Word } from "../types";

// Sound files and levels live in public/shared/sfx/sfx.json: {"pop": {"file": "pop.mp3", "db": -8}, ...}.
// A name missing there (or no sfx.json at all) is simply silent, so episodes never break on a missing file.
type Lib = Record<string, { file: string; db?: number }>;

const useLib = (): Lib => {
  const [lib, setLib] = useState<Lib>({});
  const [h] = useState(() => delayRender("sfx.json"));
  useEffect(() => {
    fetch(staticFile("shared/sfx/sfx.json"))
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((j: Lib) => {
        setLib(j);
        continueRender(h);
      });
  }, [h]);
  return lib;
};

// All cues come from the episode data itself; ep.sfx adds manual ones (e.g. the door when mama comes in).
export const cues = (ep: Episode, words: Word[]): { at: number; name: string }[] => {
  if (ep.autoSfx === false) return (ep.sfx ?? []).map((s) => ({ at: sec(s.at), name: s.name })).filter((x) => x.at >= 0);
  const c: { at: number; name: string }[] = [{ at: 0, name: "pop" }];
  if (ep.day >= 2) c.push({ at: HUD_FLIP_AT, name: "pop" });
  if (ep.vote) c.push({ at: VOTE_STAMP_AT, name: "pop" });
  for (const p of ep.phone ?? []) for (const m of p.messages) c.push({ at: sec(m.at), name: "blip" });
  for (const s of ep.shots) if (s.transition === "whip") c.push({ at: sec(s.at) - 2, name: "whoosh" });
  if (ep.end?.type === "choice") c.push({ at: sec(ep.end.at + 0.1), name: "pop" }, { at: sec(ep.end.at + CHOICE_B_AT), name: "pop" });
  if (ep.end) {
    const voiceEnd = words.length ? words[words.length - 1].e : ep.end.at;
    c.push({ at: sec(Math.max(ep.end.at, voiceEnd) + 0.25), name: "slide" });
  }
  for (const s of ep.sfx ?? []) c.push({ at: sec(s.at), name: s.name });
  return c.filter((x) => x.at >= 0);
};

export const Sfx: React.FC<{ ep: Episode; words: Word[] }> = ({ ep, words }) => {
  const lib = useLib();
  return (
    <>
      {cues(ep, words).map((c, i) =>
        lib[c.name] ? (
          <Sequence key={i} from={c.at} layout="none">
            <Audio src={staticFile(`shared/sfx/${lib[c.name].file}`)} volume={Math.pow(10, (lib[c.name].db ?? -6) / 20)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};

// Music: public/shared/music.mp3 from 0 s under the whole episode. Ducked by 20 dB while the voice runs, back to
// full volume (0.5 s ramp) once the voice ends (end card), fade-out over the last 2 s.
export const Music: React.FC<{ words: Word[]; total: number }> = ({ words, total }) => {
  const end = words.length ? words[words.length - 1].e : 0;
  const vol = (f: number) => {
    const t = f / FPS;
    const duck = interpolate(t, [end, end + 0.5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fade = interpolate(f, [total - 2 * FPS, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return Math.pow(10, (-20 * duck) / 20) * fade;
  };
  return <Audio src={staticFile("shared/music.mp3")} volume={vol} />;
};
