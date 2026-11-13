import { AbsoluteFill, Audio, spring, staticFile, useCurrentFrame } from "remotion";
import "./theme";
import { Captions, useWords } from "./components/Captions";
import { Music, Sfx } from "./components/Sfx";
import { ChoiceCard } from "./components/ChoiceCard";
import { CommentCard } from "./components/CommentCard";
import { Hud } from "./components/Hud";
import { Intro } from "./components/Intro";
import { Phone, isPhoneOn } from "./components/Phone";
import { Polaroid, ShotTrack } from "./components/Shot";
import { VoteResult } from "./components/VoteResult";
import { FPS, sec } from "./theme";
import type { Episode as Ep } from "./types";

// One episode, built only from its JSON. Layer order: shots, inserts, end card, phone, vote, captions, HUD.
// music: render with --props='{"music":true}' (scripts/r.sh final epXX --music).
export const Episode: React.FC<{ ep: Ep; music?: boolean }> = ({ ep, music }) => {
  const f = useCurrentFrame();
  const words = useWords(ep.words);
  const total = sec(ep.durationSec);
  const end = ep.end;
  const cardBg = !!end?.img;
  // comment card without img: the shots keep running underneath and slide down by shotY so the card sits above
  const slide = end?.type === "comment" && !end.img && end.shotY ? end.shotY * spring({ frame: f - sec(end.at), fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.8 } }) : 0;
  const cardOn = !!end && f >= sec(end.at);
  return (
    <AbsoluteFill style={{ background: "#1C1A22" }}>
      <AbsoluteFill style={{ transform: slide ? `translateY(${slide}px)` : undefined }}>
        <ShotTrack shots={ep.shots} total={cardBg ? sec(end!.at) : total} src={ep.imgSize} rigs={ep.rigs} />
      </AbsoluteFill>
      {(ep.inserts ?? []).map((ins, i) => (
        <Polaroid key={i} ins={ins} />
      ))}
      {ep.end?.type === "choice" && <ChoiceCard end={ep.end} />}
      {ep.end?.type === "comment" && <CommentCard end={ep.end} />}
      {(ep.phone ?? []).map((p, i) => (
        <Phone key={i} p={p} />
      ))}
      {ep.vote && <VoteResult vote={ep.vote} />}
      {ep.intro && <Intro intro={ep.intro} />}
      <Captions words={words} highlight={ep.highlight} lowered={isPhoneOn(ep.phone, f)} y={cardOn && end?.type === "comment" ? (end.capY ?? 1600) : undefined} />
      <Hud day={ep.day} daysLeft={ep.daysLeft} />
      {ep.voice && <Audio src={staticFile(ep.voice)} />}
      <Sfx ep={ep} words={words} />
      {(music || ep.music) && <Music words={words} total={total} />}
    </AbsoluteFill>
  );
};
