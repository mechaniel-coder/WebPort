# LAVA LENS — "SEE THE SHRED"

**Client:** Lava Lens / Kidz Dat Shr3d
**Format:** :45 broadcast spot, cut from 7 × 10-second AI-generated clips
**Generator:** Grok Imagine (10s max per clip)
**Finished runtime:** ~42–45s after trimming each clip to its best 5–7 seconds

---

## 1. PRODUCT LOCK

Paste this block verbatim into **every** action-shot prompt. Do not paraphrase it
between clips — consistent wording is what keeps the design from drifting.

> gloss black single-shield wraparound sunglasses, one continuous curved lens
> with a scalloped notch cut at the nose bridge, thin chrome trim line along the
> top brow, flat black side-shield panels at the hinges with small rectangular
> vent slots, mirrored lens with a lava gradient — deep red-purple at the edges
> warming to molten orange-amber through the center

**Referred to below as `[PRODUCT LOCK]`.**

### What the generator will and won't hold

| Design element | Survives generation? | How to handle |
|---|---|---|
| Shield silhouette + nose notch | Yes | Prompt wording alone |
| Lava gradient lens | Yes | Prompt wording alone |
| Chrome brow trim | Usually | Prompt wording alone |
| Side-shield vents | Sometimes | Acceptable loss at action scale |
| Hawaiian island silhouette | No | Too small to read; skip in action shots |
| "LavaLens" blackletter wordmark | **No** | Hero shot only, composited in post |
| KDS graffiti temple mark | **No** | Hero shot only, composited in post |

This is not a failure of prompting. No current video model reliably renders a
specific typeface or logo. The fix is structural: the design only needs to be
*exact* in the hero shot, and the hero shot is generated from the real product
photo (Clip 7), with the wordmark composited on top in the edit.

---

## 2. CONTINUITY BIBLE

Every clip must match on these or the cut falls apart:

- **Time of day:** golden hour, sun low and camera-left
- **Sun behavior:** hard rim light on subjects, warm orange flares across mirrored lenses
- **Wind:** **offshore** (blowing from land out to sea) — this is what grooms wave
  faces smooth and blows spray *backward* off the crest. Onshore wind produces
  mushy, crumbling waves and reads as amateur footage.
- **Color temp:** warm, ~5000K, carried identically into the skatepark
- **Wave sets:** arrive in groups of 2–3 with lulls between, never evenly spaced
- **Aspect:** 16:9, cinematic

---

## 3. SHOT LIST

### CLIP 1 — Beach Establish (0:00–0:06)
**Camera:** Drone, high wide, slow descending push-in

```
Golden hour aerial drone shot descending toward a packed Hawaiian beach hosting
a surf competition. A banner strung between two lifeguard towers. Spectators
crowd the wet sand in beach chairs and standing, many wearing [PRODUCT LOCK].
Offshore wind holds the wave faces smooth and blows spray backward off the
crests. Palm fronds all bend in the same direction. Heat shimmer rises off the
sand. Low sun flares across the mirrored shield lenses in the crowd. Reef break
peeling in the background, wave sets arriving in groups with lulls between.
```

**Physics:** Offshore wind is the single biggest tell of authentic surf footage.
It holds the wave face vertical and blows the spray back over the top.

**Audio:** Crowd murmur, wind, distant PA echo, low bass building.

---

### CLIP 2 — Paddle-In and Drop (0:06–0:13)
**Camera:** Water-level tracking, slight handheld shake, widening as he drops

```
Water-level tracking shot of a teenage surfer paddling hard with alternating
cupped-hand strokes, accelerating to match the speed of a rising 25-foot wave
before it passes under him. He pops from prone to standing in one fluid motion,
feet landing shoulder-width apart across the board, already angled down the line
toward the shoulder of the wave rather than straight down the face. Knees deep,
weight forward over the front foot on the steep drop. Fins bite and throw a thin
sheet of water off the tail. Spray blows backward off the lip in the offshore
wind. He wears [PRODUCT LOCK].
```

**Physics:** A surfer has to match the wave's forward speed to catch it — show
the paddle cadence *speeding up* as the face steepens. On a wave this size the
rider angles across immediately; going straight down a 25-foot face outruns the
wave and pitches the nose under.

**Audio:** Water slap, hard breathing, rising rumble.

---

### CLIP 3 — Bottom Turn, Top Turn, Shaka (0:13–0:20)
**Camera:** Jet-ski tracking alongside, matching board speed, slight lens compression

```
Tracking alongside a surfer sinking the inside rail into a hard bottom turn, the
board compressed into the wave face, inside shoulder dropped, a fan of spray
thrown outward along the arc of the turn. He redirects up into a top turn off
the lip, fins releasing then re-biting, throwing a heavier sheet of spray
outward. He straightens onto the open face, pumps the board once for speed, then
throws a one-handed shaka toward camera with his other arm held low for balance.
The mirrored shield lens catches a hard flash of low sun through the spray.
[PRODUCT LOCK].
```

**Physics — the shot most generators get wrong:** spray must be thrown *outward
along the arc of the turn*, not scattered randomly. The board visibly compresses
into the face on the bottom turn (rail engagement + fin bite), then springs back
up. Keep the shaka one-handed — both hands up while riding isn't stable.

**Audio:** Spray hiss, fin slice, crowd swelling in from the next clip.

---

