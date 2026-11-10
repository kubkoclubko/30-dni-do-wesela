import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import "./theme";
import { Captions, useWords } from "./components/Captions";
import { ChoiceCard } from "./components/ChoiceCard";
import { CommentCard } from "./components/CommentCard";
import { Hud } from "./components/Hud";
import { Phone, isPhoneOn } from "./components/Phone";
import { Polaroid, ShotTrack } from "./components/Shot";
import { VoteResult } from "./components/VoteResult";
import { sec } from "./theme";
import type { Episode as Ep } from "./types";

// One episode, built only from its JSON. Layer order: shots, inserts, end card, phone, vote, captions, HUD.
export const Episode: React.FC<{ ep: Ep }> = ({ ep }) => {
  const f = useCurrentFrame();
  const words = useWords(ep.words);
  const total = sec(ep.durationSec);
  return (
    <AbsoluteFill style={{ background: "#1C1A22" }}>
      <ShotTrack shots={ep.shots} total={ep.end ? sec(ep.end.at) : total} />
      {(ep.inserts ?? []).map((ins, i) => (
        <Polaroid key={i} ins={ins} />
      ))}
      {ep.end?.type === "choice" && <ChoiceCard end={ep.end} />}
      {ep.end?.type === "comment" && <CommentCard end={ep.end} />}
      {(ep.phone ?? []).map((p, i) => (
        <Phone key={i} p={p} />
      ))}
      {ep.vote && <VoteResult vote={ep.vote} />}
      <Captions words={words} highlight={ep.highlight} lowered={isPhoneOn(ep.phone, f)} />
      <Hud day={ep.day} daysLeft={ep.daysLeft} />
      {ep.voice && <Audio src={staticFile(ep.voice)} />}
    </AbsoluteFill>
  );
};
