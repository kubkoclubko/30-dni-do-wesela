# 30 dni do wesela

A Polish vertical (1080×1920, 30 fps) 2D comic series for Reels/TikTok in Remotion. Each episode is static AI images with camera moves (push/pull/pan/tilt/dutch, whip), a few small animated layers (blink, flies, stink, breathing), a HUD, captions, a phone chat and an end card asking viewers to vote. No three.js, no 3D. The visual reference account is @30dniglowup. The hero is Mirek (34), who has 30 days to sort himself out before his sister Ola's wedding. Viewers vote in the comments on what he does next.

Repo: `kubkoclubko/30-dni-do-wesela` (private). The older 3D project is `C:\Users\ondri\shorts` (`kubkoclubko/ai-short-videos`).

## Folder structure
```
CLAUDE.md
remotion.config.ts      angle + concurrency 2
src/index.ts, Root.tsx  Root turns every episodes/epXX.json into a composition "epXX" (require.context)
src/types.ts            the episode JSON contract
src/Episode.tsx         builds one episode from its JSON
src/components/         Shot, ShotGL (WebGL warp: breathing + nods + blink), Overlays, Hud, VoteResult, Captions, Phone, ChoiceCard, CommentCard, Sfx
src/camera.ts           camera planner: ease-in, continues across shots of the same image, auto-limited to <= 1.8 px/frame
episodes/epXX.json      one file per episode (shots, HUD day, vote, phone, end card)
public/epXX/            images (sNN_name.png + sNN_name_blink.png), voice.mp3, words.json, fix.json
public/shared/          sprites (flies), icons, sfx/, fonts/, music.mp3 (only for --music)
scripts/r.sh            still | preview | final (logs to out/, prints tail -20)
scripts/transcribe.py   faster-whisper → words_raw.json (lang pl, model medium)
scripts/fix_words.py    words_raw.json → words.json (energy onsets, spellings from fix.json)
scripts/make_rig.py     ep.rigs (outline/head/neck/feet per figure) -> public/epXX/rig/*_figN.png soft masks
scripts/check_cam.ts    node scripts/check_cam.ts episodes/epXX.json: max camera jump per shot (must be <= 2 px)
scripts/make_music.py   original piano theme -> public/shared/music.mp3 (-16 LUFS), see MUSIC_LICENSE.txt
scripts/short_qa.py     QA of the final mp4 (LUFS, peak, black/white/frozen frames, contact sheets)
out/                    renders (gitignored)
```

## New episode workflow
1. Voice from ElevenLabs → `public/epXX/voice.mp3`. Check the end for a garbled tail.
2. `python scripts/transcribe.py public/epXX/voice.mp3 public/epXX/words_raw.json` → `python scripts/fix_words.py public/epXX` (needs `voice.wav`: `ffmpeg -i voice.mp3 -ar 48000 voice.wav`).
3. `episodes/epXX.json` (shots by sentence starts) + images in `public/epXX/`.
4. Characters that should breathe/nod: add `rigs` to the JSON (outline, head, neck, feet, facing; read them off a 5 % grid of the image), then `python scripts/make_rig.py episodes/epXX.json`.
5. `node scripts/check_cam.ts episodes/epXX.json` (must print OK).
6. `bash scripts/r.sh still epXX <frame>` → `bash scripts/r.sh preview epXX` → `bash scripts/r.sh final epXX`.

