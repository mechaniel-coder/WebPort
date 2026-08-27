# LAVA LENS — SEEDANCE 2.0 PASTE SHEET

**6 clips. ~87s generated, cut to ~45s finished.**

Seedance does 15s per generation with multi-shot cuts inside a single clip, takes
`@Image1`–`@Image9` (up to 12 assets), and generates native synced audio. All
three change the structure versus the Grok sheet — beats that needed separate
generations there can live inside one clip here.

---

## REFERENCE ROSTER

Upload these three from `lava-lens-refs/` **on every action clip**. Same slot
numbers every time — if `@Image1` means something different between clips, the
design drifts.

| Slot | File | Its job |
|---|---|---|
| `@Image1` | `ref1-lava-threequarter-left-lavalens.jpg` | Primary product identity — left temple, LavaLens wordmark, island shield |
| `@Image2` | `ref2-lava-front-on.jpg` | Shield silhouette and notched bottom edge |
| `@Image3` | `ref3-lava-threequarter-right-kds.jpg` | Right temple, KDS graffiti mark |

**The single most common Seedance failure is uploading references and never
naming them.** The model does not guess what each one is for. Every prompt below
assigns each slot an explicit job in the text — don't strip that out.

### Colorway

Built around the **red-orange lava mirror on a gloss black frame**. To switch,
swap the reference photos and change "red-orange" in the prompt:

| Colorway | Reference |
|---|---|
| Blue-purple | `alt-blue-threequarter.jpg` |
| Green-teal | `alt-green-threequarter.jpg` |
| Pink-gold, fade frame | `alt-pink-fadeframe-front.jpg` |
| Silver-chrome, fade frame | `alt-silver-fadeframe-front.jpg` |

### Character anchor

The surfer appears in Clips 1, 2 and 3. Generate Clip 1 first, export a clean
frame of his face, and add it as **`@Image4`** on Clips 2 and 3. Do the same for
the skater across Clips 4 and 5. Without this the "same kid" read breaks.

---

## CLIP 1 — BEACH ESTABLISH → DROP-IN (15s)

**Attach:** `@Image1` `@Image2` `@Image3`

```
Reference the sunglasses from @Image1 as the exact eyewear worn throughout, using
@Image2 for the shield lens silhouette and notched bottom edge and @Image3 for the
opposite temple, maintaining consistent frame and lens features in every shot.
Gloss black wraparound shield sunglasses with a red-orange mirrored lens.

Shot 1 (0-5s): Aerial drone descending toward a packed Hawaiian beach at golden
hour hosting a surf competition, a banner strung between two lifeguard towers,
spectators crowded on the wet sand, many wearing the sunglasses. Offshore wind
bends every palm frond the same direction and blows spray backward off the wave
crests.

Shot 2 (5-10s): Cut to a water-level tracking shot of a teenage boy paddling a
shortboard with alternating cupped-hand strokes, accelerating to match the speed
of a rising 25-foot wave before it passes under him. He wears the sunglasses.

Shot 3 (10-15s): He pops from prone to standing in one motion, feet landing
shoulder-width apart, angled down the line across the wave face rather than
straight down it, knees deep and weight forward over the front foot. The fins bite
and throw a thin sheet of water off the tail.

Low sun camera-left, warm rim light, cinematic color, realistic water physics.
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
throwing a fan of spray outward along the arc of the turn.

Shot 2 (6-11s): He redirects up into a top turn off the lip, fins releasing and
re-biting, throwing a heavier sheet of spray outward, then straightens onto the
open face and pumps the board once for speed.

Shot 3 (11-15s): Closer framing as he throws a one-handed shaka toward camera,
his other arm held low for balance. The red-orange mirrored lens catches a hard
flash of low sun through the spray.

Golden hour, sun camera-left, offshore wind blowing spray backward off the lip,
shallow depth of field, realistic fluid dynamics, cinematic.
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

Shot 1 (0-7s): The camera rises and pulls back from the water to reveal a packed
Hawaiian beach crowd erupting in cheers, people jumping and raising fists, dozens
wearing the sunglasses catching low sun across their mirrored lenses. A judge's
tower with flags snapping in offshore wind, waves breaking behind in staggered
sets.

Shot 2 (7-12s): The camera continues rising, then whips hard to the right into
horizontal motion blur and holds there.

Golden hour, sun camera-left, warm cinematic grade.
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
outdoor concrete skatepark at golden hour, the same low warm light, kids skating
bowls and rails, many wearing the sunglasses.

Shot 2 (5-15s): The camera settles into a low tracking shot parallel to a metal
handrail. A teenage skater ollies onto the rail, front and back trucks landing
across it simultaneously, weight centered directly over the board, arms out for
balance. He grinds along the rail and visibly slows as friction bleeds off speed,
then pops off the end and lands on flat ground with his knees compressing to
absorb the impact.

Low sun camera-left, warm color temperature matching the beach footage, concrete
dust in the light, realistic physics, cinematic.
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

Shot 1 (0-7s): A skater balances the back trucks of his board on the coping at the
lip of a concrete bowl, then leans his weight forward over the nose to tip into
the transition. The front wheels touch down first and the board accelerates down
the curved wall under gravity, his knees compressing hard as the curve flattens at
the bottom.

Shot 2 (7-15s): Cut to the same skater riding up a five-foot vertical wall and
ollieing off the coping, board and feet leaving together, the board held level
beneath him. A brief moment of airtime with the horizon tilting, then he lands
back into the transition with his knees bending deeply to absorb the impact.

Golden hour skatepark, low sun camera-left, warm cinematic color, realistic
skateboard physics and body mechanics.
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

Slow cinematic push in on the sunglasses rotating gently against a black
background. A single warm highlight sweeps left to right across the mirrored
shield lens, revealing the red-to-orange lava gradient. Fine sand grains and a few
water droplets on the frame catch the light. Shallow depth of field.

The glasses do not change shape and no text on the frame changes.
Audio: near silence, one low sub-bass hit.
```

> This is the one shot where the wordmark has to survive. Three references at
> three angles is your best shot at it — but check the temple text frame by frame
> before you accept a take. If it garbles, generate the shot clean and composite
> the wordmark in post.

**"Lava Lens" end-card text: add in your editor.** Even with references holding
the temple print, don't ask the model to render new display type.

---

## QC — before you accept any take

**Product**
1. One continuous shield lens with the notched bottom edge — not two round lenses
2. Solid gloss black brow, no invented trim pieces
3. Red-orange mirror, consistent across all six clips
4. Side shield present with island silhouette and vents

**Continuity**
5. Sun camera-left in every clip, beach and skatepark alike
6. Offshore wind — spray blowing backward off wave crests, palms leaning one way
7. Same surfer face in Clips 1–3, same skater in Clips 4–5

**Physics**
8. Spray thrown outward along the arc of a turn, not scattered
9. Grind visibly decelerating
10. Knees compressing on every landing

---

## EDIT NOTES

- **The 180 transition:** Clip 3 ends in a right whip, Clip 4 opens in blur. Cut
  on the blurriest frame. If Clip 4's blur-in doesn't resolve cleanly, generate it
  starting on the skatepark and build the blur as a directional transition in your
  editor instead.
- **Trim each 15s clip to 6–8s.** You're generating ~87s for a ~45s spot; the
  surplus is what lets you cut around soft moments.
- **Native audio is a guide track, not a mix.** It gives you synced SFX worth
  keeping as elements, but a broadcast spot still needs a real music bed and
  sound design pass.
- **Single grade across all six** at the end.
