// Episode data contract: episodes/epXX.json. All times in seconds, all image paths relative to public/.
// Image coordinates ([x, y]) are fractions 0..1 of the source image (source ideally 2160x3840, 9:16).

export type Move = "push" | "pull" | "panX" | "tiltDown" | "dutch" | "static";
export type Layer = "blink" | "flies" | "stink" | "steam" | "breath";

export type Shot = {
  at: number; // start (cut on a sentence/clause start); lasts until the next shot
  img: string; // "ep01/s01_room_wide.png"; the "blink" layer uses "ep01/s01_room_wide_blink.png"
  move?: Move; // default "push"
  focus?: [number, number]; // image point kept in the frame centre (clamped to the image), default [0.5, 0.5]
  to?: [number, number]; // end focus (panX / tiltDown override)
  zoom?: number; // 1 = whole image fills the frame (default 1; tiltDown/panX default 1.6/1.2)
  layers?: Layer[];
  head?: [number, number]; // where flies circle (default [0.5, 0.35])
  body?: [number, number]; // where stink/steam rises (default [0.5, 0.55])
  transition?: "cut" | "whip"; // into this shot, default "cut"
  seed?: number; // varies blinks/flies, default the shot index
  blinkBox?: [number, number, number, number]; // eye region [x0, y0, x1, y1] in source px; only it is taken from _blink
};

export type Insert = {
  at: number;
  dur: number;
  img: string;
  caption?: string; // "PRZED SPRZĄTANIEM"
  focus?: [number, number]; // crop centre in the photo
  y?: number; // polaroid centre y in px (default 760)
};

export type VoteOption = { label: string; votes: number };
export type Vote = { title?: string; a: VoteOption; b: VoteOption; dur?: number }; // winner = more votes; dur default 4

export type ChatMsg = {
  at: number;
  from: "me" | "them";
  text?: string;
  img?: string;
  typing?: number; // seconds of "…" before the message appears
};
export type Phone = { at: number; until: number; name: string; subtitle?: string; messages: ChatMsg[] };

export type ChoiceEnd = {
  type: "choice";
  at: number;
  img: string; // the wide shot the camera bounces out to
  focus?: [number, number];
  title: string; // "OD CZEGO ZACZNIE?"
  a: { label: string; icon: string }; // icon: built-in name (shower, scissors) or an .svg/.png path
  b: { label: string; icon: string };
  cta?: string; // default "NAPISZ W KOMENTARZU: {a} albo {b}"
};
export type CommentEnd = {
  type: "comment";
  at: number;
  img?: string; // background (dimmed); default dark
  character?: string; // full-body cut-out, bottom centre
  kicker: string; // "30 DNI: MIREK · DZIEŃ 02"
  title: string; // "Co Mirek ma zrobić dalej?"
  pill1?: string;
  pill2?: string;
};

export type Episode = {
  id: string; // "ep01"
  day: number; // DZIEŃ 01
  daysLeft: number; // 30 DNI DO WESELA (from day 2 it flips from daysLeft+1)
  durationSec: number;
  imgSize?: [number, number]; // source image size in px (default 2160x3840), for blinkBox
  voice?: string; // "ep01/voice.mp3"
  words?: string; // "ep01/words.json"
  highlight?: string[]; // caption keywords in gold (case-insensitive, no punctuation)
  vote?: Vote; // day 2+, first ~4 s
  shots: Shot[];
  inserts?: Insert[];
  phone?: Phone[];
  end?: ChoiceEnd | CommentEnd;
};

export type Word = { w: string; s: number; e: number };
