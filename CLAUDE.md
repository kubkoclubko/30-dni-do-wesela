# 30 dni do wesela

Polish vertical (1080×1920, 30 fps) 2D comic series for Reels/TikTok in Remotion: static AI images with camera moves, a few small animated layers (blink, breathing, flies, vapour), HUD, captions, phone chat, end card. No three.js. Hero: Mirek (34), 30 days to sort himself out before his sister Ola's wedding; viewers decide in the comments. Characters and format rules: `Mirek_30_dni_do_wesela_POZNAMKY.md`. History per episode: `LOG.md`.

Repo `kubkoclubko/30-dni-do-wesela` (private). The older 3D project is `C:\Users\ondri\shorts`.

## Folder structure
```
src/Root.tsx            every episodes/epXX.json becomes a composition "epXX"
src/types.ts            the episode JSON contract
src/Episode.tsx         builds one episode from its JSON
src/components/         Shot, ShotGL (WebGL warp: breathing, nods, blink), Overlays, Hud, VoteResult, Captions, Phone, ChoiceCard, CommentCard, Sfx
src/camera.ts           camera planner (ease-in, continues across shots, <= 1.8 px/frame)
episodes/epXX.json      one file per episode
public/epXX/            images, voice.mp3, words.json, fix.json
public/shared/          sprites, icons, sfx/ (levels in sfx.json), fonts/, music.mp3
scripts/                r.sh (still|preview|final), transcribe.py, fix_words.py, make_rig.py, check_cam.ts, make_music.py, make_sfx.py, short_qa.py
```

## New episode workflow
Input: the owner's brief in `BRIEF_TEMPLATE.md` format. Don't read old episodes beyond what the brief needs.
1. Voice → `public/epXX/voice.mp3`. Check the end for a garbled tail (ElevenLabs once appended ~2 s); trim with a fade, keep the original.
2. New jpgs: upscale 2x first (Real-ESRGAN, see LOG.md ep02).
3. `ffmpeg -i voice.mp3 -ar 48000 voice.wav` → `python scripts/transcribe.py public/epXX/voice.mp3 public/epXX/words_raw.json` → `python scripts/fix_words.py public/epXX`. Whisper medium (pl) always needs `fix.json`: digits → split, hyphenated words → `merge`, misheard words.
4. `episodes/epXX.json` (shots by sentence starts). A new episode never needs a code change.
5. Figures that breathe/nod: `rigs` in the JSON (read off a 5 % grid), then `python scripts/make_rig.py episodes/epXX.json`. Max 2 figures per image. AI `_blink` variants differ in every pixel: set `blinkBox` + `imgSize`.
6. `node scripts/check_cam.ts episodes/epXX.json` must print OK.
7. `bash scripts/r.sh still epXX <frame>` → `preview` → `final`, then `scripts/short_qa.py`. Append bullets to `LOG.md`.

## Owner rules
- Opening: never an empty wide. A smooth eased push-in on Mirek's face, no hard cut in the first seconds, something moving in the first second.
- Something new on screen every ~1–1.5 s. A reaction lands 0–3 frames before its word.
- Camera: every move eases in (bezier 0.45,0,0.55,1), never out; push ≤ ×1.08 per shot; same image continues with no jump; ≤ 2 px/frame. Exempt: punch, shake, `keys`, whip. Punch and shake only on the 1–2 punchlines.
- Breathing 3 s cycle, ≤ 5 px at the head, 0 at the feet; 2.5° nod every 2–3 s.
- Low-res source: keep `focus`/`to` within ±(1-1/zoom)/2 around 0.5, or the pan freezes at the edge.
- Music `"music": true`: ducked −20 dB under the voice, full after it, 2 s fade-out. Voice −14 LUFS, SFX ~10 LU under. Master −15 LUFS, true peak ≤ −1 dBTP. With music, measure each SFX cue against it.
- The end card format is not fixed: take it from the brief and make the voice ending match. Never invent comments or winners.