## Token-saving rules
1. Every render and still runs with `--gl=angle`, and `remotion.config.ts` has angle + concurrency 2. On the GTX 1660 SUPER, 1–2 threads are fastest and 4 or more are slower.
2. `npx remotion gpu` wrongly reports "Disabled" or `ERR_FAILED`, so ignore it. Check the GPU by the WEBGL_RENDERER string inside a render.
3. Give time estimates in minutes. The 3D short took ~3–4 min at 540×960 and ~3.5–5.5 min for the 2K final. 2D is faster.
4. If a 2K export is ever needed, use exactly `--scale 1.3333333333333333`. Remotion rejects 1.3333.
5. Captions: faster-whisper (`scripts/transcribe.py`, multilingual model, `pl`) → `words_raw.json` → `fix_words.py` (spellings and hand fixes in `public/epXX/fix.json`) → `words.json`.
6. ElevenLabs once appended ~2 s of garbled speech. Before Whisper, check the end of the voice and trim it with a fade if needed. Keep the original.
7. Mix: master −15 LUFS, true peak ≤ −1 dBTP. For the `--music` version, measure the SFX against the music at each cue after the mix, or they get lost in it.
8. Claude checks the stills itself and the owner reviews the low-res preview. No verifier or parallel agents.
9. Never judge camera motion on stills. That is what the 10 s preview at `--scale=0.5` is for.
10. A still and the same frame in the video can differ. For the final QA, pull frames from the mp4 with ffmpeg.
11. The final QA is `scripts/short_qa.py` (LUFS, peaks, black/white/frozen frames).
12. Hook: frame 0 is never an empty wide. Show a character in a medium shot, with something moving in the first second.
13. Something new appears on screen every ~1–1.5 s. A reaction lands 0–3 frames before its word.
14. Keep a short `LOG.md` with bullets for each episode, so the history never needs re-reading.
15. Save to Graphify (`remember`, repo `kubkoclubko/30-dni-do-wesela`) only final decisions and real gotchas, a few per session at most, with tags and `occurred_at`. Before new work, run `recall`.
16. New Graphify notes must be approved in Memory > Needs review. Until then only `recall(profile='audit')` shows them.
17. No secrets or personal data in code, notes or commits.
18. Learn code structure through Graphify (`graphify_find`, `query_graph`), not by reading whole files. Don't re-read files you wrote yourself.
19. Send render and npm output to a file and show only `tail -20`.
20. Check with `npx remotion still --scale=0.4` (`scripts/r.sh still`), not a full render. At most 3 stills per step.
21. The series is data-driven: a new episode is `episodes/epXX.json` + images + audio and must never need a code change.
22. Keep chat replies short and don't repeat code that is already in files.

## Learnings (ep01, 2026-11-10)
1. AI `_blink` variants differ in every pixel, not just the eyes. Set `blinkBox` (eye region in source px) plus the episode's `imgSize`; only that feathered crop is pasted.
2. Whisper `medium` (pl) needs a `fix.json` every time. In ep01: numbers come out as digits ("34" → two words, split by `fix`), hyphenated words split ("hot" "dogi" → `merge`), and some words are misheard ("imię" → "inie", "czego" → "tego"). The first run downloads the model (~1.5 GB).
3. With a low-res source (s04 at 768 px, max zoom 1.05), a pan clamps against the image edge and freezes. Keep `focus`/`to` within the visible margin (±(1-1/zoom)/2 around 0.5). `short_qa.py` catches it under "frozen spans".
4. Render times on the GTX 1660 SUPER: a whole 43 s episode at 1080×1920 takes ~80 s including QA, the 0.5 preview of the whole episode ~50 s, a wav of the audio only ~18 s.
5. SFX sit ~10 LU under the voice (voice −14 LUFS). The slide whistle after the voice ends is ~6 LU under. Levels live only in `public/shared/sfx/sfx.json`.

## Learnings (2026-11-10, motion + music pass)
6. Camera rule (owner): every move eases in (bezier 0.45,0,0.55,1) but never out, so it is still moving at the cut. A push is at most ×1.08 per shot, a shot of the same image continues the previous one with no jump, and nothing moves more than 2 px per frame inside a shot. `src/camera.ts` scales oversized moves down automatically, so big tilts and close-crop splits no longer happen. Only punch, shake, `keys` (with motion blur) and whip are exempt; the owner wants punch and shake only on the 1–2 punchlines.
7. Character motion is a WebGL warp (`ShotGL.tsx`): soft masks from `make_rig.py`, breathing on a 3 s cycle up to 5 px at the head and 0 at the feet, plus a 2.5° nod every 2–3 s. At most 2 figures per image. Blink is drawn in the same shader, so the eyes move with the head. Shots of unrigged images use the plain DOM image.
8. Music is now part of the main render (`"music": true` in the episode): our own piano theme from `scripts/make_music.py`, synthesised in numpy because fluidsynth isn't installed. Ducked −20 dB under the voice, full volume once the voice ends, 2 s fade-out.
9. Tooling gotchas: Python under Git Bash can't open `/tmp/...` paths (use a project path). Node 26 runs `.ts` directly (`node scripts/check_cam.ts`). `gh` isn't logged in, so a new repo is created on github.com and pushed with plain git.

## Status / where to continue (2026-11-10)
- ep01 is done: `out/ep01.mp4` (42.7 s, local only, not in git). Pushed `a4ff93a`.
- Next: ep02 (day 2, `daysLeft` 29, `vote` with the result Prysznic/Fryzjer, end card `comment` or `choice`). It needs `episodes/ep02.json`, images, `voice.mp3` and `rigs`; no code changes.
- Open, not yet decided by the owner: on the ChoiceCard the cards cover Mirek's face (blink not visible); emoji in the phone look small; the music has only been measured, not listened to by Claude.
