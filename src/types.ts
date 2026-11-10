// Episode data contract: episodes/epXX.json. Draft, filled in at step 2.
export type Move = "push" | "pull" | "panX" | "tiltDown" | "dutch" | "static";
export type Layer = "blink" | "flies" | "stink" | "steam" | "breath";

export type Shot = {
  at: number; // start in seconds (cut on a sentence or clause start)
  img: string; // path under public/, e.g. "ep01/s01_room_wide.png"
  move?: Move;
  focus?: [number, number]; // crop centre in the source image, 0..1
  zoom?: number; // base crop zoom, 1 = full image
  layers?: Layer[];
  transition?: "cut" | "whip";
};

export type Episode = {
  id: string; // "ep01"
  day: number; // DZIEŃ 01
  daysLeft: number; // 30 DNI DO WESELA
  durationSec: number;
  voice: string; // "ep01/voice.mp3"
  words: string; // "ep01/words.json"
  highlight?: string[];
  shots: Shot[];
};
