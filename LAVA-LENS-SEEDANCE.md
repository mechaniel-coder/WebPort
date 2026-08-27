# LAVA LENS — SEEDANCE 2.0 PASTE SHEET (HYPER-REAL)

**6 clips. ~87s generated, cut to ~45s finished.**

Seedance does 15s per generation with multi-shot cuts inside a single clip, takes
`@Image1`–`@Image9` (up to 12 assets), and generates native synced audio.

---

## HOW THE REALISM IS BUILT

"Hyper realistic" as a bare instruction does very little. Four things actually
move the needle, and all four are written into every prompt below:

**1 · Name the camera and the shutter.** A real optical signature gives the model
something concrete to imitate. The 180-degree shutter at 24fps matters more than
people expect — it produces the motion blur real footage has, and its absence is
why AI action shots read as video-game capture.

**2 · Specify the imperfections.** Perfect is the tell. Real footage has grain,
vignetting, gimbal drift, water on the lens, imperfect framing. These are written
in deliberately.

**3 · Use the format the genre is actually shot in.** Surf coverage comes from
water housings with salt smear on the dome port and long lenses from shore. Skate
video is shot on a fisheye held low and close. Naming the real format pulls the
model toward real reference footage instead of generic stock.

**4 · Hide what the model does badly.** Crowds melt. So the prompts call for two
dozen sharply-defined people with the rest falling into atmospheric haze and
depth-of-field blur, rather than "hundreds of spectators." Depth of field is a
craft tool for concealment, not just a look.

**Words deliberately avoided:** "cinematic" (pulls toward over-graded orange-teal
gloss), "8K," "hyperrealistic," "masterpiece." They're weak tokens that crowd out
specific direction.

---

## REFERENCE ROSTER

Upload these three from `lava-lens-refs/` **on every action clip**, in the same
slots every time. If `@Image1` means something different between clips, the design
drifts.

| Slot | File | Its job |
|---|---|---|
| `@Image1` | `ref1-lava-threequarter-left-lavalens.jpg` | Primary product identity — left temple, LavaLens wordmark, island shield |
| `@Image2` | `ref2-lava-front-on.jpg` | Shield silhouette and notched bottom edge |
| `@Image3` | `ref3-lava-threequarter-right-kds.jpg` | Right temple, KDS graffiti mark |

**The top Seedance failure is uploading references and never naming them.** The
model does not guess what each is for. Every prompt assigns each slot a job — keep
those sentences when you paste.

### Colorway

Built around the **red-orange lava mirror on a gloss black frame**. To switch, swap
the reference photos and change "red-orange" in the prompt:

| Colorway | Reference |
|---|---|
| Blue-purple | `alt-blue-threequarter.jpg` |
| Green-teal | `alt-green-threequarter.jpg` |
| Pink-gold, fade frame | `alt-pink-fadeframe-front.jpg` |
| Silver-chrome, fade frame | `alt-silver-fadeframe-front.jpg` |

### Character anchor

The surfer appears in Clips 1–3. Generate Clip 1 first, export a clean frame of his
face, add it as **`@Image4`** on Clips 2 and 3. Same for the skater across Clips 4
and 5. Skip this and "the same kid" doesn't read.

---

## CLIP 1 — BEACH ESTABLISH → DROP-IN (15s)

**Attach:** `@Image1` `@Image2` `@Image3`

```
Reference the sunglasses from @Image1 as the exact eyewear worn throughout, using
@Image2 for the shield lens silhouette and notched bottom edge and @Image3 for the
opposite temple, maintaining consistent frame and lens features in every shot.
Gloss black wraparound shield sunglasses with a red-orange mirrored lens.

Shot 1 (0-5s): Real drone footage descending toward a Hawaiian beach at golden
hour hosting a surf competition, slight gimbal drift and micro-corrections in the
camera. A banner strung between two lifeguard towers. Roughly two dozen clearly
defined spectators on the wet sand in the foreground wearing the sunglasses, the
rest of the crowd falling away into atmospheric haze and natural depth-of-field
blur. Offshore wind bends every palm frond the same direction and blows spray
backward off the wave crests.

Shot 2 (5-10s): Cut to a water-housing shot at water level, salt smear and water
droplets on the dome port, an occasional splash breaking across the lens. A
teenage boy paddles a shortboard with alternating cupped-hand strokes,
accelerating to match the speed of a rising 25-foot wave before it passes under
him. Wet skin, sun-bleached hair, real skin texture with visible pores. He wears
the sunglasses.

Shot 3 (10-15s): He pops from prone to standing in one motion, feet landing
shoulder-width apart, angled down the line across the wave face rather than
straight down it, knees deep and weight forward over the front foot. The fins bite
and throw a thin sheet of water off the tail.

Shot on ARRI Alexa 35, Zeiss Supreme Primes, 24fps at 180-degree shutter for
natural motion blur, T2.8. Real sports-documentary broadcast footage, not
stylized: fine film grain, subtle lens vignetting, natural highlight rolloff, low
sun camera-left. Photorealistic skin with natural asymmetry. No airbrushed or
plastic surfaces, no CGI look, no oversaturation.
Audio: crowd murmur and wind, building to the roar of breaking water.
```

