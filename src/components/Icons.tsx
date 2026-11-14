import { Img, staticFile } from "remotion";
import { C } from "../theme";

// Line-art icons (blue-grey + mustard) for ChoiceCard. Add new ones here once; episodes refer to them by name,
// or pass an .svg/.png path under public/ instead, or an emoji ("🪒").
const S = { fill: "none", strokeWidth: 7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS: Record<string, React.ReactNode> = {
  shower: (
    <>
      <path d="M30 140 V40 Q30 22 48 22 H86 Q104 22 104 40 V52" stroke={C.lineBlue} {...S} />
      <path d="M78 52 H130 L120 74 H88 Z" stroke={C.lineBlue} {...S} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${92 + i * 9} 88 l-4 14 M${90 + i * 9} 112 l-4 14`} stroke={C.mustard} {...S} strokeWidth={6} />
      ))}
    </>
  ),
  scissors: (
    <>
      <circle cx={46} cy={112} r={20} stroke={C.lineBlue} {...S} />
      <circle cx={104} cy={112} r={20} stroke={C.lineBlue} {...S} />
      <path d="M58 96 L108 22 M92 96 L42 22" stroke={C.mustard} {...S} />
      <circle cx={75} cy={66} r={4} fill={C.lineBlue} />
    </>
  ),
};

export const Icon: React.FC<{ name: string; size: number }> = ({ name, size }) =>
  /\.(svg|png|jpe?g|webp)$/i.test(name) ? (
    <Img src={staticFile(name)} style={{ width: size, height: size, objectFit: "contain" }} />
  ) : !ICONS[name] && /\p{Extended_Pictographic}/u.test(name) ? (
    <div style={{ width: size, height: size, fontSize: size * 0.78, lineHeight: `${size}px`, textAlign: "center" }}>{name}</div>
  ) : (
    <svg width={size} height={size} viewBox="0 0 150 150">
      {ICONS[name] ?? <circle cx={75} cy={75} r={50} stroke={C.lineBlue} {...S} />}
    </svg>
  );
