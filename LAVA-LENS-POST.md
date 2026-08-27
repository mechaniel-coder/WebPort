# LAVA LENS — POST & FINISHING SPEC

For the editor. Assumes six generated clips from `LAVA-LENS-SEEDANCE.md`,
~87 seconds of raw material for a :45 spot.

---

## 1 · ASSEMBLY

| Cut | Source | Take from | Target |
|---|---|---|---|
| 1 | Clip 1 | 0:00–0:05 (aerial) | 4s |
| 2 | Clip 1 | 0:05–0:15 (paddle + drop) | 7s |
| 3 | Clip 2 | 0:00–0:11 (bottom + top turn) | 8s |
| 4 | Clip 2 | 0:11–0:15 (shaka) | 3s |
| 5 | Clip 3 | 0:00–0:12 (crowd + whip) | 6s |
| 6 | Clip 4 | 0:00–0:15 (reveal + grind) | 7s |
| 7 | Clip 5 | 0:00–0:07 (drop-in) | 4s |
| 8 | Clip 5 | 0:07–0:15 (vert air) | 4s |
| 9 | Clip 6 | product hero | 4s |
| — | end card | type over black | 2s |

**≈45s.** Clip 1 and Clip 2 each yield two cuts — Seedance generates the internal
cut, but you'll almost always want to re-time it tighter than it came.

### The 180 transition (cut 5 → 6)

Clip 3 ends whipping right; Clip 4 opens in blur. Find the blurriest frame in each
and cut there. If the two don't marry:

1. Trim both to the last/first *clean* frame instead
2. Drop a directional blur transition between them, angled horizontally, 6–8
   frames
3. Ramp the blur asymmetrically — heavier on the outgoing side than the incoming.
   Real whip pans decelerate into the new subject, they don't blur symmetrically.

---

## 2 · GRADE

**Shot-match first, look second.** Six separate generations will not match. Before
any creative grade, neutralize each clip to a common reference — pick the best
Clip 2 frame as your hero and match the other five to it on white balance, black
level and skin tone. This is the step that makes it read as one shoot.

Then, restraint:

- **Do not push orange-teal.** The instinct on an action spot is a heavy split
  tone, and it will directly undo the photorealism the prompts were built for.
  Golden hour is already in the footage.
- **Lift blacks slightly off zero** (~2–3 IRE). Crushed blacks are a digital tell;
  real film and real broadcast footage rarely clip to pure black.
- **Roll the highlights off, don't clip them.** Blown skies are fine and were
  prompted for in the skate clips — but they should bloom, not hard-clip.
- **Saturation: restrained overall, with one exception.** Let the red-orange lens
  be the most saturated thing in frame. That's the product doing the work, and it
  reads as intentional rather than as a global saturation push.
- **Keep skin tones honest.** If faces drift orange during the grade, you've gone
  too far.

---

## 3 · GRAIN

**One pass over the finished timeline, not per clip.**

Generated grain varies take to take, and mismatched grain between adjacent shots
gives away AI footage faster than almost anything else. Flatten it:

1. Apply mild noise reduction per clip if any single clip came back noticeably
   noisier than the rest — just enough to bring it level
2. Add a single grain layer over the whole cut
3. Resolve: Film Grain OFX, 35mm preset, strength ~0.3–0.4. Premiere/AE: Add
   Grain, 35mm 5219, intensity low, size ~1.0
4. Keep it subtle enough that you only notice it when you toggle it off

---

## 4 · AUDIO

Seedance's native audio is **element material, not a mix.** Keep the synced hits —
fin slice, wheel clatter, the metallic grind, landing chirps — and rebuild
everything else.

**Bed:** one music track running the full :45. Something with a build that lands
its drop on cut 4 (the shaka) and holds through the skate section.

**Structure:**
- Ocean and crowd ambience under cuts 1–5
- Doppler-smear the ocean into wheel clatter across the 180 (cut 5→6)
- Skatepark ambience under cuts 6–8
- **Everything drops out for cut 9** — the product beat is silence plus a single
  low sub-bass hit. The contrast is what sells it
- End card: let the sub-bass ring out

---

## 5 · END CARD

Type over black, composited in the editor — never generated.

- **"Lava Lens"** in the brand's Old English blackletter, white on black
- Sized to sit under the glasses as they settle
- Fade up over ~12 frames, hold, out on the last beat
- If you have the KDS mark as vector, a small lockup beneath it works — keep it
  well under the wordmark's weight

---

## 6 · BROADCAST DELIVERY

Your original brief said TV-ready. If this is actually going to air, these are
requirements, not preferences — stations reject on them:

| Spec | Value |
|---|---|
| Resolution | 1920×1080 or 3840×2160, per station |
| Frame rate | 29.97 fps (US broadcast) — conform from 24fps, don't generate at 30 |
| Scan | Progressive |
| Codec | ProRes 422 HQ or XDCAM HD422 for delivery |
| Audio | 48kHz, 24-bit, stereo |
| **Loudness** | **−24 LKFS ±2** (US, ATSC A/85 / CALM Act) |
| True peak | ≤ −2 dBTP |
| Duration | Exactly :45, frame-accurate |
| Slate | Per station spec, usually 10s bars and tone |

**The loudness spec is the one that trips people up.** The CALM Act makes −24 LKFS
a legal requirement in the US, not a guideline — a spot mixed to sound loud will
be rejected or auto-attenuated. Meter the final mix with a proper loudness meter
(Resolve and Premiere both have one built in) and deliver to spec, not to taste.

For EBU/European delivery it's **−23 LUFS ±1**, true peak ≤ −1 dBTP.

Web and social have no such requirement — if you're cutting a version for those,
mix it separately and louder rather than trying to make one master serve both.

---

## 7 · WHAT I CAN'T DO FROM HERE

No footage exists yet, and this session has no video tooling — I can't grade,
grain, mix or render anything. Everything above is for whoever is at the edit
suite.

What I can still help with once you've generated: rewriting prompts against
takes that came back wrong, retiming the assembly if the clips land differently
than planned, or writing the delivery paperwork.
