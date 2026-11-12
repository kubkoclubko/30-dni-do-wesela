// Episode data contract: episodes/epXX.json. All times in seconds, all image paths relative to public/.
// Image coordinates ([x, y]) are fractions 0..1 of the source image (source ideally 2160x3840, 9:16).

export type Move = "push" | "pull" | "panX" | "tiltDown" | "dutch" | "bounce" | "static";
export type Layer = "blink" | "flies" | "stink" | "steam" | "breath" | "vapor";

export type Shot = {
  at: number; // start (cut on a sentence/clause start); lasts until the next shot
  img: string; // "ep01/s01_room_wide.png"; the "blink" layer uses "ep01/s01_room_wide_blink.png"
  move?: Move; // default "push"
  focus?: [number, number]; // image point kept in the frame centre (clamped to the image), default [0.5, 0.5]
  to?: [number, number]; // end focus (panX / tiltDown override)
  zoom?: number; // 1 = whole image fills the frame (default 1; tiltDown/panX default 1.6/1.2)
  zoomTo?: number; // end zoom (push default zoom*1.08)
  keys?: { at: number; focus: [number, number]; zoom?: number; dur?: number }[]; // quick re-frames at absolute times
  punch?: number; // absolute time of a short zoom punch (+14 % in 4 frames)
  shake?: number; // absolute time of a camera shake (0.5 s)
  layers?: Layer[];
  head?: [number, number]; // where flies circle (default [0.5, 0.35])
  body?: [number, number]; // where stink/steam rises (default [0.5, 0.55])
  transition?: "cut" | "whip"; // into this shot, default "cut"
  seed?: number; // varies blinks/flies, default the shot index
  blinkBox?: [number, number, number, number]; // eye region [x0, y0, x1, y1] in source px; only it is taken from _blink
  lids?: [number, number, number, number][]; // painted blink (no _blink image): eye ellipses cx, cy, rx, ry (fractions), rigged shots only
  skin?: string; // lid colour for `lids`, e.g. "#e9b09c"
  cut?: boolean; // new framing (zoom/focus) even after a shot of the same image, instead of continuing its camera
  spin?: [number, number]; // rotation in deg from shot start to end, around the frame centre (overscan added automatically)
  clip?: { src: string; at: number; from: number; until: number }; // muted video over the image from `at` to `until` (absolute s), starting at clip time `from`
  fog?: { box: [number, number, number, number]; wipe: number }; // misted region x0,y0,x1,y1 (fractions), wiped left->right in 15 frames at `wipe` (absolute s)
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
export type Vote = { title?: string; a: VoteOption; b: VoteOption; dur?: number; stamp?: string }; // winner = more votes; dur default 4; shown as % of all votes

export type ChatMsg = {
  at: number;
  from: "me" | "them";
  text?: string;
  img?: string;
  typing?: number; // seconds of "…" before the message appears
  crop?: [number, number, number]; // img: crop centre x, y and zoom (shown as an old faded photo)
};
export type Draft = { at: number; text: string; type?: number; hold?: number; del?: number }; // text typed into the input field, then deleted (s)
export type Phone = { at: number; until: number; name: string; subtitle?: string; messages: ChatMsg[]; drafts?: Draft[]; shake?: number; y?: number; scale?: number };

export type ChoiceEnd = {
  type: "choice";
  at: number;
  img?: string; // own background with the 1.15 -> 1 bounce; omit to keep the last shot (give it move 'bounce')
  focus?: [number, number];
  title: string; // "OD CZEGO ZACZNIE?"
  a: { label: string; icon: string }; // icon: built-in name (shower, scissors) or an .svg/.png path
  b: { label: string; icon: string };
  cta?: string; // default "NAPISZ W KOMENTARZU: {a} albo {b}"
};
export type CommentEnd = {
  type: "comment";
  at: number;
  img?: string; // background (dimmed); omit to keep the shots running underneath (rigged, moving)
  shotY?: number; // no img: px the running shot slides down (spring) so the card sits above the character
  capY?: number; // caption centre y while the card is up (default 1600)
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
  rigs?: Record<string, Rig>; // keyed by image path; shots of that image get breathing + nods
  music?: boolean; // public/shared/music.mp3 under the whole episode (ducked under the voice)
  sfx?: { at: number; name: string }[]; // manual cues on top of the automatic ones (e.g. "door")
};

// Character rig for image warps (fractions of the source image). Masks: scripts/make_rig.py.
export type Figure = {
  outline: [number, number][]; // body polygon (soft-edged in the mask)
  head: [number, number, number, number]; // head ellipse cx, cy, rx, ry
  neck: [number, number]; // nod pivot
  feet: number; // y where the figure stands (0 lift there); > 1 if the feet are out of frame
  facing?: -1 | 0 | 1; // nod direction: 1 = faces right, -1 = left, 0 = frontal (dip only)
  seed?: number;
};
export type Rig = { figures: Figure[] }; // at most 2 figures

export type Word = { w: string; s: number; e: number };
