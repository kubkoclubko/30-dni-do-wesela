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
src/components/         Shot, Overlays, Hud, VoteResult, Captions, Phone, ChoiceCard, CommentCard
episodes/epXX.json      one file per episode (shots, HUD day, vote, phone, end card)
public/epXX/            images (sNN_name.png + sNN_name_blink.png), voice.mp3, words.json, fix.json
public/shared/          sprites (flies), icons, sfx/, fonts/, music.mp3 (only for --music)
scripts/r.sh            still | preview | final (logs to out/, prints tail -20)
scripts/transcribe.py   faster-whisper → words_raw.json (lang pl, model medium)
scripts/fix_words.py    words_raw.json → words.json (energy onsets, spellings from fix.json)
scripts/short_qa.py     QA of the final mp4 (LUFS, peak, black/white/frozen frames, contact sheets)
out/                    renders (gitignored)
```

## New episode workflow
1. Voice from ElevenLabs → `public/epXX/voice.mp3`. Check the end for a garbled tail.
2. `python scripts/transcribe.py public/epXX/voice.mp3 public/epXX/words_raw.json` → `python scripts/fix_words.py public/epXX` (needs `voice.wav`: `ffmpeg -i voice.mp3 -ar 48000 voice.wav`).
3. `episodes/epXX.json` (shots by sentence starts) + images in `public/epXX/`.
4. `bash scripts/r.sh still epXX <frame>` → `bash scripts/r.sh preview epXX` → `bash scripts/r.sh final epXX`.

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
