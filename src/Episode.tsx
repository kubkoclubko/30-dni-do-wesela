import { AbsoluteFill } from "remotion";
import type { Episode as Ep } from "./types";

// Placeholder until step 2 (Shot, Overlays, Hud, VoteResult, Captions, Phone, ChoiceCard, CommentCard).
export const Episode: React.FC<{ ep: Ep }> = ({ ep }) => (
  <AbsoluteFill style={{ background: "#1C1A22", color: "#F4E6C4", justifyContent: "center", alignItems: "center", fontSize: 80 }}>
    {ep.id} · DZIEŃ {String(ep.day).padStart(2, "0")}
  </AbsoluteFill>
);
