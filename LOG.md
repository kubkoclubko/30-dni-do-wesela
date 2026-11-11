# Log

## ep02 (2026-11-11)
- Voice from Downloads (43.7 s), words.json via transcribe + fix_words (only fix: Żabki). Video 46.7 s (card 3 s after the voice).
- All ep02 jpgs upscaled 2x with Real-ESRGAN ncnn (realesr-animevideov3, exe in C:\Users\ondri\tools\realesrgan) -> *_2x.jpg.
- Clips (muted, `shot.clip`): drain 1.22-2.64 s (bubble on "zatkał"), mirror 0.85-2.23 s (zoom-in on "przestraszył"), mama 0.45-2.48 s (bang on "jaskiniowca"). mp4s are gitignored, so they stay local.
- New contract fields: shot.cut / spin / clip / fog / lids+skin, layer "vapor"; vote.stamp; phone drafts / shake / y / scale; chat crop (old photo).
- Painted blink (lids drawn in the ShotGL shader) on s12 + s14; s09 has closed eyes already. Opening shot uses s02 from ep01 (no s01_room_wide exists).
- End: CommentCard (owner's choice) although the voice asks "Golić brodę czy zostawić?".
- SFX: pop on the stamp, synthesised water / gurgle / buzz (scripts/make_sfx.py), blip on 👍.