---

## CLIP 2 — BOTTOM TURN, TOP TURN, SHAKA (15s)

**Attach:** `@Image1` `@Image2` `@Image3` `@Image4` *(surfer's face from Clip 1)*

```
Reference the sunglasses from @Image1 as the exact eyewear, using @Image2 for the
shield lens silhouette and @Image3 for the opposite temple. Reference @Image4's
face and build as the surfer, maintaining consistent facial features throughout.

Shot 1 (0-6s): Jet-ski tracking alongside a teenage surfer driving through a
bottom turn on a large wave face, inside rail buried, inside shoulder dropped,
throwing a fan of spray outward along the arc of the turn. Handheld camera with
real micro-instability, water beading on the lens.

Shot 2 (6-11s): He redirects up into a top turn off the lip, fins releasing and
re-biting, throwing a heavier sheet of spray outward, then straightens onto the
open face and pumps the board once for speed.

Shot 3 (11-15s): Closer framing as he throws a one-handed shaka toward camera —
a natural, correctly proportioned five-fingered hand, thumb and little finger
extended, three middle fingers folded — his other arm held low for balance. The
red-orange mirrored lens catches a hard flash of low sun through the spray. Wet
skin, salt residue, sun-bleached hair, real pores and natural facial asymmetry.

Shot on ARRI Alexa 35 from a water housing, 24fps at 180-degree shutter for
natural motion blur, T2.8, shallow depth of field. Real surf-broadcast footage,
not stylized: fine film grain, subtle vignetting, natural highlight rolloff,
golden hour with sun camera-left, offshore wind blowing spray backward off the
lip. Realistic fluid dynamics. No plastic skin, no CGI look, no oversaturation.
Audio: spray hiss, fins slicing water, distant crowd.
```

---

## CLIP 3 — CROWD CHEER → WHIP OUT (12s)

**Attach:** `@Image1` `@Image2` `@Image3`

```
Reference the sunglasses from @Image1 as the exact eyewear worn by the crowd,
using @Image2 for the shield lens silhouette, maintaining consistent frame and
lens features. Gloss black wraparound shield sunglasses with a red-orange mirrored
lens.

Shot 1 (0-7s): The camera rises and pulls back from the water to reveal a Hawaiian
beach crowd erupting in cheers. About twenty clearly defined people in the
foreground, jumping and raising fists, wearing the sunglasses with low sun
catching their mirrored lenses; everyone behind them falls into natural
depth-of-field blur and heat haze. A judge's tower with flags snapping in offshore
wind, waves breaking behind in staggered sets. Real broadcast crane move with
slight operator hesitation.

Shot 2 (7-12s): The camera continues rising, then whips hard to the right into
horizontal motion blur and holds there.

Shot on ARRI Alexa 35, 24fps at 180-degree shutter, T2.8. Real sports-broadcast
documentary footage, not stylized: fine film grain, subtle vignetting, natural
highlight rolloff, golden hour with sun camera-left. Photorealistic faces with
natural variation in age, build and expression. No plastic skin, no CGI look, no
oversaturation.
Audio: crowd cheer peaking, an air horn, then the sound smearing away.
```

---

## CLIP 4 — SKATEPARK REVEAL → RAIL GRIND (15s)

**Attach:** `@Image1` `@Image2` `@Image3`

```
Reference the sunglasses from @Image1 as the exact eyewear, using @Image2 for the
shield lens silhouette and @Image3 for the opposite temple, maintaining consistent
frame and lens features.

Shot 1 (0-5s): Opening in horizontal motion blur that resolves into a sunlit
outdoor concrete skatepark at golden hour, the same low warm light as the beach.
Kids skating bowls and rails, many wearing the sunglasses, a dozen defined in the
foreground and the rest soft in depth-of-field blur.

Shot 2 (5-15s): Shot the way skate videos are actually filmed — a 16mm fisheye
lens held low and close to the ground, the operator skating alongside, real
handheld instability and slight framing corrections. A teenage skater ollies onto
a metal handrail, front and back trucks landing across it simultaneously, weight
centered directly over the board, arms out for balance. He grinds along the rail
and visibly slows as friction bleeds off speed, then pops off the end and lands on
flat ground with his knees compressing to absorb the impact.

24fps at 180-degree shutter for natural motion blur. Real skate-video
documentary footage, not stylized: fine grain, slightly blown-out sky, concrete
dust in the light, natural highlight rolloff, low sun camera-left matching the
beach footage. Photorealistic skin and clothing with real fabric movement and
wear. No plastic surfaces, no CGI look, no oversaturation.
Audio: ocean roar giving way to wheel clatter, then a sharp metallic scrape and
wheels hitting concrete.
```

---

## CLIP 5 — BOWL DROP-IN → VERT AIR (15s)

**Attach:** `@Image1` `@Image2` `@Image3` `@Image5` *(skater's face from Clip 4)*

```
Reference the sunglasses from @Image1 as the exact eyewear, using @Image2 for the
shield lens silhouette. Reference @Image5's face and build as the skater,
maintaining consistent facial features.

Shot 1 (0-7s): A 16mm fisheye held low inside a concrete bowl, real handheld
instability. A skater balances the back trucks of his board on the coping at the
lip, then leans his weight forward over the nose to tip into the transition. The
front wheels touch down first and the board accelerates down the curved wall under
gravity, his knees compressing hard as the curve flattens at the bottom.

Shot 2 (7-15s): Cut to a long lens from across the park as the same skater rides
up a five-foot vertical wall and ollies off the coping, board and feet leaving
together, the board held level beneath him. A brief moment of airtime with the
horizon tilting, then he lands back into the transition with his knees bending
deeply to absorb the impact.

24fps at 180-degree shutter for natural motion blur. Real skate-video documentary
footage, not stylized: fine grain, slightly blown-out sky, natural highlight
rolloff, golden hour with sun camera-left. Photorealistic skin with visible pores
and natural asymmetry, real fabric movement, scuffed and worn skate shoes and
deck. Realistic skateboard physics and body mechanics. No plastic surfaces, no
CGI look, no oversaturation.
Audio: wheels rolling on concrete, silence during the airtime, a sharp landing
chirp.
```

---

## CLIP 6 — PRODUCT HERO (10s)

**Attach:** `@Image1` `@Image2` `@Image3`

```
Reference the sunglasses from @Image1 as the exact product, using @Image2 for the
front-on shield silhouette and @Image3 for the right temple. Preserve every detail
exactly: the gloss black wraparound frame, the single red-orange mirrored shield
lens, the white Old English "LavaLens" wordmark on the left temple, the KDS
graffiti mark on the right temple, and the white Hawaiian island chain with four
small square vents on the side shields.

Slow macro push in on the sunglasses rotating gently against a black background.
A single warm highlight sweeps left to right across the mirrored shield lens,
revealing the red-to-orange lava gradient. Real studio softbox reflections curve
across the lens surface. Fine sand grains, a few water droplets, faint fingerprint
smudge and micro-scratches on the frame catch the light — a real object that has
been handled, not a clean render.

Shot on a 100mm macro lens at T4, shallow depth of field with natural bokeh
falloff, fine film grain, natural highlight rolloff. Real product photography for
broadcast, not a CGI render. The glasses do not change shape and no text on the
frame changes.
Audio: near silence, one low sub-bass hit.
```

> The imperfections are doing real work here. A flawless product render reads as
> CGI instantly; a fingerprint and a micro-scratch are what say "photographed."

**Watch the temple text frame by frame** before accepting a take. Three references
at three angles is your best shot at holding blackletter print — if it garbles,
generate clean and composite the wordmark in post. **The "Lava Lens" end-card type
goes in your editor regardless.**

---

## QC — before you accept any take

**Realism tells, in the order they give it away**
1. **Faces** — real pores, asymmetry, natural expression. Smooth or waxy → reject
2. **Motion blur** — fast movement should blur naturally, not strobe or smear
3. **Crowds** — background people holding shape, not melting or duplicating
4. **Hands** — five fingers, correct proportion. Check the shaka closely
5. **Skin and fabric** — wet skin beading, clothing with real weight and wear

**Product**
6. One continuous shield lens with the notched bottom edge, not two round lenses
7. Solid gloss black brow, no invented trim pieces
8. Red-orange mirror consistent across all six clips
9. Side shield present with island silhouette and vents

**Continuity**
10. Sun camera-left in every clip, beach and skatepark alike
11. Offshore wind — spray blowing backward off crests, palms leaning one way
12. Same surfer face in Clips 1–3, same skater in Clips 4–5

**Physics**
13. Spray thrown outward along the arc of a turn, not scattered
14. Grind visibly decelerating
15. Knees compressing on every landing

---

## EDIT NOTES

- **Grade for realism, not gloss.** The instinct on a spot like this is a heavy
  orange-teal push, which will undo the work these prompts are doing. Keep the
  grade light and let the golden hour carry it.
- **Match grain across all six clips** in post. Mismatched grain between shots is
  a bigger realism tell than most people expect, and generated grain varies
  take to take. A single grain pass over the finished cut beats whatever each
  clip came with.
- **The 180 transition:** Clip 3 ends in a right whip, Clip 4 opens in blur. Cut
  on the blurriest frame. If Clip 4's blur-in doesn't resolve cleanly, generate it
  starting on the skatepark and build the blur as a directional transition in your
  editor instead.
- **Trim each 15s clip to 6–8s.** You're generating ~87s for a ~45s spot; the
  surplus is what lets you cut around soft moments.
- **Native audio is a guide track, not a mix.** Useful synced SFX to keep as
  elements, but a broadcast spot needs a real music bed and sound design pass.