## Token-saving rules
1. Renders and stills: `--gl=angle`, concurrency 2 (GTX 1660 SUPER: 1–2 threads fastest). Ignore `npx remotion gpu` (wrongly "Disabled"); check WEBGL_RENDERER inside a render.
2. Stills at `--scale=0.4` via `scripts/r.sh still`, at most 3 per step; prefer one contact sheet over several stills. Never judge motion on stills: use the 10 s preview at `--scale=0.5`. For final QA pull frames from the mp4.
3. Render and npm output go to a file; show only `tail -20`. Time estimates in minutes (a whole episode final ~80 s incl. QA).
4. 2K export: exactly `--scale 1.3333333333333333`.
5. Code structure via Graphify (`graphify_find`, `query_graph`), not whole files. Don't re-read files you wrote.
6. Claude checks stills itself, the owner reviews the low-res preview. No verifier or parallel agents.
7. Short chat replies; don't repeat code that is in files.
8. Graphify memory (repo `kubkoclubko/30-dni-do-wesela`): `recall` before new work; `remember` only final decisions and real gotchas, a few per session, with tags and `occurred_at`. New notes need approval in Memory > Needs review (until then only `recall(profile='audit')`).
9. No secrets or personal data in code, notes or commits.

## Tooling gotchas
- Python under Git Bash can't open `/tmp/...`: use a project path.
- Node 26 runs `.ts` directly.
- `gh` isn't logged in: create repos on github.com, push with plain git.

## Learnings (2026-11-10, motion + music pass)
6. Camera rule (owner): every move eases in (bezier 0.45,0,0.55,1) but never out, so it is still moving at the cut. A push is at most ×1.08 per shot, a shot of the same image continues the previous one with no jump, and nothing moves more than 2 px per frame inside a shot. `src/camera.ts` scales oversized moves down automatically, so big tilts and close-crop splits no longer happen. Only punch, shake, `keys` (with motion blur) and whip are exempt; the owner wants punch and shake only on the 1–2 punchlines.
7. Character motion is a WebGL warp (`ShotGL.tsx`): soft masks from `make_rig.py`, breathing on a 3 s cycle up to 5 px at the head and 0 at the feet, plus a 2.5° nod every 2–3 s. At most 2 figures per image. Blink is drawn in the same shader, so the eyes move with the head. Shots of unrigged images use the plain DOM image.
8. Music is now part of the main render (`"music": true` in the episode): our own piano theme from `scripts/make_music.py`, synthesised in numpy because fluidsynth isn't installed. Ducked −20 dB under the voice, full volume once the voice ends, 2 s fade-out.
9. Tooling gotchas: Python under Git Bash can't open `/tmp/...` paths (use a project path). Node 26 runs `.ts` directly (`node scripts/check_cam.ts`). `gh` isn't logged in, so a new repo is created on github.com and pushed with plain git.

## Learnings (ep03, 2026-11-13)
10. Python on this machine (user novyn) is only `py` (the `python` alias is the Store stub). Real-ESRGAN is in `~/tools/realesrgan`; Pillow had to be installed (`py -m pip install pillow`). `r.sh` falls back to `py` for the QA step.
11. New contract fields: `intro` (follower count-up with confetti + Instagram comment card with stamp), `shot.free` (big eased in-out zoom, exempt from the 1.08 cap and speed limit, e.g. 1.0 -> 2.0 hook), `shot.flash` / `transition: "flash"`, layer `hair`, `msg.fresh` (normal photo in chat), `phone.punch` (zoom onto the header name), `autoSfx: false` (only the manual cues, to keep SFX <= 5).
12. A changed voice opening is spliced in silence (new clip to end of speech + 70 ms, old voice from 30 ms before the next word), then every time >= the splice shifts by the difference; keep the original as `voice_v1.mp3`. The render comes out ~-18 LUFS, so the final gets a two-pass `loudnorm` (I -15, TP -1.5) with the video stream copied.

## Learnings (ep04, 2026-11-14)
13. Multiple `keys` in one shot compound their zoom: each key multiplies by `zoom / shot.zoom`. For a second key with a net target Z after a first key K, write `zoom = Z / K * shot.zoom` (e.g. 1.6 -> 1.8 -> net 1.5 needs 1.333).
14. A shot driven only by `keys` should be `move: "static"`: the default push adds to the key moves and `check_cam.ts` fails (2.02 px on s25).
15. Generate the episode JSON from a small Python script (`scripts/mk_ep04.py`): lids, skin and rigs are shared per image, so one table replaces 20 repeated blocks. New contract fields this time: layer `buttons` (burst at `shot.punch`), `shot.sparkle`, `shot.tag`, emoji icons on the ChoiceCard.

