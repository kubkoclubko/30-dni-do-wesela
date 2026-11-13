# Log

## ep02 (2026-11-11)
- Voice from Downloads (43.7 s), words.json via transcribe + fix_words (only fix: Żabki). Card stays 3 s after the voice.
- All ep02 jpgs upscaled 2x with Real-ESRGAN ncnn (realesr-animevideov3, exe in C:\Users\ondri\tools\realesrgan) -> *_2x.jpg.
- Clips (muted, `shot.clip`): drain 1.22-2.64 s (bubble on "zatkał"), mirror 0.85-2.23 s (zoom-in on "przestraszył"), mama 0.45-2.48 s (bang on "jaskiniowca"). mp4s are gitignored, so they stay local.
- New contract fields: shot.cut / spin / clip / fog / lids+skin, layer "vapor"; vote.stamp; phone drafts / shake / y / scale; chat crop (old photo).
- Painted blink (lids drawn in the ShotGL shader) on s12 + s14; s09 has closed eyes already. Opening shot uses s02 from ep01 (no s01_room_wide exists).
- End: CommentCard. The original "Co dalej? Golić brodę czy zostawić?..." was cut at 39.98 s (original kept as voice_full.mp3) and a new ElevenLabs ending appended at 40.05 s ("Co Mirek ma zrobić dalej? ... najwięcej lajków, zdecyduje..."). Video 52.9 s.
- SFX: pop on the stamp, synthesised water / gurgle / buzz (scripts/make_sfx.py), blip on 👍.
- 2026-11-12 fix: new drain jpg (already 2K, used as is) + new drain clip (from 1.03 s, bubble pops on "zatkał"); both came from Downloads because public/ep02 still held the old files. s14_phone_towel replaced everywhere by s14_phone (bathrobe, upscaled 2x, same face position, so the same lids/rig). End: CommentCard has no img, the rigged s14_phone shot keeps running underneath and slides down 480 px (`end.shotY`), captions at y 1790 (`end.capY`).

## ep03 (2026-11-13)
- Voice from Downloads; the opening was replaced by a second ElevenLabs take ("ponad dwa tysiące") spliced at 1.80 s (+0.53 s for everything after it). Original kept as voice_v1.mp3. 46.3 s, -15 LUFS after loudnorm.
- Intro over the s17 wide: 2 000 OBSERWUJĄCYCH + DZIĘKI! with confetti, then an IG comment card (@bvrtek_wpr_g, FRYZJER, 896 likes) with the WYGRYWA! stamp.
- Hook: free zoom 1.0 -> 2.0 on Mirek's face (2.5 s), then the s17 clip (1.5-2.6 s) with punch + shake on "uciekł". s20 clip in three short cuts + jpg, hair layer, shake. s21 flash + hair reveal, keys zoom to the beard on "z jaskini". s22 camera flash, cut in place to s23 at the same framing, phone chat with the selfie crop, punch on the "Kasia" header.
- All ep03 jpgs upscaled 2x (realesr-animevideov3); rigs + painted lids on s17-s23 (Grażyna rigged on s18/s19/s21, without lids). SFX (5, autoSfx off): pop, haircut (new), whoosh, shutter (new), blip.