### CLIP 4 — Crowd Cheer → Whip Out (0:20–0:27)
**Camera:** Crane rise and pull-back, **ending in a fast right whip-pan into blur**

```
Camera pulls back and rises from the surfer to reveal a packed beach erupting in
cheers, people jumping and raising fists, dozens of spectators wearing [PRODUCT
LOCK] catching the low sun in unison. A judge's tower with flags snapping in the
offshore wind. Waves continue breaking in the background in staggered sets. In
the final second the camera whips hard to the right into horizontal motion blur.
```

**Audio:** Crowd cheer peaks, air horn, then Doppler smear.

---

### CLIP 5 — Whip In → Skatepark → Rail Grind (0:27–0:34)
**Camera:** **Starts in horizontal motion blur**, resolves, settles into a low tracking dolly

```
Opening in horizontal motion blur that resolves into a sunlit outdoor concrete
skatepark in the same low golden-hour light, warm color temperature, kids
skating bowls and rails in the background, many wearing [PRODUCT LOCK]. Camera
settles into a low tracking shot parallel to a metal handrail as a skater ollies
onto it, front and back trucks landing across the rail simultaneously, body
weight centered directly over the board, arms out for balance, knees bent. The
board slides along the rail and visibly slows as friction bleeds off speed, then
pops off the end with a small ollie and lands on flat ground, knees compressing
to absorb the impact.
```

> **The 180 is made in the edit, not in the generator.** Do not ask one clip to
> swap environments mid-shot — models fail at this almost every time. Generate
> Clip 4 ending in blur and Clip 5 opening in blur, then cut between them on the
> blurriest frame. Match the light direction and color temperature exactly and it
> reads as one continuous camera move.

**Physics:** Grinds always decelerate — friction converts speed into heat and
sound, so exit speed is visibly lower than entry. Weight sits over the trucks,
not leaned back.

**Audio:** Ocean roar Doppler-smears into wheel clatter, then a sharp metallic scrape.

---

### CLIP 6 — Bowl Drop-In + Vert Air (0:34–0:41)
**Camera:** Low tracking, then a fast whip-pan right to the second skater

```
Low tracking shot in the same golden-hour skatepark. A skater balances the back
trucks on the bowl coping, then leans weight forward over the nose to tip the
board into the transition — front wheels touch down first as gravity pulls the
board down the curved wall, knees compressing hard as the curve flattens and
g-force builds. Fast whip-pan right to a second skater riding up a five-foot
vertical wall, ollieing off the coping with board and feet leaving together, the
board held level by even foot pressure set before takeoff, a brief moment of
airtime with the horizon tilting, then a knee-bent landing back into the
transition, wheels chirping against the ramp. Both wear [PRODUCT LOCK].
```

**Physics:** No steering input is possible in the air. The board stays level
because of foot pressure set *before* leaving the coping, not adjusted mid-flight.
Landings must show clear knee compression — stiff-legged landings read as fake.
Vert height comes from speed carried into the transition; a skater cannot gain
energy mid-air, only redirect it.

**Audio:** Roll-up rumble, silence on the airtime, sharp landing chirp.

---

### CLIP 7 — Product Hero (0:41–0:45)
**METHOD: image-to-video from the real product photo. Do not text-to-video this shot.**

**Input image:** the three-quarter hero photo showing the LavaLens wordmark and
the full lens gradient.

```
Slow cinematic push in on the sunglasses. A single warm highlight sweeps left to
right across the mirrored shield lens, revealing the red-to-orange lava gradient.
Fine sand grains and a few water droplets on the frame catch the light. The
camera drifts slightly with shallow depth of field. The background falls away to
black. Nothing else in the frame moves and the glasses do not change shape.
```

> The final clause is load-bearing. Image-to-video models morph and re-invent
> product geometry if you don't explicitly pin it. If the frame still warps,
> shorten the move — a 2-second push holds far better than a full rotation.

**"Lava Lens" text: add in post, never generate it.** Your wordmark is a specific
blackletter face; any generator will garble it. Drop it in as a clean type layer
under the glasses on black in Premiere, After Effects, Resolve, or CapCut.

**Audio:** Everything drops out. One low sub-bass hit and a glass-clink as the
type lands.

---

## 4. GROK WORKFLOW NOTES

- **Generate a still first, then animate it.** For Clips 1–6, make the key frame
  as an image, check that the glasses look right, *then* animate. Fixing the
  design at the still stage costs one generation; fixing it after animating costs
  many.
- **Keep prompts tight.** Long prose gets truncated in practice — detail at the
  end of an overlong prompt is the first thing dropped. Each prompt above is
  sized to survive.
- **Generate 3–4 takes per clip.** Roughly one in three will have clean physics.
  Budget for this; it is normal.
- **Cut each 10s clip down to 5–7s.** AI clips degrade toward the end — motion
  drifts and faces melt. The first two-thirds is almost always the usable part.
- **Match color in post.** Even with identical prompts, clips drift in
  temperature. A single grade pass across all seven is what makes it read as one
  spot instead of seven generations.

## 5. PICKUPS WORTH GENERATING

Cheap inserts that give the editor somewhere to cut when a clip goes bad:

- Close-up: a kid pulling the glasses down the bridge of their nose, grinning
- Macro: water beading and running off the shield lens
- Reverse angle: the crowd reflected in the mirrored lens
- Low angle: skate wheels rolling past camera into the sun