## Learnings (ep05, 2026-11-15)
16. A push ignores `to` (only tiltDown/panX read it), and with `free: true` a tiltDown has no speed limit, so a long eased tilt (whole prescription, top to floor) or a hook zoom that also drifts focus is `move: "tiltDown", free: true, to, zoomTo`.
17. Focus is clamped to ±(1-1/zoom)/2 around 0.5, so a face near the image edge (Kasia at x 0.775) can't be centred even at 1.8. Pick framings with that in mind instead of expecting the face in the middle.
18. New contract fields: `shot.clocks` (wall clock repainted with spinning hands, timelapse), `shot.pops` (round crop of the picture kicks 1 -> 1.3, for icons painted in the image), `shot.blush`, `end.follow` (follower bar + pulsing OBSERWUJ button under the ChoiceCard) and `end.capY` for the choice card too. New SFX tick + boing (make_sfx.py, appended at the end so older sounds stay byte-identical).

## Learnings (ep06, 2026-11-16)
19. `fix_words.py` looks fixes up by the lowercased Whisper word (`"huntle?"`, not `"Huntle?"`). Check the brief against the voice before trimming: ep06's voice did not start with the announced "Dzień zero cztery" (energy + transcript), so nothing was cut and the quoted lines in the brief were only paraphrases; time the shots from `words.json`, not from the brief.
20. A `clip` is drawn inside the camera box (it zooms with the picture) and when it ends the base image shows again. So a clip shot needs the same zoom as the shots around it, and its last frame must equal the base image: extract freeze frames with `ffmpeg -ss <t> -frames:v 1 -pix_fmt yuvj420p` (not at the very last frame, 7.8 for a 7.9 s clip), upscale them 2x and use them as the image of the following shot. Keep `until - at + from` below the clip length.
21. `shot.shake` is one 0.5 s shake, so a constant jitter is several same-image shots each with its own `shake`. New: `vote.sub` (small line under the vote title), SFX `clink` + `dun` (appended to make_sfx.py). `r.sh` temp dir is now `${REMOTION_TMP:-C:/Users/ondri/remotion-tmp}`; the Whisper step needs `python` (not `py`, which lacks faster-whisper on this PC).

## Learnings (ep06 re-take, 2026-11-16)
22. A new voice take with the same text needs no rebuild: keep the old JSON as `epXX_v1.json` and remap every time (shot `at`, shake, punch, flash, keys, pops, clip, phone, end, sfx) through a piecewise-linear map of old word starts to new ones (`scripts/remap_ep06.py`). Keep each clip's playback length, only move its start.
23. Run Python scripts that print Polish text with `PYTHONIOENCODING=utf-8` or `-X utf8`, and open JSON with `encoding="utf-8"`: the console is cp1250 and fails on `ł`/`ó`.
24. The brief's quoted opening ("Dzień zero cztery!") may again be missing from the voice: check `words.json` first and only trim if the words are really there.

## Status / where to continue (2026-11-10)
- ep01 is done: `out/ep01.mp4` (42.7 s, local only, not in git). Pushed `a4ff93a`.
- ep02 is done (2026-11-11): `out/ep02.mp4` (52.9 s, local only). Details and new contract fields in `LOG.md`.
- ep03 is done (2026-11-13): `out/ep03.mp4` (46.3 s, local only), see `LOG.md`.
- ep04 is done (2026-11-14): `out/ep04.mp4` (47.35 s, local only), see `LOG.md`.
- ep05 is done (2026-11-15): `out/ep05.mp4` (46.7 s, local only), see `LOG.md`.
- ep06 is done (2026-11-16): `out/ep06.mp4` (62.7 s, re-done on the v4 voice, local only), see `LOG.md`.
- Next: ep07 (day 7, `daysLeft` 24). The end card format is not fixed: take it from the owner's prompt each time and make the voice ending match it. Upscale new jpgs 2x first (Real-ESRGAN, see LOG.md).
- Open, not yet decided by the owner: on the ChoiceCard the cards cover Mirek's face (blink not visible); emoji in the phone look small; the music has only been measured, not listened to by Claude.
