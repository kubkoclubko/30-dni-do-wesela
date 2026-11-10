import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Nunito Black/ExtraBold, local (public/shared/fonts), latin + latin-ext (Polish: ą ę ł ń ó ś ź ż).
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";
for (const w of ["800", "900"]) {
  loadFont({ family: "Nunito", url: staticFile(`shared/fonts/nunito-latin-${w}-normal.woff2`), weight: w, unicodeRange: LATIN });
  loadFont({ family: "Nunito", url: staticFile(`shared/fonts/nunito-latin-ext-${w}-normal.woff2`), weight: w, unicodeRange: LATIN_EXT });
}

export const FONT = "Nunito, sans-serif";
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  ink: "#1E1B22",
  cream: "#F4E6C4",
  gold: "#E8B04A",
  capGold: "#F2B544",
  hudBg: "rgba(28,26,34,0.85)",
  hudEdge: "#C9A45C",
  voteWin: "#4A3B2E",
  voteLose: "#2E2B33",
  phoneHead: "#3F5A44",
  phoneBg: "#EFE7D2",
  cardEdge: "#5A4632",
  navy: "#24365C",
  lineBlue: "#5B6B7E",
  mustard: "#D9A23A",
};

export const sec = (s: number) => Math.round(s * FPS);
